import { NextRequest, NextResponse } from 'next/server';
import { webhookService } from '@/lib/webhookService';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing webhook from API endpoint...');
    
    // Create test order data
    const testOrderData = {
      orderId: 'TEST-' + Date.now(),
      uuid: 'test-uuid-' + Date.now(),
      customerName: 'Test Customer',
      customerPhone: '919876543210',
      orderItems: [
        {
          productName: 'Sourdough Bread',
          quantity: 2,
          price: 150,
          selectedOption: { name: 'Large', priceAdjustment: 50 }
        },
        {
          productName: 'Chocolate Cookies',
          quantity: 1,
          price: 80
        }
      ],
      totalAmount: 380,
      deliveryDate: '2025-08-21',
      deliveryAddress: {
        fullAddress: '123 Test Street, Test Apartment 4B',
        area: 'Test Area',
        city: 'Mumbai',
        pincode: '400001',
        landmark: 'Near Test Mall'
      }
    };

    // Trigger the webhook
    const result = await webhookService.triggerOrderPlacedWebhook(testOrderData);

    return NextResponse.json({
      success: true,
      message: 'Test webhook triggered successfully',
      data: result,
      testOrderData
    });

  } catch (error: any) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        message: 'Test webhook failed'
      },
      { status: 500 }
    );
  }
}
