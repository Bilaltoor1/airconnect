import axios from 'axios';

/**
 * Enhanced API client with offline support for PWA
 */
const pwaApiClient = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3001/api" : "/api",
  withCredentials: true
});

// Request interceptor to add offline handling
pwaApiClient.interceptors.request.use(async config => {
  // Check if we're online
  if (!navigator.onLine) {
    // For GET requests, try to serve from cache
    if (config.method.toLowerCase() === 'get') {
      // Let the request go through - workbox will handle caching
      return config;
    } else {
      // For write operations, we can store them in IndexedDB to sync later
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        // Store the request data to process later with Background Sync
        // This is a simplified example - you'd need to implement background sync
        await storeRequestForLater(config);
        
        throw new Error('You are offline. Request will be sent when you are back online.');
      }
    }
  }
  
  return config;
}, error => Promise.reject(error));

/**
 * Stores failed requests to process later when online
 */
const storeRequestForLater = async (config) => {
  // This is a simplified implementation
  // In a real app, you would use IndexedDB to store the request
  
  // Example using localStorage (not recommended for production):
  const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
  pendingRequests.push({
    url: config.url,
    method: config.method,
    data: config.data,
    timestamp: Date.now()
  });
  localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
  
  // Register a sync event if supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-pending-requests');
  }
};

export default pwaApiClient;
