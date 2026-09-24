import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import GlassCard from "./GlassCard";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      setDeferredPrompt(event);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();

      const result = await deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error("Install prompt failed:", error);
    } finally {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="
          screenshot-hide
          fixed
          bottom-[85px]
          left-4
          right-4
          z-[70]
          md:bottom-6
          md:left-auto
          md:right-6
          md:w-96
        "
      >
        <GlassCard className="flex items-center gap-4 p-4 shadow-2xl">
          <div
            className="
            flex
            h-10
            w-10
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            bg-amber-flare/15
            text-amber-flare
          "
          >
            <Download size={20} />
          </div>

          <div className="flex-1">
            <h3 className="font-body text-sm font-semibold text-cloud-white">
              Install SuMo Weather
            </h3>

            <p className="mt-1 font-body text-micro text-cloud-white/70">
              Add SuMo Weather to your home screen for quick access.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleInstall}
              className="
                rounded-lg
                bg-amber-flare
                px-3
                py-1.5
                font-body
                text-xs
                font-bold
                text-deep-atmosphere
                transition
                hover:brightness-110
              "
            >
              Install
            </button>

            <button
              onClick={() => setIsVisible(false)}
              className="
                rounded-lg
                p-1
                text-cloud-white/60
                transition
                hover:bg-white/10
                hover:text-cloud-white
              "
              aria-label="Dismiss install prompt"
            >
              <X size={16} className="mx-auto" />
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
