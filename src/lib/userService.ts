import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface BookingOrder {
  id: string;
  userId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  notes?: string;
}

// Check if user exists by phone number (using phone as document ID)
export async function getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'Krumblogin', phoneNumber);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    return {
      id: userDoc.id,
      phoneNumber: userDoc.id, // Document ID is the phone number
      name: userData.Name || userData.name || '', // Check both Name and name fields
      email: userData.email || '',
      address: userData.address || '',
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLogin: userData.lastLogin?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error fetching user by phone number:', error);
    throw error;
  }
}

// Create a new user (using phone number as document ID)
export async function createUser(phoneNumber: string, additionalData?: Partial<User>): Promise<User> {
  try {
    const userRef = doc(db, 'Krumblogin', phoneNumber);
    const now = new Date();
    
    const userData = {
      Name: additionalData?.name || '', // Use capital N to match your structure
      email: additionalData?.email || '',
      address: additionalData?.address || '',
      createdAt: now,
      lastLogin: now,
    };
    
    await setDoc(userRef, userData);
    
    return {
      id: phoneNumber,
      phoneNumber: phoneNumber,
      name: userData.Name,
      email: userData.email,
      address: userData.address,
      createdAt: now,
      lastLogin: now,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user's last login
export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'Krumblogin', userId);
    await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
  } catch (error) {
    console.error('Error updating user last login:', error);
    throw error;
  }
}

// Update user's profile information
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const userRef = doc(db, 'Krumblogin', userId);
    const updateData: Record<string, unknown> = { lastLogin: new Date() };
    
    // Map name to Name field to match your structure
    if (updates.name !== undefined) {
      updateData.Name = updates.name;
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email;
    }
    if (updates.address !== undefined) {
      updateData.address = updates.address;
    }
    
    await setDoc(userRef, updateData, { merge: true });
    
    // Get updated user data
    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) {
      throw new Error('User not found after update');
    }
    
    const userData = updatedDoc.data();
    return {
      id: updatedDoc.id,
      phoneNumber: updatedDoc.id, // Document ID is phone number
      name: userData.Name || userData.name || '',
      email: userData.email || '',
      address: userData.address || '',
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLogin: userData.lastLogin?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Create a new booking order
export async function createBookingOrder(order: Omit<BookingOrder, 'id' | 'createdAt'>): Promise<BookingOrder> {
  try {
    const orderRef = doc(collection(db, 'orders'));
    const now = new Date();
    
    const orderData = {
      ...order,
      createdAt: now,
    };
    
    await setDoc(orderRef, orderData);
    
    return {
      id: orderRef.id,
      ...orderData,
    };
  } catch (error) {
    console.error('Error creating booking order:', error);
    throw error;
  }
}

// Get user's orders
export async function getUserOrders(userId: string): Promise<BookingOrder[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as BookingOrder[];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}
