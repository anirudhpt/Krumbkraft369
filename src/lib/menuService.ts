import { db } from './firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';

export interface MenuItem {
  id?: string;
  productName: string;
  description: string;
  price: number;
  category: string;
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
}

export const menuService = new MenuService();
