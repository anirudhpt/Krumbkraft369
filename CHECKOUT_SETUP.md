# Checkout Setup Instructions

## Google Maps API Setup

To enable address autocomplete functionality in the checkout page, you need to set up Google Maps API:

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Configure Environment Variables:**
   - Copy the Google Maps API key
   - Add it to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Update Business WhatsApp Number:**
   - Update the business WhatsApp number in `.env.local`:
   ```bash
   NEXT_PUBLIC_BUSINESS_WHATSAPP=your_business_number
   ```

## Firestore Database Structure

The checkout page uses a Firestore collection called `Address` with the following structure:

```typescript
interface Address {
  id?: string;
  userId: string;        // User's phone number
  fullAddress: string;   // Complete address from Google Places
  area: string;          // Area/locality
  city: string;          // City name
  pincode: string;       // Postal code
  landmark?: string;     // Optional landmark
  isDefault: boolean;    // Whether this is the default address
}
```

## Features

- **Address Management:** Users can save multiple addresses and set a default one
- **Google Places Autocomplete:** Auto-fills address details when typing
- **Delivery Scheduling:** Users can select delivery date and time
- **Order Summary:** Shows cart items with quantities and total amount
- **WhatsApp Integration:** Sends complete order details via WhatsApp

## Usage

1. Users add items to cart on the home page
2. Click "Proceed to check out" button
3. Select or add delivery address
4. Choose delivery date and time
5. Review order summary
6. Click "Place Order" to send via WhatsApp

## Security Notes

- API keys should never be committed to version control
- Restrict Google Maps API key to your domain
- Consider implementing proper authentication for production use
