# N8N Webhook Integration for KrumbKraft

This document explains how to set up n8n workflows to handle WhatsApp notifications for order confirmations.

## Overview

When an order is placed, the application sends a webhook to your n8n instance with order details. N8N then handles:
- Sending WhatsApp confirmation to customer
- Sending WhatsApp notification to business
- Optional: Email notifications, SMS, order tracking updates, etc.

## Webhook Data Structure

The webhook sends the following data structure:

```json
{
  "event_type": "order_placed",
  "order_id": "ORD-001",
  "customer": {
    "name": "John Doe",
    "phone": "919876543210"
  },
  "order_details": {
    "items": [
      {
        "product_name": "Sourdough Bread",
        "quantity": 2,
        "unit_price": 150,
        "total_price": 300,
        "selected_option": {
          "name": "Large",
          "price_adjustment": 50
        }
      }
    ],
    "total_amount": 300,
    "delivery_date": "2025-08-18",
    "delivery_address": {
      "full_address": "123 Main St, Apartment 4B",
      "area": "Downtown",
      "city": "Mumbai",
      "pincode": "400001",
      "landmark": "Near Central Mall"
    },
    "order_status": "placed",
    "created_at": "2025-08-17T10:30:00Z",
    "uuid": "550e8400-e29b-41d4-a716-446655440000"
  },
  "business": {
    "name": "KrumbKraft",
    "phone": "919876543210",
    "whatsapp_phone": "919876543210"
  },
  "notifications": {
    "send_customer_confirmation": true,
    "send_business_notification": true,
    "send_whatsapp": true,
    "send_email": false,
    "send_sms": false
  },
  "timestamp": "2025-08-17T10:30:00Z",
  "source": "krumbkraft-app",
  "version": "1.0"
}
```

## N8N Workflow Setup

### 1. Create Webhook Trigger

1. In n8n, create a new workflow
2. Add a "Webhook" trigger node
3. Set the webhook path (e.g., `/krumbkraft-orders`)
4. Copy the webhook URL and set it in your environment variables

### 2. WhatsApp Integration Options

#### Option A: WhatsApp Business API (Meta)
```json
{
  "method": "POST",
  "url": "https://graph.facebook.com/v22.0/{{PHONE_NUMBER_ID}}/messages",
  "headers": {
    "Authorization": "Bearer {{ACCESS_TOKEN}}",
    "Content-Type": "application/json"
  },
  "body": {
    "messaging_product": "whatsapp",
    "to": "{{customer.phone}}",
    "type": "text",
    "text": {
      "body": "🥖 *KrumbKraft Order Confirmation*\n\nHi {{customer.name}}! 👋\n\nYour order has been successfully placed!\n\n*Order ID:* {{order_id}}\n*Delivery Date:* {{order_details.delivery_date}}\n\n*Total Amount:* ₹{{order_details.total_amount}}\n\nThank you for choosing KrumbKraft! 🍞"
    }
  }
}
```

#### Option B: WhatsApp via Twilio
```json
{
  "method": "POST",
  "url": "https://api.twilio.com/2010-04-01/Accounts/{{ACCOUNT_SID}}/Messages.json",
  "headers": {
    "Authorization": "Basic {{BASE64_ENCODED_CREDENTIALS}}"
  },
  "body": {
    "From": "whatsapp:+14155238886",
    "To": "whatsapp:{{customer.phone}}",
    "Body": "🥖 KrumbKraft Order Confirmation\n\nOrder ID: {{order_id}}\nTotal: ₹{{order_details.total_amount}}\n\nThank you!"
  }
}
```

#### Option C: Integration with other WhatsApp services
- WhatsApp Business Cloud API
- ChatAPI
- GreenAPI
- etc.

### 3. Sample N8N Workflow Nodes

1. **Webhook Trigger** - Receives order data
2. **Switch Node** - Route based on event_type
3. **Set Node** - Format WhatsApp message
4. **HTTP Request Node** - Send WhatsApp to customer
5. **HTTP Request Node** - Send WhatsApp to business
6. **Optional: Email Node** - Send email confirmation
7. **Optional: Database Node** - Log notification status

### 4. Message Templates

#### Customer Confirmation
```
🥖 *KrumbKraft Order Confirmation*

Hi {{customer.name}}! 👋

Your order has been successfully placed!

*Order ID:* {{order_id}}
*Delivery Date:* {{order_details.delivery_date}}

*Your Order:*
{{#each order_details.items}}
{{quantity}}x {{product_name}} - ₹{{total_price}}
{{/each}}

*Total Amount:* ₹{{order_details.total_amount}}

*Delivery Address:*
{{order_details.delivery_address.full_address}}

*Order Status:* Confirmed ✅

Thank you for choosing KrumbKraft! 🍞
We'll keep you updated on your order status.
```

#### Business Notification
```
🥖 *KrumbKraft New Order*

*Order ID:* {{order_id}}
*Customer:* {{customer.name}}
*Phone:* {{customer.phone}}

*Delivery Date:* {{order_details.delivery_date}}

*Items:*
{{#each order_details.items}}
{{quantity}}x {{product_name}} - ₹{{total_price}}
{{/each}}

*Total Amount:* ₹{{order_details.total_amount}}

*Address:* {{order_details.delivery_address.full_address}}

Please confirm this order. Thank you!
```

### 5. Error Handling

Add error handling nodes to:
- Retry failed WhatsApp sends
- Log errors to a database
- Send fallback notifications
- Alert admin of system issues

### 6. Environment Variables in N8N

Set these environment variables in your n8n instance:
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `BUSINESS_WHATSAPP_NUMBER`
- `TWILIO_ACCOUNT_SID` (if using Twilio)
- `TWILIO_AUTH_TOKEN` (if using Twilio)

## Testing

1. Set up your n8n webhook URL in the app environment
2. Place a test order
3. Check n8n execution logs
4. Verify WhatsApp messages are sent
5. Monitor for any errors or failed deliveries

## Advanced Features

You can extend the workflow to:
- Send order status updates (confirmed, out for delivery, delivered)
- Handle order cancellations
- Send promotional messages
- Integrate with payment gateways
- Sync with inventory management
- Generate delivery tracking links

## Security

- Use API keys or basic auth on your webhook
- Validate webhook signatures if possible
- Set up rate limiting
- Monitor for suspicious activity
- Keep access tokens secure
