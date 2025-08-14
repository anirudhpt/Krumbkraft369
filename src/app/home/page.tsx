'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/userService';
import { menuService, MenuItem } from '@/lib/menuService';
import { generateWhatsAppLink } from '@/lib/phoneUtils';

interface CartItem extends MenuItem {
  quantity: number;
}

interface Particle {
  id: number;
  left: string;
  width: string;
  height: string;
  animationDelay: string;
  animationDuration: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadMenuItems();
  }, []);

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 10 + 5}px`,
          height: `${Math.random() * 10 + 5}px`,
          animationDelay: `${Math.random() * 20}s`,
          animationDuration: `${Math.random() * 10 + 20}s`
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  const loadUserData = async () => {
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
    }
  };

  const loadMenuItems = async () => {
    try {
      const items = await menuService.getAllMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  const addToCart = (menuItem: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...menuItem, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const sendWhatsAppOrder = () => {
    if (!user || cartItems.length === 0) return;

    const orderDetails = cartItems.map(item => 
      `${item.quantity}x ${item.productName} - ₹${item.price * item.quantity}`
    ).join('\n');

    const totalAmount = getTotalAmount();
    const message = `🥖 *KrumbKraft Order*\n\n*Customer:* ${user.name}\n*Phone:* ${user.phoneNumber}\n\n*Items:*\n${orderDetails}\n\n*Total Amount:* ₹${totalAmount}\n\nPlease confirm this order. Thank you!`;

    // Generate WhatsApp link to business number (you should set this in your env)
    const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '9876543210'; // Replace with actual business number
    const whatsappLink = generateWhatsAppLink(businessPhone, message);
    
    // Open WhatsApp
    window.open(whatsappLink, '_blank');
    
    // Clear cart after sending
    setCartItems([]);
    setShowCart(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 flex flex-col items-center space-y-6 shadow-lg border border-gray-100 mx-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-xl sm:text-2xl font-bold text-white">K</span>
          </div>
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-gray-200 border-t-amber-700"></div>
          <p className="text-gray-700 font-semibold text-base sm:text-lg text-center">Loading fresh menu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: "url('/cherry_veneer.webp')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      {/* Mobile-optimized Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-lg sm:text-xl font-bold text-white">K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  KrumbKraft
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">Welcome back, {user.name}!</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">
                  KrumbKraft
                </h1>
                <p className="text-gray-600 text-xs truncate max-w-[120px]">Hi, {user.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Premium Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="group/nav relative bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:via-amber-700 hover:to-amber-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-1.5 sm:space-x-2 overflow-hidden"
              >
                {/* Elegant shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/nav:translate-x-[100%] transition-transform duration-700"></div>
                
                <div className="relative z-10 flex items-center space-x-1.5 sm:space-x-2">
                  <svg className="w-4 h-4 transition-transform group-hover/nav:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">Cart</span>
                  <span className="text-xs font-medium bg-white/20 px-1.5 py-0.5 rounded-full">({cartItems.length})</span>
                </div>
                
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse font-bold z-20">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="group/logout border border-amber-700 text-amber-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-medium hover:bg-amber-50 hover:border-amber-800 hover:text-amber-800 transition-all duration-300 text-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-amber-50 translate-y-[100%] group-hover/logout:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10 hidden sm:inline">Logout</span>
                <span className="relative z-10 sm:hidden">⎋</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Greeting and Category Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Hey 👋 I want ....
          </h2>
          
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-1">
                  {category.toLowerCase().includes('bread') ? '🥖' :
                   category.toLowerCase().includes('pastry') ? '🧁' :
                   category.toLowerCase().includes('beverage') ? '☕' :
                   category.toLowerCase().includes('dessert') ? '🍰' : '🍽️'}
                </span>
                <span className="text-xs font-medium">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clean Menu Items Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedCategory === 'All' ? (
            // Show all items in a single grid
            Object.values(groupedItems).flat().map(item => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={addToCart} 
                onUpdateQuantity={updateQuantity}
                cartItems={cartItems}
              />
            ))
          ) : (
            // Show filtered items
            filteredItems.map(item => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={addToCart} 
                onUpdateQuantity={updateQuantity}
                cartItems={cartItems}
              />
            ))
          )}
        </div>
        
        {/* Premium Show More Button */}
        <div className="flex justify-center mt-8">
          <button className="group/more bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:via-amber-700 hover:to-amber-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/more:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center space-x-2">
              <span>Show More</span>
              <svg className="w-4 h-4 transition-transform group-hover/more:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Clean Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-amber-700 to-amber-800 p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <span className="mr-2 sm:mr-3">🛒</span>
                  Your Cart
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white/80 hover:text-white text-2xl sm:text-3xl transition-colors bg-white/20 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-60 sm:max-h-96">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🛒</div>
                  <p className="text-gray-700 text-base sm:text-lg font-medium">Your cart is empty</p>
                  <p className="text-gray-500 text-sm mt-2">Add some delicious items to get started!</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-2xl p-3 sm:p-4 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{item.productName}</h4>
                          <p className="text-gray-600 text-xs sm:text-sm">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 ml-2">
                          <button
                            onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-gray-900 min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all text-sm font-bold"
                          >
                            +
                          </button>
                          <span className="font-bold text-gray-900 ml-1 sm:ml-4 min-w-[3rem] sm:min-w-[4rem] text-right text-sm sm:text-base">₹{item.price * item.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.id!)}
                            className="text-red-600 hover:text-red-500 ml-1 sm:ml-2 transition-colors p-1 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">Total: ₹{getTotalAmount()}</span>
                </div>
                <button
                  onClick={sendWhatsAppOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg flex items-center justify-center"
                >
                  <span className="mr-2 sm:mr-3">📱</span>
                  Order via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({ 
  item, 
  onAddToCart, 
  onUpdateQuantity, 
  cartItems 
}: { 
  item: MenuItem; 
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  cartItems: CartItem[];
}) {
  // Get current quantity from cart
  const cartItem = cartItems.find(cartItem => cartItem.id === item.id && item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    if (item.id) {
      onUpdateQuantity(item.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0 && item.id) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  // Get relevant image based on item type
  const getItemImage = (productName: string, category: string, description: string) => {
    const name = productName.toLowerCase();
    const cat = category.toLowerCase();
    
    if (cat.includes('bread') || name.includes('bread') || name.includes('baguette') || name.includes('croissant')) return '�';
    if (cat.includes('pastry') || cat.includes('dessert') || name.includes('cake')) return '🧁';
    if (cat.includes('beverage') || cat.includes('drink') || name.includes('coffee') || name.includes('tea')) return '☕';
    if (name.includes('cookie') || name.includes('biscuit')) return '�';
    if (name.includes('donut') || name.includes('doughnut')) return '🍩';
    if (name.includes('muffin')) return '🧁';
    if (name.includes('sandwich')) return '�';
    if (name.includes('salad')) return '�';
    if (name.includes('pizza')) return '🍕';
    
    return '🍽️';
  };

  // Get background color based on category
  const getBackgroundColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('bread')) return 'bg-gradient-to-br from-amber-600 to-amber-700';
    if (cat.includes('pastry') || cat.includes('dessert')) return 'bg-gradient-to-br from-amber-500 to-amber-600';
    if (cat.includes('beverage')) return 'bg-gradient-to-br from-amber-800 to-amber-900';
    if (cat.includes('salad')) return 'bg-gradient-to-br from-yellow-600 to-amber-700';
    return 'bg-gradient-to-br from-amber-700 to-orange-700';
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Price at top */}
      <div className="text-right mb-3">
        <span className="text-lg font-bold text-amber-800">₹{item.price}</span>
      </div>
      
      {/* Circular Image */}
      <div className="flex justify-center mb-4">
        <div className={`w-24 h-24 ${getBackgroundColor(item.category)} rounded-full flex items-center justify-center shadow-lg`}>
          <span className="text-4xl">
            {getItemImage(item.productName, item.category, item.description || '')}
          </span>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
          {item.productName}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-1">
          {item.category}
        </p>
      </div>
      
      {/* Quantity Counter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDecrement}
            disabled={quantity === 0}
            className={`w-8 h-8 rounded-full ${
              quantity > 0 
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            } font-bold transition-colors flex items-center justify-center`}
          >
            -
          </button>
          
          <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
            {quantity}
          </span>
          
          <button
            onClick={handleIncrement}
            className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold transition-colors flex items-center justify-center"
          >
            +
          </button>
        </div>
        
        <div className="text-lg font-bold text-amber-800">
          ₹{item.price}
        </div>
      </div>
    </div>
  );
}
