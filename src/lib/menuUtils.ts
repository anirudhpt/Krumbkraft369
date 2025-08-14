import { menuService, MenuItem } from './menuService';

export class MenuUtils {
  
  // Get fallback image URL based on item category and name
  static getFallbackImageUrl(productName: string, category: string): string {
    const name = productName.toLowerCase();
    const cat = category.toLowerCase();
    
    // High-quality Unsplash images for different food categories
    if (cat.includes('bread') || name.includes('bread') || name.includes('sourdough')) {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (name.includes('croissant')) {
      return 'https://images.unsplash.com/photo-1555507036-ab794f575ca7?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (cat.includes('pastry') || cat.includes('dessert') || name.includes('cake') || name.includes('muffin')) {
      return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (cat.includes('beverage') || cat.includes('drink') || name.includes('coffee')) {
      return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (name.includes('tea')) {
      return 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (name.includes('cookie') || name.includes('biscuit')) {
      return 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (name.includes('donut') || name.includes('doughnut')) {
      return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (name.includes('sandwich')) {
      return 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (name.includes('salad')) {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (name.includes('pizza')) {
      return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (cat.includes('jam') || cat.includes('spread')) {
      return 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop&crop=center&q=80';
    }
    if (cat.includes('cracker') || cat.includes('muesli')) {
      return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&crop=center&q=80';
    }
    
    // Default bakery/food image
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&crop=center&q=80';
  }

  // Get the best available image URL (Firebase URL or fallback)
  static getMenuItemImageUrl(item: MenuItem): string {
    if (item.imgurl && item.imgurl.trim() !== '') {
      return item.imgurl;
    }
    return this.getFallbackImageUrl(item.productName, item.category);
  }

  // Get emoji representation for items (for loading states or small displays)
  static getMenuItemEmoji(productName: string, category: string): string {
    const name = productName.toLowerCase();
    const cat = category.toLowerCase();
    
    if (cat.includes('bread') || name.includes('bread') || name.includes('baguette') || name.includes('sourdough')) return '🍞';
    if (name.includes('croissant')) return '🥐';
    if (cat.includes('pastry') || cat.includes('dessert') || name.includes('cake')) return '🧁';
    if (cat.includes('beverage') || cat.includes('drink') || name.includes('coffee') || name.includes('tea')) return '☕';
    if (name.includes('cookie') || name.includes('biscuit')) return '🍪';
    if (name.includes('donut') || name.includes('doughnut')) return '🍩';
    if (name.includes('muffin')) return '🧁';
    if (name.includes('sandwich')) return '🥪';
    if (name.includes('salad')) return '🥗';
    if (name.includes('pizza')) return '🍕';
    if (cat.includes('jam') || cat.includes('spread')) return '🍯';
    if (cat.includes('cracker') || cat.includes('muesli')) return '🌾';
    
    return '🍽️';
  }
  
  static async exportMenuToJSON(): Promise<string> {
    try {
      const items = await menuService.getAllMenuItems();
      return JSON.stringify(items, null, 2);
    } catch (error) {
      console.error('Error exporting menu:', error);
      throw error;
    }
  }

  static async getMenuByPriceRange(minPrice: number, maxPrice: number): Promise<MenuItem[]> {
    try {
      const allItems = await menuService.getAllMenuItems();
      return allItems.filter(item => item.price >= minPrice && item.price <= maxPrice);
    } catch (error) {
      console.error('Error filtering menu by price:', error);
      throw error;
    }
  }

  static async searchMenuItems(searchTerm: string): Promise<MenuItem[]> {
    try {
      const allItems = await menuService.getAllMenuItems();
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return allItems.filter(item => 
        item.productName.toLowerCase().includes(lowercaseSearch) ||
        item.description.toLowerCase().includes(lowercaseSearch) ||
        item.category.toLowerCase().includes(lowercaseSearch)
      );
    } catch (error) {
      console.error('Error searching menu items:', error);
      throw error;
    }
  }

  static async getCategoryStats(): Promise<{
    category: string;
    count: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
  }[]> {
    try {
      const allItems = await menuService.getAllMenuItems();
      const categoryMap = new Map<string, MenuItem[]>();
      
      // Group items by category
      allItems.forEach(item => {
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, []);
        }
        categoryMap.get(item.category)!.push(item);
      });

      // Calculate stats for each category
      return Array.from(categoryMap.entries()).map(([category, items]) => {
        const prices = items.map(item => item.price);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return {
          category,
          count: items.length,
          avgPrice: Math.round(avgPrice * 100) / 100, // Round to 2 decimal places
          minPrice,
          maxPrice
        };
      });
    } catch (error) {
      console.error('Error getting category stats:', error);
      throw error;
    }
  }

  static formatPrice(price: number): string {
    return `₹${price}`;
  }

  static async getPopularItems(limit: number = 10): Promise<MenuItem[]> {
    try {
      const allItems = await menuService.getAllMenuItems();
      // For now, just return items sorted by price (can be enhanced with actual popularity data)
      return allItems
        .sort((a, b) => b.price - a.price) // Sort by price descending as a proxy for popularity
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular items:', error);
      throw error;
    }
  }

  static async getRandomMenuItems(count: number = 3): Promise<MenuItem[]> {
    try {
      const allItems = await menuService.getAllMenuItems();
      const shuffled = [...allItems].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error getting random menu items:', error);
      throw error;
    }
  }
}

export const menuUtils = new MenuUtils();
