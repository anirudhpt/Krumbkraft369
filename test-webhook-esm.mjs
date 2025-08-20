// Test script for webhook phone formatting
import { webhookService } from './src/lib/webhookService.js';

const testData = {
  orderId: 'TEST-' + Date.now(),
  uuid: 'uuid-' + Date.now(),
  customerName: 'Rajesh Kumar',
  customerPhone: '+91 9876543210',
  orderItems: [
    {
      productName: 'Sourdough Bread',
      quantity: 2,
      price: 250
    }
  ],
  totalAmount: 500,
  deliveryDate: '2024-01-15',
  deliveryAddress: {
    fullAddress: '123 MG Road',
    area: 'Malleshwaram',
    city: 'Bangalore',
    pincode: '560003'
  }
};

console.log('Testing webhook...');
webhookService.triggerOrderPlacedWebhook(testData)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error.message));
