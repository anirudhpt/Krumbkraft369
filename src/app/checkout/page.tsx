'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/lib/userService';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { generateWhatsAppLink } from '@/lib/phoneUtils';
import { sendOrderConfirmationToCustomer } from '@/lib/whatsappUtils';
import { webhookService } from '@/lib/webhookService';
import { loadGoogleMapsScript, isGoogleMapsLoaded } from '@/lib/googleMapsLoader';

interface CartItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  selectedOption?: {
    name: string;
    priceAdjustment: number;
  };
}

interface Address {
  id?: string;
  userId: string;
  fullAddress: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

interface FinanceRecord {
  uuid: string; // Unique identifier for mapping
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedOption?: {
      name: string;
      priceAdjustment: number;
    };
  }[];
  totalAmount: number;
  deliveryAddress: {
    fullAddress: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  deliveryDate: string;
  orderTimestamp: unknown; // Firebase serverTimestamp
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'placed' | 'out_for_delivery' | 'delivered';
  paymentMethod: 'whatsapp_order' | 'online' | 'cash_on_delivery';
}

interface OrderStatus {
  uuid: string; // Unique identifier for mapping
  orderId: string;
  customerName: string;
  customerPhone: string;
  status: 'placed' | 'out_for_delivery' | 'delivered';
  deliveryDate: string;
  deliveryAddress: string;
  totalAmount: number;
  orderTimestamp: unknown; // Firebase serverTimestamp
  statusHistory: {
    status: string;
    timestamp: string; // ISO string timestamp
    notes?: string;
  }[];
}

declare global {
  interface Window {
    google: typeof google;
  }
}

function CheckoutContent() {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    fullAddress: '',
    area: '',
    city: '',
    pincode: '',
    landmark: ''
  });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    businessWhatsappLink: string;
    customerConfirmationLink: string;
  } | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadUserData();
    loadCartData();
    loadGoogleMapsAPI();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserAddresses();
    }
  }, [user]);

  useEffect(() => {
    if (mapLoaded && showNewAddressForm) {
      initializeAutocomplete();
    }
  }, [mapLoaded, showNewAddressForm]);

  // Cleanup autocomplete instance when component unmounts
  useEffect(() => {
    return () => {
      if (autocomplete && window.google) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [autocomplete]);

  const loadGoogleMapsAPI = async () => {
    try {
      await loadGoogleMapsScript();
      setMapLoaded(true);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setMapLoaded(false);
    }
  };

  const initializeAutocomplete = () => {
    const input = document.getElementById('address-input') as HTMLInputElement;
    if (!input || !isGoogleMapsLoaded()) return;

    // Clear any existing autocomplete instance
    if (autocomplete) {
      window.google.maps.event.clearInstanceListeners(autocomplete);
    }

    const autocompleteInstance = new window.google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: { country: 'IN' }
    });

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (place.formatted_address) {
        const components = place.address_components;
        let area = '';
        let city = '';
        let pincode = '';

        components?.forEach((component: google.maps.GeocoderAddressComponent) => {
          const types = component.types;
          if (types.includes('sublocality') || types.includes('neighborhood')) {
            area = component.long_name;
          } else if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        setNewAddress({
          fullAddress: place.formatted_address,
          area: area,
          city: city,
          pincode: pincode,
          landmark: ''
        });
      }
    });

    setAutocomplete(autocompleteInstance);
  };

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        router.push('/');
        return;
      }
      const currentUser = JSON.parse(userData) as User;
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      router.push('/');
    }
  };

  const loadCartData = () => {
    try {
      const cartData = localStorage.getItem('cartItems');
      if (!cartData) {
        router.push('/home');
        return;
      }
      const items = JSON.parse(cartData) as CartItem[];
      if (items.length === 0) {
        router.push('/home');
        return;
      }
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart data:', error);
      router.push('/home');
    } finally {
      setLoading(false);
    }
  };

  const loadUserAddresses = async () => {
    if (!user) return;

    try {
      const addressesRef = collection(db, 'Address');
      const q = query(addressesRef, where('userId', '==', user.phoneNumber));
      const querySnapshot = await getDocs(q);
      
      const userAddresses: Address[] = [];
      querySnapshot.forEach((doc) => {
        userAddresses.push({ id: doc.id, ...doc.data() } as Address);
      });

      setAddresses(userAddresses);
      
      // Set default address if available
      const defaultAddress = userAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveNewAddress = async () => {
    if (!user || !newAddress.fullAddress) return;

    try {
      const addressData: Address = {
        userId: user.phoneNumber,
        fullAddress: newAddress.fullAddress,
        area: newAddress.area,
        city: newAddress.city,
        pincode: newAddress.pincode,
        landmark: newAddress.landmark,
        isDefault: addresses.length === 0 // First address is default
      };

      const docRef = await addDoc(collection(db, 'Address'), addressData);
      const savedAddress = { ...addressData, id: docRef.id };
      
      setAddresses([...addresses, savedAddress]);
      setSelectedAddress(savedAddress);
      setShowNewAddressForm(false);
      setNewAddress({
        fullAddress: '',
        area: '',
        city: '',
        pincode: '',
        landmark: ''
      });
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address. Please try again.');
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getNextOrderNumber = async () => {
    try {
      // Query the OrderStatus collection to get the latest order
      const orderStatusRef = collection(db, 'OrderStatus');
      const q = query(orderStatusRef);
      const querySnapshot = await getDocs(q);
      
      let maxOrderNum = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const orderId = data.orderId;
        // Extract number from KrumbAA01 format
        const match = orderId.match(/^Krumb([A-Z]{2})(\d+)$/);
        if (match) {
          const num = parseInt(match[2]);
          if (num > maxOrderNum) {
            maxOrderNum = num;
          }
        }
      });
      
      // Generate next order number
      const nextNum = maxOrderNum + 1;
      const paddedNum = nextNum.toString().padStart(2, '0');
      return `KrumbAA${paddedNum}`;
    } catch (error) {
      console.error('Error getting next order number:', error);
      // Fallback to timestamp-based ID
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 100);
      return `KrumbAA${random.toString().padStart(2, '0')}`;
    }
  };

  const saveOrderStatus = async (orderId: string, uuid: string) => {
    if (!user || !selectedAddress || !user.name) return;

    try {
      const orderStatus: OrderStatus = {
        uuid: uuid,
        orderId: orderId,
        customerName: user.name,
        customerPhone: user.phoneNumber,
        status: 'placed',
        deliveryDate: deliveryDate,
        deliveryAddress: selectedAddress.fullAddress,
        totalAmount: getTotalAmount(),
        orderTimestamp: serverTimestamp(),
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date().toISOString(),
            notes: 'Order placed via WhatsApp'
          }
        ]
      };

      await setDoc(doc(db, 'OrderStatus', orderId), orderStatus);
      console.log('Order status saved successfully with document ID:', orderId);
    } catch (error) {
      console.error('Error saving order status:', error);
      throw error;
    }
  };

  const saveFinanceRecord = async (orderId: string, uuid: string) => {
    if (!user || !selectedAddress || !user.name) return;

    try {
      const financeRecord: FinanceRecord = {
        uuid: uuid,
        orderId: orderId,
        customerName: user.name,
        customerPhone: user.phoneNumber,
        items: cartItems.map(item => {
          const itemData: {
            productName: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            category?: string;
            productId?: string;
            selectedOption?: { name: string; priceAdjustment: number; };
          } = {
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
          };
          if (item.selectedOption) {
            itemData.selectedOption = item.selectedOption;
          }
          return itemData;
        }),
        totalAmount: getTotalAmount(),
        deliveryAddress: {
          fullAddress: selectedAddress.fullAddress,
          area: selectedAddress.area,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
          ...(selectedAddress.landmark && { landmark: selectedAddress.landmark })
        },
        deliveryDate: deliveryDate,
        orderTimestamp: serverTimestamp(),
        paymentStatus: 'pending',
        orderStatus: 'placed',
        paymentMethod: 'whatsapp_order'
      };

      await setDoc(doc(db, 'FinanceRecords', orderId), financeRecord);
      console.log('Finance record saved successfully with document ID:', orderId);
    } catch (error) {
      console.error('Error saving finance record:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  const handleProceedToOrder = async () => {
    if (!selectedAddress || !deliveryDate) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Generate unique UUID and order ID
      const uuid = uuidv4();
      const orderId = await getNextOrderNumber();

      // Save to both OrderStatus and FinanceRecords collections with same UUID
      await Promise.all([
        saveOrderStatus(orderId, uuid),
        saveFinanceRecord(orderId, uuid)
      ]);

      // Clear cart first
      localStorage.removeItem('cartItems');

      // Trigger webhook for n8n automation (WhatsApp, email, etc.)
      try {
        const webhookResponse = await fetch('/api/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'order_placed',
            orderId,
            uuid,
            customerName: user?.name || 'Customer',
            customerPhone: user?.phoneNumber || '',
            orderItems: cartItems.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              selectedOption: item.selectedOption
            })),
            totalAmount: getTotalAmount(),
            deliveryDate,
            deliveryAddress: {
              fullAddress: selectedAddress.fullAddress,
              area: selectedAddress.area,
              city: selectedAddress.city,
              pincode: selectedAddress.pincode,
              landmark: selectedAddress.landmark
            }
          })
        });

        const webhookResult = await webhookResponse.json();
        console.log('Webhook triggered:', webhookResult);
      } catch (webhookError) {
        console.warn('Webhook failed (order still successful):', webhookError);
      }

      // Generate fallback WhatsApp links (in case webhook fails)
      const orderDetails = cartItems.map(item => 
        `${item.quantity}x ${item.productName}${item.selectedOption ? ` (${item.selectedOption.name})` : ''} - ₹${item.price * item.quantity}`
      ).join('\n');

      const totalAmount = getTotalAmount();
      const businessMessage = `🥖 *KrumbKraft Order*

*Order ID:* ${orderId}
*Customer:* ${user?.name}
*Phone:* ${user?.phoneNumber}

*Delivery Details:*
*Date:* ${deliveryDate}

*Address:*
${selectedAddress.fullAddress}
${selectedAddress.landmark ? `Landmark: ${selectedAddress.landmark}` : ''}

*Items:*
${orderDetails}

*Total Amount:* ₹${totalAmount}

You can track your order using Order ID: ${orderId}

Please confirm this order. Thank you!`;

      const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '9876543210';
      const businessWhatsappLink = generateWhatsAppLink(businessPhone, businessMessage);
      
      const customerConfirmationLink = sendOrderConfirmationToCustomer(
        user?.phoneNumber || '',
        orderId,
        user?.name || 'Customer',
        cartItems.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          selectedOption: item.selectedOption
        })),
        totalAmount,
        deliveryDate,
        `${selectedAddress.fullAddress}${selectedAddress.landmark ? `\nLandmark: ${selectedAddress.landmark}` : ''}`
      );

      // Set order success data and show modal
      setOrderSuccessData({
        orderId,
        businessWhatsappLink,
        customerConfirmationLink
      });
      setShowOrderSuccess(true);
      
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/home');
      }, 2000);
      
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error processing order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 text-xl"
              >
                ←
              </button>
              <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.productName}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-lg font-bold text-krumb-600">₹{getTotalAmount()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Delivery Address</h2>
            <button
              onClick={() => setShowNewAddressForm(true)}
              className="text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              + Add New Address
            </button>
          </div>

          {/* Existing Addresses */}
          {addresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {addresses.map((address) => (
                <label key={address.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddress?.id === address.id}
                    onChange={() => setSelectedAddress(address)}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{address.fullAddress}</p>
                    {address.landmark && (
                      <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>
                    )}
                    {address.isDefault && (
                      <span className="inline-block mt-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* New Address Form */}
          {showNewAddressForm && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4">
              <h3 className="font-medium text-gray-800">Add New Address</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address
                </label>
                <input
                  id="address-input"
                  type="text"
                  value={newAddress.fullAddress}
                  onChange={(e) => setNewAddress({...newAddress, fullAddress: e.target.value})}
                  placeholder="Start typing your address..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    value={newAddress.area}
                    onChange={(e) => setNewAddress({...newAddress, area: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={saveNewAddress}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowNewAddressForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Date */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Delivery Schedule</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Delivery Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white shadow-sm hover:border-amber-300 hover:shadow-md"
                />
              </div>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Orders must be placed at least 1 day in advance for fresh preparation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <button
            onClick={handleProceedToOrder}
            disabled={!selectedAddress || !deliveryDate || submitting}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-green-700"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Processing...
              </div>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>

      {/* Order Success Modal */}
      {showOrderSuccess && orderSuccessData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-t-3xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Order Placed Successfully!
                </h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Your order has been confirmed</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="font-bold text-amber-800">Order ID: {orderSuccessData.orderId}</p>
                  <p className="text-sm text-amber-700">Save this ID to track your order</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-700">
                    📱 Automated notifications have been sent via our system.
                    <br />
                    You may also use the manual options below if needed.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    window.open(orderSuccessData.businessWhatsappLink, '_blank');
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 flex items-center justify-center"
                >
                  <span className="mr-2">🏪</span>
                  Send to Business (Backup)
                </button>

                {user?.phoneNumber && (
                  <button
                    onClick={() => {
                      window.open(orderSuccessData.customerConfirmationLink, '_blank');
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center"
                  >
                    <span className="mr-2">💬</span>
                    Get Manual Confirmation
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowOrderSuccess(false);
                    router.push('/home');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gray-200"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Notifications are sent automatically via our webhook system.
                  <br />
                  Manual options above are available as backup.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
