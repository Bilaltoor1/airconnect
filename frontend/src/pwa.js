import { registerSW } from 'virtual:pwa-register';

// This is the service worker registration function
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported, registering...');
    
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('New content available. Reload prompt shown.');
        if (confirm('New content available. Reload?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
      onRegistered(registration) {
        console.log('Service Worker registered successfully:', registration);
      },
      onRegisterError(error) {
        console.error('Service Worker registration failed:', error);
      }
    });
    
    return updateSW;
  } else {
    console.warn('Service Worker is not supported in this browser');
    return null;
  }
};
