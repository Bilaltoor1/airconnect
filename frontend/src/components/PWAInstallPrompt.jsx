import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Enhanced method to check if the app is installed/standalone
    const checkIfInstalled = () => {
      // Method 1: Check if in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Method 2: Check if on iOS and launched from home screen
      const isIOSInstalled = 
        window.navigator.standalone || 
        window.location.href.includes('homescreen=1');
      // Method 3: Check a localStorage flag we'll set when installed
      const hasInstalledFlag = localStorage.getItem('pwa-installed') === 'true';
      
      console.log("Installation check:", { 
        isStandalone, 
        isIOSInstalled, 
        hasInstalledFlag,
        userAgent: navigator.userAgent 
      });
      
      if (isStandalone || isIOSInstalled || hasInstalledFlag) {
        console.log("App is detected as installed");
        setIsAppInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }
      return false;
    };

    // Run initial check
    if (checkIfInstalled()) return;

    // Setup display mode change listener
    const displayModeHandler = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log("Display mode changed to standalone");
        setIsAppInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      }
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log("Install prompt detected!");
      setInstallPrompt(e);
    };

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', displayModeHandler);
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed event fired');
      setIsAppInstalled(true);
      setInstallPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    });

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', displayModeHandler);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      console.log("No install prompt available, showing manual instructions");
      alert("To install this app:\n1. Open browser menu (three dots)\n2. Select 'Install Air Connect' or 'Add to Home Screen'");
      return;
    }

    console.log("Triggering install prompt");
    installPrompt.prompt();
    
    try {
      const { outcome } = await installPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Error with install prompt:', error);
    }
  };

  // Don't render the button if app is installed
  if (isAppInstalled) {
    console.log("App is installed, not showing install button");
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-xl shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-200"
      >
        <Download size={18} />
        Install App
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
