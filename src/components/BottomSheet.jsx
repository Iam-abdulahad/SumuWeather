import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const prefersReducedMotion = useReducedMotion();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const variants = {
    hidden: { y: '100%', opacity: prefersReducedMotion ? 0 : 1 },
    visible: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: prefersReducedMotion ? 0 : 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-deep-atmosphere/60 backdrop-blur-sm md:hidden"
          />

          {/* Sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-[32px] border-t border-white/20 bg-deep-atmosphere shadow-2xl md:hidden"
          >
            {/* Drag Handle */}
            <div className="flex w-full cursor-grab active:cursor-grabbing items-center justify-center pt-4 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 pb-4">
              <h2 className="font-body text-section-head font-semibold text-cloud-white">
                {title}
              </h2>
              <button 
                onClick={onClose}
                className="rounded-full bg-white/10 p-2 text-cloud-white transition-colors hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-6 py-4 pb-[env(safe-area-inset-bottom)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
