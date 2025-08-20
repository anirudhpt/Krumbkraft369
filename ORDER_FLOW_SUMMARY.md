# KrumbKraft Order Flow with Webhook Integration

## 🎯 **Current Implementation**

### **1. Home Page Flow**
- Users browse menu and add items to cart
- Cart displays total amount
- **"Proceed to Checkout"** button saves cart to localStorage and navigates to `/checkout`
- ❌ Removed WhatsApp ordering modal and functions

### **2. Checkout Page Flow**
- Loads cart items from localStorage
- User enters delivery address and date
- **"Place Order"** button:
  1. Saves order to Firebase (OrderStatus + FinanceRecords)
  2. Triggers webhook to n8n with order data
  3. Shows success modal with order ID
  4. Provides fallback WhatsApp links if needed

### **3. Webhook Integration**
- **Production URL**: `https://lakshs.app.n8n.cloud/webhook/880776a4-635c-49a2-852b-9e136fa61774`
- **Fallback URL**: `https://lakshs.app.n8n.cloud/webhook-test/880776a4-635c-49a2-852b-9e136fa61774`
- **Method**: GET with query parameters
- **Retry Logic**: 3 attempts with exponential backoff
- **Fallback**: If production fails, tries test URL

### **4. Webhook Data Sent**
```
event_type=order_placed
order_id=ORD-001
customer_name=John Doe
customer_phone=919876543210
total_amount=500
delivery_date=2025-08-21
order_status=placed
uuid=unique-id
timestamp=2025-08-20T03:00:00Z
source=krumbkraft-app
items=[{"product_name":"Sourdough Bread","quantity":2,...}]
delivery_address={"full_address":"123 Main St",...}
```

## 🚀 **To Activate**

### **In N8N:**
1. Go to your n8n workflow
2. Click the **toggle switch** in the top-right to activate the workflow
3. This will make the production webhook URL (`/webhook/...`) work

### **Test the Flow:**
1. Go to `http://localhost:3000/home`
2. Add items to cart
3. Click "Proceed to Checkout"
4. Fill in delivery details
5. Click "Place Order"
6. Check n8n executions for webhook trigger

## 🔧 **Environment Variables**
```bash
# Production webhook (needs workflow activated)
N8N_WEBHOOK_URL=https://lakshs.app.n8n.cloud/webhook/880776a4-635c-49a2-852b-9e136fa61774

# Test webhook (always works)
N8N_TEST_WEBHOOK_URL=https://lakshs.app.n8n.cloud/webhook-test/880776a4-635c-49a2-852b-9e136fa61774

# Business contact
NEXT_PUBLIC_BUSINESS_WHATSAPP=9876543210
```

## 🎉 **Benefits**
- ✅ Clean checkout flow without WhatsApp complexity
- ✅ Automatic webhook notifications via n8n
- ✅ Fallback system for reliability
- ✅ Professional order management
- ✅ Easy to extend with email, SMS, etc. in n8n

The system is now ready! Just activate your n8n workflow and test the complete order flow.
