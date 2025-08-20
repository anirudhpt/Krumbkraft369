import { NextRequest, NextResponse } from 'next/server';
import { webhookService } from '@/lib/webhookService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    let result;

    switch (action) {
      case 'order_placed':
        result = await webhookService.triggerOrderPlacedWebhook(data);
        break;

      case 'order_status_update':
        result = await webhookService.triggerOrderStatusWebhook(
          data.orderId,
          data.newStatus,
          data.customerPhone,
          data.customerName
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid webhook action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook triggered successfully',
      data: result 
    });

  } catch (error: unknown) {
    console.error('Webhook trigger error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to trigger webhook';
    
    // Don't fail the order if webhook fails
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        warning: 'Order was placed successfully but notification webhook failed'
      },
      { status: 200 } // Return 200 so order placement doesn't fail
    );
  }
}
