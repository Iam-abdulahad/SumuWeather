import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * Full-viewport sky gradient background.
 * Crossfades between gradient states (~1.2s ease) when weather changes.
 * Adds a dark scrim on light gradients for WCAG AA contrast.
 */
export default function SkyBackground({ gradient }) {
  const prefersReducedMotion = useReducedMotion();

  const gradientStyle = useMemo(() => {
    if (!gradient) return {};
    return {
      background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
    };
  }, [gradient]);

  const key = gradient ? `${gradient.from}-${gradient.to}` : "default";

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <AnimatePresence mode="sync">
        <motion.div
          key={key}
          className="absolute inset-0"
          style={gradientStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.2,
            ease: "easeInOut",
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-slate-950/15" />

      {gradient?.needsScrim && <div className="absolute inset-0 sky-scrim" />}
    </div>
  );
}
