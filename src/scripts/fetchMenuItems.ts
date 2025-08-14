import { menuService } from '../lib/menuService';

async function fetchAllMenuItems() {
  try {
    console.log('Fetching all menu items from Firestore...');
    const items = await menuService.getAllMenuItems();
    
    console.log(`\nTotal items found: ${items.length}\n`);
    
    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
    
    // Display items grouped by category
    Object.keys(itemsByCategory).forEach(category => {
      console.log(`\n=== ${category.toUpperCase()} ===`);
      itemsByCategory[category].forEach(item => {
        console.log(`- ${item.productName} | $${item.price} | ${item.description}`);
      });
    });
    
    // Look for potential duplicates (similar product names)
    console.log('\n=== POTENTIAL DUPLICATES ===');
    const productNames = items.map(item => item.productName.toLowerCase());
    const duplicates = items.filter((item, index) => {
      const baseName = item.productName.toLowerCase()
        .replace(/100%|whole wheat|white|regular/gi, '')
        .trim();
      
      return items.some((otherItem, otherIndex) => {
        if (index === otherIndex) return false;
        const otherBaseName = otherItem.productName.toLowerCase()
          .replace(/100%|whole wheat|white|regular/gi, '')
          .trim();
        return baseName === otherBaseName && baseName.length > 0;
      });
    });
    
    if (duplicates.length > 0) {
      duplicates.forEach(item => {
        console.log(`- ${item.productName} (${item.category})`);
      });
    } else {
      console.log('No obvious duplicates found based on product names.');
    }
    
  } catch (error) {
    console.error('Error fetching menu items:', error);
  }
}

fetchAllMenuItems();
