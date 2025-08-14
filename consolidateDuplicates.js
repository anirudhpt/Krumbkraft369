const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } = require('firebase/firestore');

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

async function consolidateDuplicates() {
  try {
    console.log('Starting consolidation of duplicate menu items...\n');

    // Get all current items
    const querySnapshot = await getDocs(collection(db, 'menu_items'));
    const items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Found ${items.length} total items\n`);

    // Define consolidation rules
    const consolidationGroups = [
      {
        baseItem: 'Olive and rosemary sourdough bread',
        duplicateItem: '100% Whole Wheat Olive Rosemary Sourdough Bread',
        newName: 'Olive & Rosemary Sourdough Bread',
        options: [
          { name: 'Regular', priceAdjustment: 0, description: 'Classic sourdough bread with olives and rosemary (500g)' },
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
      const baseItem = items.find(item => item.productName === group.baseItem);
      const duplicateItem = items.find(item => item.productName === group.duplicateItem);

      if (baseItem && duplicateItem) {
        console.log(`\n🔄 Consolidating:`);
        console.log(`   Base: ${group.baseItem} ($${baseItem.price})`);
        console.log(`   Duplicate: ${group.duplicateItem} ($${duplicateItem.price})`);
        console.log(`   New Name: ${group.newName}`);

        // Update the base item with new name, options, and consolidated description
        const updatedItem = {
          productName: group.newName,
          options: group.options,
          description: baseItem.description.includes('500g') ? 
            `${baseItem.description} Available in regular and 100% whole wheat options.` :
            `Sourdough bread flavored with ${group.newName.toLowerCase().includes('olive') ? 'olives and rosemary' : 'cranberries and walnuts'}, available in regular and 100% whole wheat options.`,
          price: baseItem.price, // Use the lower price as base
          category: baseItem.category,
          updatedAt: new Date()
        };

        // Update the base item
        const docRef = doc(db, 'menu_items', baseItem.id);
        await setDoc(docRef, updatedItem, { merge: true });
        
        // Delete the duplicate item
        const duplicateDocRef = doc(db, 'menu_items', duplicateItem.id);
        await deleteDoc(duplicateDocRef);
        
        console.log(`   ✅ Successfully consolidated into: ${group.newName}`);
        console.log(`   💰 Base price: $${baseItem.price}, with $${group.options[1].priceAdjustment} surcharge for 100% whole wheat`);
      } else {
        console.log(`\n⚠️  Could not find items for consolidation:`);
        console.log(`   Base: ${group.baseItem} ${baseItem ? '✓' : '✗'}`);
        console.log(`   Duplicate: ${group.duplicateItem} ${duplicateItem ? '✓' : '✗'}`);
      }
    }

    console.log('\n🎉 Consolidation complete!');
    console.log('\nTo verify changes, run the fetch script again.');

  } catch (error) {
    console.error('❌ Error consolidating duplicates:', error);
  }
}

consolidateDuplicates();
