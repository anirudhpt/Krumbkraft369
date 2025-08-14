'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, createBookingOrder } from '@/lib/userService';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

// KrumbKraft Artisanal Bread Menu - Fresh Daily Selection
const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Sourdough Loaf',
    price: 320,
    description: 'Our signature 24-hour fermented sourdough with a perfect crust and tangy flavor',
    category: 'Sourdough'
  },
  {
    id: '2',
    name: 'Whole Wheat Sourdough',
    price: 350,
    description: 'Hearty whole grain sourdough packed with nutrients and rustic flavor',
    category: 'Sourdough'
  },
  {
    id: '3',
    name: 'Seeded Multigrain Bread',
    price: 380,
    description: 'Artisanal multigrain loaf topped with sunflower, pumpkin, and sesame seeds',
    category: 'Artisanal'
  },
  {
    id: '4',
    name: 'French Baguette',
    price: 280,
    description: 'Traditional French baguette with crispy crust and airy, light interior',
    category: 'French'
  },
  {
    id: '5',
    name: 'Rye Sourdough',
    price: 340,
    description: 'Dense, flavorful rye sourdough with caraway seeds and robust taste',
    category: 'Sourdough'
  },
  {
    id: '6',
    name: 'Brioche Loaf',
    price: 420,
    description: 'Rich, buttery brioche perfect for French toast or gourmet sandwiches',
    category: 'Sweet'
  },
  {
    id: '7',
    name: 'Focaccia with Herbs',
    price: 360,
    description: 'Italian-style focaccia topped with rosemary, olive oil, and sea salt',
    category: 'Italian'
  },
  {
    id: '8',
    name: 'Cinnamon Swirl Bread',
    price: 390,
    description: 'Sweet cinnamon swirl bread perfect for breakfast or afternoon treats',
    category: 'Sweet'
  },
  {
    id: '9',
    name: 'Olive & Herb Sourdough',
    price: 410,
    description: 'Mediterranean-inspired sourdough with Kalamata olives and fresh herbs',
    category: 'Sourdough'
  },
  {
    id: '10',
    name: 'Country White Bread',
    price: 290,
    description: 'Classic white bread with soft crumb and golden crust, perfect for sandwiches',
    category: 'Classic'
  },
  {
    id: '11',
    name: 'Cranberry Walnut Bread',
    price: 450,
    description: 'Artisanal bread studded with dried cranberries and toasted walnuts',
    category: 'Artisanal'
  },
  {
    id: '12',
    name: 'Sourdough Dinner Rolls (6 pack)',
    price: 240,
    description: 'Set of 6 small sourdough rolls, perfect for dinner or breakfast',
    category: 'Sourdough'
  }
];

export default function BookingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  const categories = ['All', ...Array.from(new Set(MENU_ITEMS.map(item => item.category)))];

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData) as User);
    setLoading(false);
  }, [router]);

  const filteredMenuItems = selectedCategory === 'All' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  const addToCart = (menuItem: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === menuItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter(item => item.id !== itemId);
    });
  };

  const getCartItemQuantity = (itemId: string) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (!user || cart.length === 0) return;

    try {
      setSubmitting(true);

      const orderItems = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      await createBookingOrder({
        userId: user.id,
        items: orderItems,
        totalAmount: getTotalAmount(),
        status: 'pending',
        notes: notes.trim() || undefined
      });

      // Clear cart and redirect to home
      setCart([]);
      setNotes('');
      router.push('/home?orderSuccess=true');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-radial from-purple-400/20 via-pink-500/10 to-indigo-600/20 flex items-center justify-center">
        <div className="glass p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50 mx-auto"></div>
          <p className="text-white/80 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-purple-400/20 via-pink-500/10 to-indigo-600/20">
      {/* Top Navigation Bar */}
      <nav className="glass-nav border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/home')}
                className="text-white/80 hover:text-white transition-colors text-xl hover:scale-110 transform duration-200"
              >
                ←
              </button>
              <div className="text-2xl animate-bounce">🍽️</div>
              <div>
                <h1 className="text-xl font-bold text-white">Place Your Order</h1>
                <p className="text-sm text-white/70">Choose from our menu</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* User Info */}
              <div className="text-right">
                <p className="text-lg font-semibold text-white glow">
                  {user.name || 'Guest'}
                </p>
                <p className="text-sm text-white/70">
                  Cart: {cart.length} items
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="glass rounded-2xl p-6 mb-6 border border-white/20">
              <h2 className="text-lg font-semibold text-white mb-3 glow">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'btn-glass-primary'
                        : 'glass-button'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="glass rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 glow">Menu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={getCartItemQuantity(item.id)}
                    onAdd={() => addToCart(item)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-4 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 glow">Your Order</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <div className="text-4xl mb-4 animate-pulse">🛒</div>
                  <p className="text-white/70">Your cart is empty</p>
                  <p className="text-sm text-white/50">Add items from the menu</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center glass-card p-3 rounded-lg border border-white/10">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-white">{item.name}</p>
                          <p className="text-xs text-white/60">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 rounded-full glass-button text-red-400 text-sm flex items-center justify-center hover:bg-red-400/20 hover:text-red-300"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center text-white">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 rounded-full glass-button text-green-400 text-sm flex items-center justify-center hover:bg-green-400/20 hover:text-green-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/20 pt-4 mb-4">
                    <div className="flex justify-between items-center text-lg font-semibold text-white glow">
                      <span>Total:</span>
                      <span>₹{getTotalAmount()}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or notes..."
                      className="w-full px-3 py-2 glass-input rounded-lg text-sm text-white placeholder-white/50 border border-white/20 focus:border-white/40"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full btn-glass-primary py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItemCard({ 
  item, 
  quantity, 
  onAdd, 
  onRemove 
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="card-glass p-4 hover:border-white/30 transition-all duration-300 transform hover:scale-105 border border-white/10 rounded-xl">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{item.name}</h3>
          <p className="text-sm text-white/70 mb-2">{item.description}</p>
          <p className="text-lg font-bold text-green-400 glow">₹{item.price}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs glass-badge text-white/80 px-2 py-1 rounded border border-white/20">
          {item.category}
        </span>
        
        {quantity === 0 ? (
          <button
            onClick={onAdd}
            className="btn-glass-primary px-4 py-1 rounded-lg text-sm transition-all duration-300 transform hover:scale-105"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full glass-button text-red-400 flex items-center justify-center hover:bg-red-400/20 hover:text-red-300"
            >
              -
            </button>
            <span className="font-medium w-8 text-center text-white">{quantity}</span>
            <button
              onClick={onAdd}
              className="w-8 h-8 rounded-full glass-button text-green-400 flex items-center justify-center hover:bg-green-400/20 hover:text-green-300"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
