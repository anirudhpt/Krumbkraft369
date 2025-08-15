// Google Maps Script Loader Utility
// Ensures Google Maps API is loaded only once across the application

declare global {
  interface Window {
    google: any;
    googleMapsLoading?: boolean;
  }
}

let isLoading = false;
let isLoaded = false;
const callbacks: Array<() => void> = [];

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    // Add callback to queue
    callbacks.push(resolve);

    // If already loading, just wait
    if (isLoading) {
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      isLoading = true;
      existingScript.addEventListener('load', () => {
        isLoaded = true;
        isLoading = false;
        callbacks.forEach(callback => callback());
        callbacks.length = 0;
      });
      existingScript.addEventListener('error', () => {
        isLoading = false;
        callbacks.forEach(callback => reject(new Error('Failed to load Google Maps')));
        callbacks.length = 0;
      });
      return;
    }

    // Load the script
    isLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      callbacks.forEach(callback => callback());
      callbacks.length = 0;
    };
    
    script.onerror = () => {
      isLoading = false;
      const error = new Error('Failed to load Google Maps API');
      callbacks.forEach(callback => reject(error));
      callbacks.length = 0;
    };
    
    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && window.google && window.google.maps;
};
