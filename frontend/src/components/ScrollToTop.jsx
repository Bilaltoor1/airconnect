import { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ScrollToTop = ({ scrollContainerId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(null);

  // Function to scroll the container to top
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Function to check scroll position
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const scrollTop = scrollContainerRef.current.scrollTop;
    if (scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    // Get the scroll container element
    scrollContainerRef.current = document.getElementById(scrollContainerId);
    
    if (scrollContainerRef.current) {
      // Check initial scroll position
      checkScrollPosition();
      
      // Add scroll event listener to the container
      scrollContainerRef.current.addEventListener('scroll', checkScrollPosition);
      
      // Clean up event listener
      return () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener('scroll', checkScrollPosition);
        }
      };
    }
  }, [scrollContainerId]);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-primary text-emerald-500 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-[1000] flex items-center justify-center"
      style={{ 
        display: isVisible ? 'flex' : 'none',
      }}
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </motion.button>
  );
};

export default ScrollToTop;
