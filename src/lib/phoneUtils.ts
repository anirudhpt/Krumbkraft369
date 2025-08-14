// Utility functions for phone number handling and URL parsing

export function extractPhoneFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Check for phone in query parameters - use exact value without cleaning
    const phoneFromQuery = urlObj.searchParams.get('phone');
    if (phoneFromQuery) {
      return phoneFromQuery; // Return exact phone number from URL
    }
    
    // Check for phone in pathname (e.g., /booking/8778710136)
    const pathSegments = urlObj.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    if (lastSegment && lastSegment.length > 0) {
      return lastSegment; // Return exact phone number from path
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting phone from URL:', error);
    return null;
  }
}

export function cleanPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Remove leading country codes if present
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.substring(2); // Remove +91 for Indian numbers
  }
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return cleaned.substring(1); // Remove +1 for US numbers
  }
  
  return cleaned;
}

export function isValidPhoneNumber(phone: string): boolean {
  // Simple validation: just check if it's not empty and contains digits
  // Use exact phone number without cleaning for Firestore lookup
  return Boolean(phone && phone.length > 0);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  if (cleaned.length === 10) {
    // Format as (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone; // Return original if not standard format
}

export function generateWhatsAppLink(phoneNumber: string, message?: string): string {
  const cleaned = cleanPhoneNumber(phoneNumber);
  const encodedMessage = message ? encodeURIComponent(message) : '';
  
  return `https://wa.me/${cleaned}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

// Extract phone number from current browser URL
export function getPhoneFromCurrentUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  return extractPhoneFromUrl(window.location.href);
}
