// WhatsApp Business API Service for sending messages directly

interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  text?: {
    body: string;
  };
}

interface WhatsAppApiConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion: string;
}

class WhatsAppApiService {
  private config: WhatsAppApiConfig;

  constructor() {
    this.config = {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '716542651545924',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'EAAUxDbz6ZCMMBPDSezfyRfNTmip9N1cCtdxm9DNSd5b3PH0heIcrCXLV9X4PoYq2rVjLQ8YXu3e19HaSdTsNhUEguAijAuVIL41ZClUNR5uIdcdSMDZB1ozus1xMDDZBGAZCJidnKGuOwZAu8ThZCcRzsjisbcpuZBkXqyyWGnDeWBMUcOOoBh7edTM13o0EVvGSUv9I0JZBo5GPS2IAtwoyokJrKFLrWAZCEbj9ZARprYRpXydTWy9Fe2eEK5ATQZDZD',
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v22.0'
    };
  }

  private getApiUrl(): string {
    return `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;
  }

  async sendMessage(message: WhatsAppMessage): Promise<any> {
    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en_US'): Promise<any> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    return this.sendMessage(message);
  }

  async sendTextMessage(to: string, text: string): Promise<any> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: text
      }
    };

    return this.sendMessage(message);
  }

  async sendOrderConfirmation(
    customerPhone: string,
    orderId: string,
    customerName: string,
    orderItems: Array<{
      productName: string;
      quantity: number;
      price: number;
      selectedOption?: { name: string; priceAdjustment: number };
    }>,
    totalAmount: number,
    deliveryDate: string,
    deliveryAddress: string
  ): Promise<any> {
    const itemsList = orderItems.map(item => 
      `${item.quantity}x ${item.productName}${item.selectedOption ? ` (${item.selectedOption.name})` : ''} - ₹${item.price * item.quantity}`
    ).join('\n');

    const confirmationMessage = `🥖 *KrumbKraft Order Confirmation*

Hi ${customerName}! 👋

Your order has been successfully placed!

*Order ID:* ${orderId}
*Delivery Date:* ${deliveryDate}

*Your Order:*
${itemsList}

*Total Amount:* ₹${totalAmount}

*Delivery Address:*
${deliveryAddress}

*Order Status:* Confirmed ✅
*Expected Delivery:* ${deliveryDate}

Thank you for choosing KrumbKraft! 🍞
We'll keep you updated on your order status.

For any queries, feel free to contact us.`;

    // Clean phone number (remove any formatting)
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    return this.sendTextMessage(formattedPhone, confirmationMessage);
  }

  async sendOrderNotificationToBusiness(
    businessPhone: string,
    orderId: string,
    customerName: string,
    customerPhone: string,
    orderItems: Array<{
      productName: string;
      quantity: number;
      price: number;
      selectedOption?: { name: string; priceAdjustment: number };
    }>,
    totalAmount: number,
    deliveryDate: string,
    deliveryAddress: string
  ): Promise<any> {
    const orderDetails = orderItems.map(item => 
      `${item.quantity}x ${item.productName}${item.selectedOption ? ` (${item.selectedOption.name})` : ''} - ₹${item.price * item.quantity}`
    ).join('\n');

    const businessMessage = `🥖 *KrumbKraft New Order*

*Order ID:* ${orderId}
*Customer:* ${customerName}
*Phone:* ${customerPhone}

*Delivery Details:*
*Date:* ${deliveryDate}

*Address:*
${deliveryAddress}

*Items:*
${orderDetails}

*Total Amount:* ₹${totalAmount}

Please confirm this order. Thank you!`;

    // Clean and format business phone number
    const cleanBusinessPhone = businessPhone.replace(/\D/g, '');
    const formattedBusinessPhone = cleanBusinessPhone.startsWith('91') ? cleanBusinessPhone : `91${cleanBusinessPhone}`;

    return this.sendTextMessage(formattedBusinessPhone, businessMessage);
  }
}

// Export singleton instance
export const whatsappApiService = new WhatsAppApiService();
export default whatsappApiService;
