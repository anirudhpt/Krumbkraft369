import { menuService, MenuItem } from './menuService';

export class MenuUtils {
  
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
