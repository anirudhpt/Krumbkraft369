import { generateWhatsAppLink } from './phoneUtils';

// Utility functions for generating WhatsApp booking links

export interface WhatsAppBookingConfig {
  baseUrl: string; // Your app's base URL (e.g., https://yourapp.com)
  businessPhone?: string; // Your business WhatsApp number
  defaultMessage?: string; // Default message template
}

export function generateBookingLink(
  customerPhone: string, 
  config: WhatsAppBookingConfig
): string {
  const encodedUrl = encodeURIComponent(`${config.baseUrl}/redirect?phone=${customerPhone}`);
  const message = config.defaultMessage || 
    `Hi! Click this link to place your order: ${config.baseUrl}/redirect?phone=${customerPhone}`;
  
  return generateWhatsAppLink(customerPhone, message);
}

export function generateBusinessWhatsAppLink(
  customerPhone: string,
  config: WhatsAppBookingConfig,
  customMessage?: string
): string {
  if (!config.businessPhone) {
    throw new Error('Business phone number is required');
  }

  const bookingUrl = `${config.baseUrl}/redirect?phone=${customerPhone}`;
  const message = customMessage || 
    `Hello! Welcome to KrumbKraft. Click here to browse our menu and place your order: ${bookingUrl}`;

  return generateWhatsAppLink(config.businessPhone, message);
}

// Generate a shareable link for customers
export function generateCustomerBookingUrl(
  customerPhone: string,
  baseUrl: string
): string {
  return `${baseUrl}/redirect?phone=${customerPhone}`;
}

// Example usage for marketing/customer service
export function createBookingLinks(customerPhone: string) {
  const config: WhatsAppBookingConfig = {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    businessPhone: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP, // Optional
  };

  return {
    // Direct booking URL (to share via any channel)
    directBookingUrl: generateCustomerBookingUrl(customerPhone, config.baseUrl),
    
    // WhatsApp link that customer can click to message themselves the booking link
    customerWhatsAppLink: generateBookingLink(customerPhone, config),
    
    // WhatsApp link for business to send to customer (if business phone is configured)
    businessWhatsAppLink: config.businessPhone 
      ? generateBusinessWhatsAppLink(customerPhone, config)
      : null,
  };
}

// Helper for QR code generation (you can integrate with a QR code library)
export function generateBookingQRData(customerPhone: string): string {
  const config: WhatsAppBookingConfig = {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  };
  
  return generateCustomerBookingUrl(customerPhone, config.baseUrl);
}
