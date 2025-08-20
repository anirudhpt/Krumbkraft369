// Test script for formatted webhook messages
const { webhookService } = require('./src/lib/webhookService.ts');

// Test order data with different phone formats
const testOrderData = {
  orderId: 'TEST-ORDER-' + Date.now(),
  uuid: 'test-uuid-' + Date.now(),
  customerName: 'Rajesh Kumar',
  customerPhone: '+91 9876543210', // Test with country code
  orderItems: [
    {
      productName: 'Sourdough Bread',
      quantity: 2,
      price: 250,
      selectedOption: {
        name: 'Whole Wheat',
        priceAdjustment: 50
      }
    },
    {
      productName: 'Chocolate Cookies',
      quantity: 1,
      price: 180
    }
  ],
  totalAmount: 680,
  deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
  deliveryAddress: {
    fullAddress: '123 MG Road, Brigade Gateway',
    area: 'Malleshwaram',
    city: 'Bangalore',
    pincode: '560003',
    landmark: 'Near Metro Station'
  }
};

async function testWebhook() {
  try {
    console.log('Testing webhook with formatted data...');
    console.log('Original phone:', testOrderData.customerPhone);
    
    const result = await webhookService.triggerOrderPlacedWebhook(testOrderData);
    
    console.log('Webhook sent successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Webhook test failed:', error.message);
  }
}

testWebhook();
