import React, { useState, useEffect } from 'react';
import { menuService, MenuItem, MenuItemOption } from '../lib/menuService';
import { MenuUtils } from '../lib/menuUtils';

const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  const [selectedOption, setSelectedOption] = useState<MenuItemOption | null>(
    item.options ? item.options[0] : null
  );

  const currentPrice = selectedOption 
    ? item.price + selectedOption.priceAdjustment 
    : item.price;

  // Debug logging for items with options
  if (item.options && item.options.length > 0) {
    console.log(`Item with options: ${item.productName}`, item.options);
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform duration-300 hover:scale-105">
      {/* Image Section */}
      <div className="h-48 overflow-hidden">
        <img 
          src={MenuUtils.getMenuItemImageUrl(item)}
          alt={item.productName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            // Fallback to a solid background with emoji if image fails
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div style="background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 50%, #FB923C 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${MenuUtils.getMenuItemEmoji(item.productName, item.category)}</div>`;
            }
          }}
        />
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.productName}</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">{item.description}</p>
        
        {/* Options Selection */}
        {item.options && item.options.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Choose Option:</p>
            <div className="space-y-2">
              {item.options.map((option, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`option-${item.id}`}
                    value={option.name}
                    checked={selectedOption?.name === option.name}
                    onChange={() => setSelectedOption(option)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {option.name}
                    {option.priceAdjustment !== 0 && (
                      <span className="text-green-600 font-medium ml-1">
                        {option.priceAdjustment > 0 ? ' (+₹' : ' (-₹'}
                        {Math.abs(option.priceAdjustment)})
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            {selectedOption && selectedOption.description && (
              <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-200 pt-2">
                {selectedOption.description}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">₹{currentPrice}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {item.category}
          </span>
        </div>
      </div>
    </div>
  );
};

const MenuComponent: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const items = await menuService.getAllMenuItems();
      setMenuItems(items);
      setError(null);
    } catch (err) {
      setError('Failed to fetch menu items');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Krumb Kraft Menu</h1>
      
      {/* Category Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter by Category:</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      {selectedCategory === 'All' ? (
        // Show grouped by category
        Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2">
              {category}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))
      ) : (
        // Show filtered items
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No items found in this category.
        </div>
      )}

      {/* Summary */}
      <div className="mt-12 p-6 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Menu Summary</h3>
        <p className="text-gray-600">
          Total Items: {menuItems.length} | 
          Categories: {categories.length - 1} | 
          Showing: {filteredItems.length} items
        </p>
      </div>
    </div>
  );
};

export default MenuComponent;
