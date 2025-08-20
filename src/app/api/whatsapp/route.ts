import { NextRequest, NextResponse } from 'next/server';
import { whatsappApiService } from '@/lib/whatsappApiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    let result;

    switch (type) {
      case 'order_confirmation':
        result = await whatsappApiService.sendOrderConfirmation(
          data.customerPhone,
          data.orderId,
          data.customerName,
          data.orderItems,
          data.totalAmount,
          data.deliveryDate,
          data.deliveryAddress
        );
        break;

      case 'business_notification':
        result = await whatsappApiService.sendOrderNotificationToBusiness(
          data.businessPhone,
          data.orderId,
          data.customerName,
          data.customerPhone,
          data.orderItems,
          data.totalAmount,
          data.deliveryDate,
          data.deliveryAddress
        );
        break;

      case 'text_message':
        result = await whatsappApiService.sendTextMessage(data.to, data.text);
        break;

      case 'template_message':
        result = await whatsappApiService.sendTemplateMessage(
          data.to,
          data.templateName,
          data.languageCode
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid message type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('WhatsApp API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send WhatsApp message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
