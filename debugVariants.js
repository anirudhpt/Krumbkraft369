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

async function checkVariants() {
  try {
    console.log('Checking menu items with variants...\n');
    
    const querySnapshot = await getDocs(collection(db, 'menu_items'));
    const items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Find items with options
    const itemsWithOptions = items.filter(item => item.options && item.options.length > 0);
    
    console.log(`Found ${itemsWithOptions.length} items with options:\n`);
    
    itemsWithOptions.forEach(item => {
      console.log(`📋 ${item.productName}`);
      console.log(`   Base Price: ₹${item.price}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Options:`);
      
      item.options.forEach((option, index) => {
        const finalPrice = item.price + option.priceAdjustment;
        console.log(`     ${index + 1}. ${option.name} - ₹${finalPrice} (${option.priceAdjustment >= 0 ? '+' : ''}${option.priceAdjustment})`);
        if (option.description) {
          console.log(`        Description: ${option.description}`);
        }
      });
      console.log('');
    });

    // Show sample JSON structure
    if (itemsWithOptions.length > 0) {
      console.log('Sample JSON structure:');
      console.log(JSON.stringify(itemsWithOptions[0], null, 2));
    }

  } catch (error) {
    console.error('Error checking variants:', error);
  }
}

checkVariants();
