// Test script to verify webhook integration with n8n

// Simple webhook test - using TEST endpoint
const testWebhookUrl = 'https://lakshs.app.n8n.cloud/webhook-test/880776a4-635c-49a2-852b-9e136fa61774';

const sampleOrderData = {
  event_type: 'order_placed',
  order_id: 'TEST-001',
  customer: {
    name: 'Test Customer',
    phone: '919876543210'
  },
  order_details: {
    items: [
      {
        product_name: 'Sourdough Bread',
        quantity: 2,
        unit_price: 150,
        total_price: 300,
        selected_option: {
          name: 'Large',
          price_adjustment: 50
        }
      },
      {
        product_name: 'Chocolate Cookies',
        quantity: 1,
        unit_price: 80,
        total_price: 80
      }
    ],
    total_amount: 380,
    delivery_date: '2025-08-21',
    delivery_address: {
      full_address: '123 Test Street, Test Apartment 4B',
      area: 'Test Area',
      city: 'Mumbai',
      pincode: '400001',
      landmark: 'Near Test Mall'
    },
    order_status: 'placed',
    created_at: new Date().toISOString(),
    uuid: 'test-uuid-12345'
  },
  business: {
    name: 'KrumbKraft',
    phone: '919876543210',
    whatsapp_phone: '919876543210'
  },
  notifications: {
    send_customer_confirmation: true,
    send_business_notification: true,
    send_whatsapp: true,
    send_email: false,
    send_sms: false
  },
  messages: {
    customer_confirmation: `🥖 *KrumbKraft Order Confirmation*

Hi Test Customer! 👋

Your order has been successfully placed and confirmed!

*Order ID:* TEST-001
*Delivery Date:* 2025-08-21

*Your Order:*
2x Sourdough Bread (Large) - ₹300
1x Chocolate Cookies - ₹80

*Total Amount:* ₹380

*Delivery Address:*
123 Test Street, Test Apartment 4B
Landmark: Near Test Mall

*Status:* ✅ Confirmed
*Expected Delivery:* 2025-08-21

Thank you for choosing KrumbKraft! 🍞
We're preparing your fresh baked goods with love.

For any queries, feel free to contact us.

*Track your order:* Use Order ID TEST-001`,
    business_notification: `🥖 *KrumbKraft New Order*

*Order ID:* TEST-001
*Customer:* Test Customer
*Phone:* 919876543210

*Delivery Date:* 2025-08-21

*Order Items:*
2x Sourdough Bread (Large) - ₹300
1x Chocolate Cookies - ₹80

*Total Amount:* ₹380

*Delivery Address:*
123 Test Street, Test Apartment 4B
Landmark: Near Test Mall

*Status:* 🟡 New Order - Needs Confirmation

Please confirm this order and update preparation status.`
  },
  timestamp: new Date().toISOString(),
  source: 'krumbkraft-app',
  version: '1.0'
};

async function testWebhook() {
  console.log('Testing webhook to n8n...');
  console.log('Webhook URL:', testWebhookUrl);
  
  try {
    // Create query parameters for GET request
    const queryParams = new URLSearchParams({
      event_type: sampleOrderData.event_type,
      order_id: sampleOrderData.order_id,
      customer_name: sampleOrderData.customer.name,
      customer_phone: sampleOrderData.customer.phone,
      total_amount: sampleOrderData.order_details.total_amount.toString(),
      delivery_date: sampleOrderData.order_details.delivery_date,
      order_status: sampleOrderData.order_details.order_status,
      uuid: sampleOrderData.order_details.uuid,
      timestamp: new Date().toISOString(),
      source: 'krumbkraft-app'
    });

    // Add complex data as JSON strings
    queryParams.append('items', JSON.stringify(sampleOrderData.order_details.items));
    queryParams.append('delivery_address', JSON.stringify(sampleOrderData.order_details.delivery_address));
    queryParams.append('customer_confirmation_message', sampleOrderData.messages.customer_confirmation);
    queryParams.append('business_notification_message', sampleOrderData.messages.business_notification);

    const webhookUrlWithParams = `${testWebhookUrl}?${queryParams.toString()}`;

    const response = await fetch(webhookUrlWithParams, {
      method: 'GET',
      headers: {
        'User-Agent': 'KrumbKraft-Test/1.0'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log('Response data:', responseData);

    if (response.ok) {
      console.log('✅ Webhook test successful!');
      return { success: true, data: responseData };
    } else {
      console.log('❌ Webhook test failed!');
      return { success: false, error: responseData };
    }

  } catch (error) {
    console.error('❌ Webhook test error:', error);
    return { success: false, error: error.message };
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testWebhook();
}

export { testWebhook, sampleOrderData };
