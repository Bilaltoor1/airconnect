import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineFallback = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <WifiOff size={40} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">You're offline</h2>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        Please check your internet connection and try again.
      </p>
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Some features may still work while you're offline.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary w-full"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};

export default OfflineFallback;
