import { useState, useEffect } from 'react';

const SplashScreen = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6">
          {/* Replace with your app logo */}
          <img src="/icons/icon-512x512.png" alt="Air Connect Logo" className="w-full h-full" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Air Connect</h1>
        <p className="text-green-100">Streamlining academic communication</p>
      </div>
    </div>
  );
};

export default SplashScreen;
