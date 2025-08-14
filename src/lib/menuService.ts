import { db } from './firebase';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface MenuItemOption {
  name: string;
  priceAdjustment: number; // Price difference from base price (can be negative)
  description?: string;
}

export interface MenuItem {
  id?: string;
  productName: string;
  description: string;
  price: number; // Base price
  category: string;
  imgurl?: string;
  options?: MenuItemOption[]; // Variants like "100% Whole Wheat", "Regular", etc.
  createdAt?: Date;
  updatedAt?: Date;
}

export class MenuService {
  private collectionName = 'menu_items';

  async addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const menuItem: MenuItem = {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), menuItem);
      return docRef.id;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  }

  async addMenuItems(items: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    try {
      const batch = items.map(item => this.addMenuItem(item));
      await Promise.all(batch);
    } catch (error) {
      console.error('Error adding menu items:', error);
      throw error;
    }
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const items: MenuItem[] = [];
      
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        } as MenuItem);
      });
      
      return items;
    } catch (error) {
      console.error('Error getting menu items:', error);
      throw error;
    }
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    try {
      const allItems = await this.getAllMenuItems();
      return allItems.filter(item => item.category === category);
    } catch (error) {
      console.error('Error getting menu items by category:', error);
      throw error;
    }
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await setDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Method to consolidate duplicate items into one with options
  async consolidateDuplicates(): Promise<void> {
    try {
      const allItems = await this.getAllMenuItems();
      
      // Define consolidation rules
      const consolidationGroups = [
        {
          baseItem: 'Olive and rosemary sourdough bread',
          duplicateItem: '100% Whole Wheat Olive Rosemary Sourdough Bread',
          newName: 'Olive & Rosemary Sourdough Bread',
          options: [
            { name: 'Regular', priceAdjustment: 0, description: 'Classic sourdough bread with olives and rosemary' },
            { name: '100% Whole Wheat', priceAdjustment: 50, description: 'Premium whole wheat version with olives and rosemary' }
          ]
        },
        {
          baseItem: 'Cranberry and walnut sourdough bread',
          duplicateItem: '100% Whole Wheat Cranberry & Walnut Sourdough Bread',
          newName: 'Cranberry & Walnut Sourdough Bread',
          options: [
            { name: 'Regular', priceAdjustment: 0, description: 'Classic sourdough with cranberries and walnuts' },
            { name: '100% Whole Wheat', priceAdjustment: 35, description: 'Premium whole wheat version with cranberries and walnuts' }
          ]
        }
      ];

      for (const group of consolidationGroups) {
        const baseItem = allItems.find(item => item.productName === group.baseItem);
        const duplicateItem = allItems.find(item => item.productName === group.duplicateItem);

        if (baseItem && duplicateItem) {
          console.log(`Consolidating: ${group.baseItem} and ${group.duplicateItem}`);

          // Update the base item with new name, options, and consolidated description
          const updatedItem: Partial<MenuItem> = {
            productName: group.newName,
            options: group.options,
            description: `${baseItem.description} Available in regular and 100% whole wheat options.`,
            price: baseItem.price // Use the lower price as base
          };

          await this.updateMenuItem(baseItem.id!, updatedItem);
          
          // Delete the duplicate item
          await this.deleteMenuItem(duplicateItem.id!);
          
          console.log(`✓ Consolidated ${group.newName}`);
        }
      }

      console.log('Consolidation complete!');
    } catch (error) {
      console.error('Error consolidating duplicates:', error);
      throw error;
    }
  }
}

export const menuService = new MenuService();
