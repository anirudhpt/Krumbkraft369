const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

const menuData = [
  // Sourdough Breads
  {
    productName: "Ragi And Sesame Sourdough Bread",
    description: "All-Natural 100% Sourdough Finger Millet(Ragi) Bread Rich In Minerals Like Calcium, And Iron.",
    price: 285,
    category: "Sourdough Breads"
  },
  {
    productName: "Sundried tomatoes and jalapeno sourdough bread",
    description: "A Tangy And Spicy Bread To Accompany Your Favorite Soup.",
    price: 290,
    category: "Sourdough Breads"
  },
  {
    productName: "100% Whole Wheat Cranberry & Walnut Sourdough Bread",
    description: "Premium whole wheat sourdough bread with cranberries and walnuts",
    price: 325,
    category: "Sourdough Breads"
  },
  {
    productName: "Olive and rosemary sourdough bread",
    description: "Sourdough bread flavored with olives and rosemary, makes for an excellent accompaniment for soups, pastas as appetizer, and make lovely sandwiches too (500g).",
    price: 275,
    category: "Sourdough Breads"
  },
  {
    productName: "100% Whole Wheat Olive Rosemary Sourdough Bread",
    description: "Premium whole wheat sourdough bread with olives and rosemary",
    price: 325,
    category: "Sourdough Breads"
  },
  {
    productName: "Vollkorn",
    description: "Our Version Of The German Rye Bread, But Made With 100% Whole Wheat And Loaded With Seeds.",
    price: 290,
    category: "Sourdough Breads"
  },
  {
    productName: "Seedfest sourdough bread",
    description: "Sourdough Loaf Loaded With 5 Different Types Of Seeds.",
    price: 275,
    category: "Sourdough Breads"
  },
  {
    productName: "Cranberry and walnut sourdough bread",
    description: "A Fruity Twist To Our Regular, Plain Loaf, This Nutty Bread Offers A Sweet And Refreshing Taste to the Palate.",
    price: 290,
    category: "Sourdough Breads"
  },
  {
    productName: "Focaccia 10x10",
    description: "Oven baked italian bread. 100% sourdough. 900g.",
    price: 550,
    category: "Sourdough Breads"
  },
  {
    productName: "100% whole wheat sourdough bread",
    description: "An aromatic and earthy flavored one, made with a balanced blend of premium residue free whole wheat flour sourced directly from farm.",
    price: 285,
    category: "Sourdough Breads"
  },
  {
    productName: "100% Whole Wheat Orange & Chocolate Sourdough Bread",
    description: "Premium whole wheat sourdough bread with orange and chocolate",
    price: 325,
    category: "Sourdough Breads"
  },

  // Other Quick Bites
  {
    productName: "Sourdough Croutons",
    description: "Bread cubes baked to perfection seasoned with olive oil and mixed herbs. A perfect accompaniment to soups and salads, or great just to munch on.",
    price: 90,
    category: "Other Quick Bites"
  },
  {
    productName: "Buckwheat, Chocolate & Oats Pancake Mix (275g)",
    description: "Yummmm and easy to do whole-grain pancakes, with the goodness of oats and buckwheat.",
    price: 245,
    category: "Other Quick Bites"
  },
  {
    productName: "Whole grain and oats pancake mix",
    description: "Yummmm And Easy To Do Whole-Grain Pancakes, With The Goodness Of Oats.",
    price: 225,
    category: "Other Quick Bites"
  },

  // House Specials
  {
    productName: "Whole Wheat Marble",
    description: "The classic marble cake made with whole wheat flour. Contains eggs (360g).",
    price: 295,
    category: "House Specials"
  },
  {
    productName: "Vegan Cranberry Chocolate Cake",
    description: "A rich and decadent chocolate cake infused with tangy cranberries. Made with whole wheat flour and sweetened with jaggery.",
    price: 580,
    category: "House Specials"
  },
  {
    productName: "Vegan Choco Chip Loaf",
    description: "A vegan chocolate chip loaf made with whole wheat flour and sweetened with jaggery. Contains soy milk (320g).",
    price: 295,
    category: "House Specials"
  },
  {
    productName: "Vegan Date And Orange Loaf",
    description: "A vegan tea time cake made with 100% whole wheat flour, dates, and oranges. Sweetened with jaggery. Contains soy milk (320g).",
    price: 355,
    category: "House Specials"
  },
  {
    productName: "Wholewheat Overload Brownie",
    description: "A dessert combining classic brownie flavors with wholewheat. Topped with chocolate drizzle and chunks. Comes in a pack of 6.",
    price: 540,
    category: "House Specials"
  },
  {
    productName: "Vegan Carrot And Walnut Loaf",
    description: "A loaf with carrots and walnuts, made with whole wheat, jaggery, and soy milk (320g).",
    price: 355,
    category: "House Specials"
  },
  {
    productName: "Vegan lemon and mint cake",
    description: "A tangy, fresh, and summery cake for all occasions. Made with all-purpose flour, soy milk, sunflower oil, and sugar.",
    price: 400,
    category: "House Specials"
  },
  {
    productName: "Whole Wheat Chocolate Ganache Cake",
    description: "Layers of rich ganache between moist whole wheat chocolate cake.",
    price: 450,
    category: "House Specials"
  },
  {
    productName: "Lemon Drizzle Loaf(350g)",
    description: "A delightful, zesty, and tangy dessert with a drizzle of lemony syrup.",
    price: 415,
    category: "House Specials"
  },
  {
    productName: "Vegan Banana Nut Bread",
    description: "A tea time cake made with bananas and walnuts, whole wheat flour, and sweetened with jaggery. Contains soy milk (320g).",
    price: 295,
    category: "House Specials"
  },
  {
    productName: "Coconut Loaf",
    description: "Delicious coconut loaf (360gms).",
    price: 415,
    category: "House Specials"
  },
  {
    productName: "Vegan Zucchini",
    description: "A tea time cake made with wholewheat flour, jaggery, grated zucchini, and soy milk (320g).",
    price: 295,
    category: "House Specials"
  },

  // Sourdough Crackers & Muesli
  {
    productName: "Caramelised Onion Cracker",
    description: "A slightly sweet and tangy onion cracker. Pairs well with dips or as a hearty snack.",
    price: 300,
    category: "Sourdough Crackers & Muesli"
  },
  {
    productName: "Whole Wheat & Mixed Herb Crackers 200g",
    description: "Baked whole wheat crackers.",
    price: 250,
    category: "Sourdough Crackers & Muesli"
  },
  {
    productName: "Beetroot Crackers",
    description: "Crackers with a vibrant color and subtly sweet flavor, made with whole wheat, beetroot powder, and black sesame.",
    price: 300,
    category: "Sourdough Crackers & Muesli"
  },
  {
    productName: "Chocolate & Cranberry Sourdough Muesli (250g)",
    description: "A sourdough muesli with chocolate and cranberries.",
    price: 300,
    category: "Sourdough Crackers & Muesli"
  },
  {
    productName: "Oats & Buckwheat Sourdough Muesli",
    description: "A vegan, tangy sourdough muesli with a delightful blend of oats, buckwheat, nuts, and seeds.",
    price: 325,
    category: "Sourdough Crackers & Muesli"
  },

  // Jams & Spreads
  {
    productName: "Olive Tapenade",
    description: "A fresh olive tapenade bursting with the flavors of sundried tomatoes, brine-cured olives, and tangy capers.",
    price: 325,
    category: "Jams & Spreads"
  },
  {
    productName: "Rose Harissa",
    description: "A spread, marinade, and dipping sauce made from seasonal byadagi chilies and rose petals.",
    price: 400,
    category: "Jams & Spreads"
  },
  {
    productName: "Eggplant & Walnut Pickle",
    description: "A spread for your favorite sourdough.",
    price: 350,
    category: "Jams & Spreads"
  },
  {
    productName: "Bangalore Blue Grape Jam",
    description: "A jam perfect for pairing with nut butter and sourdough bread.",
    price: 350,
    category: "Jams & Spreads"
  },
  {
    productName: "Plum Jam",
    description: "A season-special jam with the delightful tang of plums, perfect for sourdough toasts.",
    price: 330,
    category: "Jams & Spreads"
  },

  // Cookies
  {
    productName: "Roasted Almond Biscotti",
    description: "Made with 100% sourdough, roasted almonds, a hint of cinnamon, butter, and eggs. It's mildly sweet with a gentle crunch.",
    price: 325,
    category: "Cookies"
  },
  {
    productName: "Brownie Biscotti",
    description: "An eggless, sourdough biscotti made with chocolate. A great accompaniment for a hot drink.",
    price: 350,
    category: "Cookies"
  },
  {
    productName: "Cranberry Almond Biscotti",
    description: "An eggless, 100% sourdough biscotti loaded with cranberries and almonds. Contains flax seeds and is made with all-purpose flour.",
    price: 350,
    category: "Cookies"
  },
  {
    productName: "Sourdough Chocolate Chip Cookie Buttons (10 Nos - Appr 100g)",
    description: "A chocolate chip cookie fermented for 36 hours and made with real chocolate from Callebaut.",
    price: 250,
    category: "Cookies"
  }
];

async function addMenuItem(item) {
  try {
    const menuItem = {
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'menu_items'), menuItem);
    return docRef.id;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
}

async function populateMenuData() {
  try {
    console.log('Starting to populate menu data...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of menuData) {
      try {
        await addMenuItem(item);
        successCount++;
        console.log(`✓ Added: ${item.productName}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to add: ${item.productName}`, error);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully added: ${successCount} items`);
    console.log(`❌ Failed to add: ${errorCount} items`);
    console.log(`📝 Total items: ${menuData.length}`);
    
    // Log categories summary
    const categories = [...new Set(menuData.map(item => item.category))];
    console.log(`🏷️  Categories: ${categories.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('Error populating menu data:', error);
    return false;
  }
}

// Run the script
populateMenuData().then(() => {
  console.log('🎉 Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
