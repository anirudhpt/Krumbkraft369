const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnT9zHKY5HEcX_yjEng-rkJ4CD3rSLR10",
  authDomain: "krumb-d4d6c.firebaseapp.com",
  projectId: "krumb-d4d6c",
  storageBucket: "krumb-d4d6c.firebasestorage.app",
  messagingSenderId: "288328506124",
  appId: "1:288328506124:web:271f2e0a6cd28910bc4729",
  measurementId: "G-SVVVKFJ89N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchAllMenuItems() {
  try {
    console.log('Fetching all menu items from Firestore...');
    
    const querySnapshot = await getDocs(collection(db, 'menu_items'));
    const items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`\nTotal items found: ${items.length}\n`);
    
    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    // Display items grouped by category
    Object.keys(itemsByCategory).forEach(category => {
      console.log(`\n=== ${category.toUpperCase()} ===`);
      itemsByCategory[category].forEach(item => {
        console.log(`- ${item.productName} | $${item.price} | ${item.description || 'No description'}`);
      });
    });
    
    // Look for potential duplicates (similar product names)
    console.log('\n=== POTENTIAL DUPLICATES ===');
    const duplicates = [];
    
    items.forEach((item, index) => {
      const baseName = item.productName.toLowerCase()
        .replace(/100%|whole wheat|white|regular|sourdough/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const similarItems = items.filter((otherItem, otherIndex) => {
        if (index >= otherIndex) return false; // Avoid duplicates in results
        const otherBaseName = otherItem.productName.toLowerCase()
          .replace(/100%|whole wheat|white|regular|sourdough/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        return baseName === otherBaseName && baseName.length > 2;
      });
      
      if (similarItems.length > 0) {
        duplicates.push({
          group: [item, ...similarItems],
          baseName: baseName
        });
      }
    });
    
    if (duplicates.length > 0) {
      duplicates.forEach((group, index) => {
        console.log(`\nGroup ${index + 1} (Base: "${group.baseName}"):`);
        group.group.forEach(item => {
          console.log(`  - ${item.productName} (${item.category}) - $${item.price}`);
        });
      });
    } else {
      console.log('No obvious duplicates found based on product names.');
    }
    
    // Export raw data for analysis
    console.log('\n=== RAW DATA (JSON) ===');
    console.log(JSON.stringify(items, null, 2));
    
  } catch (error) {
    console.error('Error fetching menu items:', error);
  }
}

fetchAllMenuItems();
