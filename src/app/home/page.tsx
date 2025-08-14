'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/userService';
import { menuService, MenuItem, MenuItemOption } from '@/lib/menuService';
import { MenuUtils } from '@/lib/menuUtils';
import { generateWhatsAppLink } from '@/lib/phoneUtils';

interface CartItem extends MenuItem {
  quantity: number;
  selectedOption?: MenuItemOption;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadMenuItems();
  }, []);

  // Scroll detection effect - runs after menuItems are loaded
  useEffect(() => {
    if (!menuItems.length) return;
    
    const categories = Array.from(new Set(menuItems.map(item => item.category)));
    if (categories.length === 0) return;

    const handleScroll = () => {
      let currentSection = '';
      
      for (const category of categories) {
        const element = document.getElementById(`section-${category}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is in viewport (considering sticky header offset)
          if (rect.top <= 200 && rect.bottom >= 200) {
            currentSection = category;
            break;
          }
        }
      }
      
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, menuItems.length]);

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

  const addToCart = (menuItem: MenuItem, selectedOption?: MenuItemOption) => {
    const itemKey = `${menuItem.id}-${selectedOption?.name || 'default'}`;
    const price = selectedOption ? menuItem.price + selectedOption.priceAdjustment : menuItem.price;
    const displayName = selectedOption ? `${menuItem.productName} (${selectedOption.name})` : menuItem.productName;
    
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.id === menuItem.id && 
        item.selectedOption?.name === selectedOption?.name
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.id === menuItem.id && item.selectedOption?.name === selectedOption?.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { 
          ...menuItem, 
          quantity: 1, 
          selectedOption,
          price: price,
          productName: displayName
        }];
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
      <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-white to-gray-50/20"></div>
        
        <div className="rounded-3xl p-8 sm:p-12 flex flex-col items-center space-y-6 mx-4 relative">
          {/* Glassmorphism container */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center animate-pulse shadow-xl bg-gradient-to-br from-amber-600 to-orange-700">
              <span className="text-xl sm:text-2xl font-bold text-white">K</span>
            </div>
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-gray-200 border-t-amber-600"></div>
            <p className="font-semibold text-base sm:text-lg text-center text-gray-700">Loading fresh menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Subtle background texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-white to-gray-50/20"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D97706' fill-opacity='0.03'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Fixed Navigation Bar */}
      <nav className="sticky top-0 z-50 relative border-b border-gray-200/50 shadow-sm animate-fadeInUp">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10">
          <div className="flex justify-between items-center animate-fadeInLeft">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br from-amber-600 to-orange-700">
                <span className="text-lg sm:text-xl font-bold text-white">K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  KrumbKraft
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Welcome back, {user?.name}!</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-lg font-bold text-gray-800">
                  KrumbKraft
                </h1>
                <p className="text-xs truncate max-w-[120px] text-gray-600">Hi, {user?.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Premium Cart Button with glassmorphism */}
              <button
                onClick={() => setShowCart(true)}
                className="group/nav relative text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center space-x-1.5 sm:space-x-2 overflow-hidden bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 shadow-xl hover:shadow-2xl"
              >
                {/* Elegant shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/nav:translate-x-[100%] transition-transform duration-700"></div>
                
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
                className="group/logout font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all duration-300 text-sm relative overflow-hidden bg-white/60 backdrop-blur-md border border-gray-300/50 text-gray-700 hover:bg-white/80"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/logout:translate-x-[100%] transition-transform duration-300"></div>
                <span className="relative z-10 hidden sm:inline">Logout</span>
                <span className="relative z-10 sm:hidden">⎋</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
          
      {/* Fixed Filter Section */}
      <div className="sticky top-[64px] sm:top-[80px] z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm animate-fadeInUp">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-4">
          {/* Mobile: Horizontal scrollable pills */}
          <div className="sm:hidden">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    const element = document.getElementById(`section-${category}`);
                    if (element) {
                      const offset = 120;
                      const elementPosition = element.offsetTop - offset;
                      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                    }
                  }}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                    activeSection === category
                      ? 'text-amber-700 border-b-2 border-amber-500'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Desktop: Centered wrapped buttons */}
          <div className="hidden sm:flex flex-wrap gap-6 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  const element = document.getElementById(`section-${category}`);
                  if (element) {
                    const offset = 140;
                    const elementPosition = element.offsetTop - offset;
                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                  }
                }}
                className={`text-sm font-medium transition-colors duration-300 ${
                  activeSection === category
                    ? 'text-amber-700 border-b-2 border-amber-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Menu Sections - Always show all categories */}
          {categories.map(category => {
            const categoryItems = menuItems.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;
            
            return (
              <div key={category} id={`section-${category}`} className="mb-12 opacity-0 animate-slideUp">
                {/* Section Header */}
                <div className="mb-8 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight uppercase text-center sm:text-left">
                    {category}
                  </h2>
                  <div className="flex justify-center sm:justify-start">
                    <div className="w-16 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transform scale-x-0 animate-scaleX shadow-sm"></div>
                  </div>
                </div>
                
                {/* Items Grid */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-0 animate-slideUp" style={{animationDelay: '0.2s'}}>
                  {categoryItems.map(item => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      onAddToCart={addToCart} 
                      onUpdateQuantity={updateQuantity}
                      cartItems={cartItems}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Premium Show More Button */}
          <div className="flex justify-center mt-8 mb-6">
            <button 
              className="group/more text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 shadow-xl hover:shadow-2xl hover:transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/more:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center space-x-2">
                <span>Show More</span>
                <svg className="w-4 h-4 transition-transform group-hover/more:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden shadow-2xl rounded-t-3xl sm:rounded-3xl relative">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border border-white/20 rounded-t-3xl sm:rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="p-4 sm:p-6 relative overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
                {/* Header background */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-700"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                    <span className="mr-2 sm:mr-3">🛒</span>
                    Your Cart
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-white/80 hover:text-white text-2xl sm:text-3xl transition-colors bg-white/20 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/30 backdrop-blur-md"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto max-h-60 sm:max-h-96">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🛒</div>
                    <p className="font-medium text-base sm:text-lg text-gray-800">Your cart is empty</p>
                    <p className="text-sm mt-2 text-gray-600">Add some delicious items to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-lg">
                        {/* Glassmorphism background for cart items */}
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl"></div>
                        
                        <div className="flex justify-between items-center relative z-10">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm sm:text-base truncate text-gray-800">{item.productName}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 ml-2">
                            <button
                              onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center transition-all text-sm font-bold border border-gray-300 text-gray-700 hover:bg-white/90"
                            >
                              -
                            </button>
                            <span className="font-bold min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center transition-all text-sm font-bold border border-gray-300 text-gray-700 hover:bg-white/90"
                            >
                              +
                            </button>
                            <span className="font-bold ml-1 sm:ml-4 min-w-[3rem] sm:min-w-[4rem] text-right text-sm sm:text-base text-gray-800">₹{item.price * item.quantity}</span>
                            <button
                              onClick={() => removeFromCart(item.id!)}
                              className="hover:scale-110 ml-1 sm:ml-2 transition-all p-1 text-sm"
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
                <div className="p-4 sm:p-6 border-t border-white/30 relative">
                  {/* Footer background */}
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <span className="text-xl sm:text-2xl font-bold text-amber-900">Total: ₹{getTotalAmount()}</span>
                    </div>
                    <button
                      onClick={sendWhatsAppOrder}
                      className="w-full text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:transform hover:scale-105"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                      
                      <span className="relative z-10 flex items-center">
                        <span className="mr-2 sm:mr-3">📱</span>
                        Order via WhatsApp
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
  onAddToCart: (item: MenuItem, selectedOption?: MenuItemOption) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  cartItems: CartItem[];
}) {
  const [selectedOption, setSelectedOption] = useState<MenuItemOption | null>(
    item.options ? item.options[0] : null
  );

  const currentPrice = selectedOption 
    ? item.price + selectedOption.priceAdjustment 
    : item.price;

  // Get current quantity from cart for this specific option
  const cartItem = cartItems.find(cartItem => 
    cartItem.id === item.id && 
    cartItem.selectedOption?.name === selectedOption?.name
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    if (item.id) {
      if (quantity === 0) {
        // If item is not in cart, add it
        onAddToCart(item, selectedOption || undefined);
      } else {
        // If item is already in cart, update quantity
        onUpdateQuantity(item.id, quantity + 1);
      }
    }
  };

  const handleDecrement = () => {
    if (quantity > 0 && item.id) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  // Get relevant placeholder image based on item type
  const getPlaceholderImage = (item: MenuItem) => {
    return MenuUtils.getMenuItemImageUrl(item);
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
    if (cat.includes('bread')) return 'linear-gradient(135deg, #9B5F32 0%, #674023 100%)';
    if (cat.includes('pastry') || cat.includes('dessert')) return 'linear-gradient(135deg, #AD9169 0%, #9B5F32 100%)';
    if (cat.includes('beverage')) return 'linear-gradient(135deg, #9D7753 0%, #674023 100%)';
    if (cat.includes('salad')) return 'linear-gradient(135deg, #BDA47D 0%, #AD9169 100%)';
    return 'linear-gradient(135deg, #9B5F32 0%, #674023 100%)';
  };

  return (
    <div className="h-auto flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl relative group">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xl border border-white/20 rounded-2xl group-hover:bg-white/40 transition-all duration-300"></div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 rounded-2xl opacity-80"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Product Image */}
        <div className="flex justify-center relative overflow-hidden rounded-t-2xl h-40 sm:h-50">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/50 to-amber-50/50 backdrop-blur-sm">
            <img 
              src={getPlaceholderImage(item)}
              alt={item.productName}
              className="w-full h-50 object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div style="background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 50%, #FB923C 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 1rem 1rem 0 0;">
                    <span style="font-size: 2.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${getItemImage(item.productName, item.category, item.description || '')}</span>
                  </div>`;
                }
              }}
            />
          </div>
        </div>
        
        {/* Product Info */}
        <div className="text-center p-2 flex-shrink-0">
          <h3 className="font-bold text-xs sm:text-sm mb-1 line-clamp-1 text-amber-900">
            {item.productName}
          </h3>
          <p className="text-xs line-clamp-1 text-amber-700">
            {item.category}
          </p>
        </div>

        {/* Options Selection */}
        {item.options && item.options.length > 0 && (
          <div className="px-2 pb-1 flex-shrink-0">
            <div className="flex gap-1 justify-center">
              {item.options.map((option, index) => (
                <label key={index} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`option-${item.id}`}
                    value={option.name}
                    checked={selectedOption?.name === option.name}
                    onChange={() => setSelectedOption(option)}
                    className="sr-only"
                  />
                  <span className={`inline-block text-xs px-2 py-1 rounded-full border transition-all duration-200 ${
                    selectedOption?.name === option.name
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                      : 'bg-white/70 text-amber-800 border-amber-300 hover:bg-amber-50'
                  }`}>
                    {option.name.replace('100% ', '')}
                    {option.priceAdjustment !== 0 && (
                      <span className={`ml-1 font-medium ${
                        selectedOption?.name === option.name ? 'text-amber-100' : 'text-green-600'
                      }`}>
                        +₹{option.priceAdjustment}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Quantity Counter */}
        <div className="flex justify-between items-center p-2 mt-auto flex-shrink-0">
          <div className="flex items-center space-x-1">
            <button
              onClick={handleDecrement}
              disabled={quantity === 0}
              className={`w-6 h-6 rounded-full font-bold transition-all duration-200 flex items-center justify-center text-xs backdrop-blur-md border ${
                quantity > 0 
                  ? 'bg-white/60 border-amber-300 text-amber-800 hover:bg-white/80 hover:scale-110' 
                  : 'bg-white/30 border-amber-200 text-amber-600 cursor-not-allowed opacity-50'
              }`}
            >
              -
            </button>
            
            <span className="text-sm font-bold min-w-[1.5rem] text-center text-amber-900">
              {quantity}
            </span>
            
            <button
              onClick={handleIncrement}
              className="w-6 h-6 rounded-full font-bold transition-all duration-200 flex items-center justify-center text-xs bg-white/60 backdrop-blur-md border border-amber-300 text-amber-800 hover:bg-white/80 hover:scale-110"
            >
              +
            </button>
          </div>
          
          <div className="text-sm font-bold text-amber-900 bg-white/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/30">
            ₹{currentPrice}
          </div>
        </div>
      </div>
    </div>
  );
}
