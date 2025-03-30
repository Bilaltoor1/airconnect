import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImagePreviewModal = ({ isOpen, onClose, imageUrl, altText = 'Image' }) => {
  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center"
          open={isOpen}
          onClose={onClose}
        >
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div 
            className="relative max-w-screen max-h-screen flex items-center justify-center p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button 
              className="absolute top-2 right-2 z-50 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-white transition-all duration-200"
              onClick={onClose}
            >
              <X size={24} />
            </button>
            
            <img 
              src={imageUrl} 
              alt={altText} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg" 
            />
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ImagePreviewModal;
