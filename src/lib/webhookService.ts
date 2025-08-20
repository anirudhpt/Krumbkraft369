// Webhook service for triggering n8n workflows

export interface OrderWebhookData {
  event_type: 'order_placed' | 'order_confirmed' | 'order_delivered' | 'order_cancelled';
  order_id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  order_details: {
    items: Array<{
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      selected_option?: {
        name: string;
        price_adjustment: number;
      };
    }>;
    total_amount: number;
    delivery_date: string;
    delivery_address: {
      full_address: string;
      area: string;
      city: string;
      pincode: string;
      landmark?: string;
    };
    order_status: string;
    created_at: string;
    uuid: string;
  };
  business: {
    name: string;
    phone: string;
    whatsapp_phone?: string;
  };
  notifications: {
    send_customer_confirmation: boolean;
    send_business_notification: boolean;
    send_whatsapp: boolean;
    send_email: boolean;
    send_sms: boolean;
  };
  messages: {
    customer_confirmation: string;
    business_notification: string;
  };
}

export interface WebhookConfig {
  n8n_webhook_url: string;
  n8n_test_webhook_url?: string;
  api_key?: string;
  timeout?: number;
  retry_attempts?: number;
}

class WebhookService {
  private config: WebhookConfig;

  constructor() {
    this.config = {
      // Production webhook URL (primary)
      n8n_webhook_url: process.env.N8N_WEBHOOK_URL || 'https://lakshs.app.n8n.cloud/webhook/880776a4-635c-49a2-852b-9e136fa61774',
      // Test webhook URL as fallback
      n8n_test_webhook_url: process.env.N8N_TEST_WEBHOOK_URL || 'https://lakshs.app.n8n.cloud/webhook-test/880776a4-635c-49a2-852b-9e136fa61774',
      api_key: process.env.N8N_API_KEY || '',
      timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '10000'),
      retry_attempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '3')
    };
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Remove country codes (91 for India, 1 for US)
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned.substring(2);
    }
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return cleaned.substring(1);
    }
    
    return cleaned;
  }

  private generateCustomerConfirmationMessage(
    orderId: string,
    customerName: string,
    orderItems: Array<{
      product_name: string;
      quantity: number;
      total_price: number;
      selected_option?: { name: string; price_adjustment: number };
    }>,
    totalAmount: number,
    deliveryDate: string,
    deliveryAddress: string
  ): string {
    const itemsList = orderItems.map(item => 
      `${item.quantity}x ${item.product_name}${item.selected_option ? ` (${item.selected_option.name})` : ''} - Rs${item.total_price}`
    ).join('\n');

    return `*KrumbKraft Order Confirmation*

Hi ${customerName},

Your order has been successfully placed and confirmed!

*Order ID:* ${orderId}
*Delivery Date:* ${deliveryDate}

*Your Order:*
${itemsList}

*Total Amount:* Rs${totalAmount}

*Delivery Address:*
${deliveryAddress}

*Status:* Confirmed
*Expected Delivery:* ${deliveryDate}

Thank you for choosing KrumbKraft!
We're preparing your fresh baked goods with love.

For any queries, feel free to contact us.

*Track your order:* Use Order ID ${orderId}`;
  }

  private generateBusinessNotificationMessage(
    orderId: string,
    customerName: string,
    customerPhone: string,
    orderItems: Array<{
      product_name: string;
      quantity: number;
      total_price: number;
      selected_option?: { name: string; price_adjustment: number };
    }>,
    totalAmount: number,
    deliveryDate: string,
    deliveryAddress: string
  ): string {
    const itemsList = orderItems.map(item => 
      `${item.quantity}x ${item.product_name}${item.selected_option ? ` (${item.selected_option.name})` : ''} - Rs${item.total_price}`
    ).join('\n');

    const formattedPhone = this.formatPhoneNumber(customerPhone);

    return `*KrumbKraft New Order*

*Order ID:* ${orderId}
*Customer:* ${customerName}
*Phone:* ${formattedPhone}

*Delivery Date:* ${deliveryDate}

*Order Items:*
${itemsList}

*Total Amount:* Rs${totalAmount}

*Delivery Address:*
${deliveryAddress}

*Status:* New Order - Needs Confirmation

Please confirm this order and update preparation status.`;
  }

  async triggerWebhook(data: OrderWebhookData): Promise<unknown> {
    if (!this.config.n8n_webhook_url) {
      console.warn('N8N webhook URL not configured');
      return null;
    }

    // For GET requests, we'll send key data as query parameters
    const queryParams = new URLSearchParams({
      event_type: data.event_type,
      order_id: data.order_id,
      customer_name: data.customer.name,
      customer_phone: this.formatPhoneNumber(data.customer.phone),
      total_amount: data.order_details.total_amount.toString(),
      delivery_date: data.order_details.delivery_date,
      order_status: data.order_details.order_status,
      uuid: data.order_details.uuid,
      timestamp: new Date().toISOString(),
      source: 'krumbkraft-app'
    });

    // Add complex data as JSON strings in query params
    queryParams.append('items', JSON.stringify(data.order_details.items));
    queryParams.append('delivery_address', JSON.stringify(data.order_details.delivery_address));
    queryParams.append('customer_confirmation_message', data.messages.customer_confirmation);
    queryParams.append('business_notification_message', data.messages.business_notification);

    // Try production URL first, then fallback to test URL
    let webhookUrl = `${this.config.n8n_webhook_url}?${queryParams.toString()}`;
    
    try {
      return await this.sendGetRequest(webhookUrl);
    } catch (productionError: unknown) {
      console.warn('Production webhook failed, trying test webhook:', (productionError as Error).message);
      
      if (this.config.n8n_test_webhook_url) {
        webhookUrl = `${this.config.n8n_test_webhook_url}?${queryParams.toString()}`;
        return await this.sendGetRequest(webhookUrl);
      }
      
      throw productionError;
    }
  }

  private async sendGetRequest(url: string, attempt = 1): Promise<unknown> {
    try {
      console.log(`Sending webhook GET request (attempt ${attempt}):`, {
        url: url.split('?')[0], // Log URL without params for cleaner logs
        attempt
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'KrumbKraft-App/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json().catch(() => ({ success: true }));
      console.log('Webhook sent successfully:', result);
      return result;

    } catch (error: unknown) {
      console.error(`Webhook attempt ${attempt} failed:`, (error as Error).message);

      if (attempt < (this.config.retry_attempts || 3)) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying webhook in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendGetRequest(url, attempt + 1);
      }

      throw error;
    }
  }

  async triggerOrderPlacedWebhook(orderData: {
    orderId: string;
    uuid: string;
    customerName: string;
    customerPhone: string;
    orderItems: Array<{
      productName: string;
      quantity: number;
      price: number;
      selectedOption?: { name: string; priceAdjustment: number };
    }>;
    totalAmount: number;
    deliveryDate: string;
    deliveryAddress: {
      fullAddress: string;
      area: string;
      city: string;
      pincode: string;
      landmark?: string;
    };
  }): Promise<unknown> {
    // Generate order items for messages
    const orderItemsForMessages = orderData.orderItems.map(item => ({
      product_name: item.productName,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      selected_option: item.selectedOption ? {
        name: item.selectedOption.name,
        price_adjustment: item.selectedOption.priceAdjustment
      } : undefined
    }));

    const deliveryAddressString = `${orderData.deliveryAddress.fullAddress}${orderData.deliveryAddress.landmark ? `\nLandmark: ${orderData.deliveryAddress.landmark}` : ''}`;

    const webhookData: OrderWebhookData = {
      event_type: 'order_placed',
      order_id: orderData.orderId,
      customer: {
        name: orderData.customerName,
        phone: this.formatPhoneNumber(orderData.customerPhone)
      },
      order_details: {
        items: orderData.orderItems.map(item => ({
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          selected_option: item.selectedOption ? {
            name: item.selectedOption.name,
            price_adjustment: item.selectedOption.priceAdjustment
          } : undefined
        })),
        total_amount: orderData.totalAmount,
        delivery_date: orderData.deliveryDate,
        delivery_address: {
          full_address: orderData.deliveryAddress.fullAddress,
          area: orderData.deliveryAddress.area,
          city: orderData.deliveryAddress.city,
          pincode: orderData.deliveryAddress.pincode,
          landmark: orderData.deliveryAddress.landmark
        },
        order_status: 'placed',
        created_at: new Date().toISOString(),
        uuid: orderData.uuid
      },
      business: {
        name: 'KrumbKraft',
        phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '',
        whatsapp_phone: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || ''
      },
      notifications: {
        send_customer_confirmation: true,
        send_business_notification: true,
        send_whatsapp: true,
        send_email: false,
        send_sms: false
      },
      messages: {
        customer_confirmation: this.generateCustomerConfirmationMessage(
          orderData.orderId,
          orderData.customerName,
          orderItemsForMessages,
          orderData.totalAmount,
          orderData.deliveryDate,
          deliveryAddressString
        ),
        business_notification: this.generateBusinessNotificationMessage(
          orderData.orderId,
          orderData.customerName,
          orderData.customerPhone,
          orderItemsForMessages,
          orderData.totalAmount,
          orderData.deliveryDate,
          deliveryAddressString
        )
      }
    };

    return this.triggerWebhook(webhookData);
  }

  async triggerOrderStatusWebhook(
    orderId: string,
    newStatus: 'confirmed' | 'delivered' | 'cancelled',
    customerPhone: string,
    customerName: string
  ): Promise<unknown> {
    const webhookData: Partial<OrderWebhookData> = {
      event_type: `order_${newStatus}` as OrderWebhookData['event_type'],
      order_id: orderId,
      customer: {
        name: customerName,
        phone: this.formatPhoneNumber(customerPhone)
      },
      order_details: {
        items: [],
        total_amount: 0,
        delivery_date: '',
        delivery_address: {
          full_address: '',
          area: '',
          city: '',
          pincode: ''
        },
        order_status: newStatus,
        created_at: new Date().toISOString(),
        uuid: ''
      },
      business: {
        name: 'KrumbKraft',
        phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '',
        whatsapp_phone: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || ''
      },
      notifications: {
        send_customer_confirmation: true,
        send_business_notification: false,
        send_whatsapp: true,
        send_email: false,
        send_sms: false
      }
    };

    return this.triggerWebhook(webhookData as OrderWebhookData);
  }
}

// Export singleton instance
export const webhookService = new WebhookService();
export default webhookService;
