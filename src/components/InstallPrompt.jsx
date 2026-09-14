import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import GlassCard from './GlassCard';
import useReducedMotion from '../hooks/useReducedMotion';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: prefersReducedMotion ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: prefersReducedMotion ? 0 : 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-[80px] left-4 right-4 z-40 md:bottom-6 md:left-auto md:right-6 md:w-96"
        >
          <GlassCard className="flex items-center gap-4 p-4 shadow-xl border-amber-flare/30">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-flare/20 text-amber-flare">
              <Download size={20} />
            </div>
            
            <div className="flex-1">
              <h3 className="font-body text-sm font-semibold text-cloud-white">
                Add to Home Screen
              </h3>
              <p className="font-body text-micro text-cloud-white/85">
                Install SuMo for offline access and a native app experience.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleInstall}
                className="rounded-glass bg-amber-flare px-3 py-1 font-body text-xs font-semibold text-deep-atmosphere"
              >
                Install
              </button>
              <button 
                onClick={handleDismiss}
                className="text-cloud-white/75 hover:text-cloud-white"
              >
                <X size={16} className="mx-auto" />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
