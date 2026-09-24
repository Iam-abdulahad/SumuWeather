import html2canvas from "html2canvas-pro";
import { Camera, Check, Download, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareButton({
  targetId = "app-dashboard",
  fileName = "sumo-weather.png",
}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState(null);

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleShare = async () => {
    if (isCapturing) return;

    const element = document.getElementById(targetId);

    if (!element) {
      setMessage("Weather dashboard could not be captured.");
      return;
    }

    setIsCapturing(true);
    setMessage(null);

    try {
      /*
       * Hide elements that should not appear in the snapshot.
       */
      const hiddenElements = document.querySelectorAll(
        '[data-capture-hide="true"]',
      );

      hiddenElements.forEach((el) => {
        el.dataset.previousVisibility = el.style.visibility;

        el.style.visibility = "hidden";
      });

      /*
       * Give the browser a moment to finish layout/paint.
       */
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const devicePixelRatio = window.devicePixelRatio || 1;

      /*
       * High-resolution capture.
       *
       * 2x minimum
       * 4x maximum
       */
      const scale = Math.min(Math.max(devicePixelRatio * 2, 2), 4);

      const canvas = await html2canvas(element, {
        scale,

        useCORS: true,

        allowTaint: false,

        backgroundColor: "#0B1526",

        logging: false,

        imageTimeout: 10000,

        removeContainer: true,

        windowWidth: element.scrollWidth,

        windowHeight: element.scrollHeight,

        scrollX: 0,

        scrollY: -window.scrollY,

        onclone: (clonedDocument) => {
          /*
           * Remove animation during capture.
           */
          clonedDocument.querySelectorAll("*").forEach((node) => {
            node.style.animation = "none";
            node.style.transition = "none";
          });
        },
      });

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error("Unable to create image."));
            }
          },
          "image/png",
          1,
        );
      });

      const file = new File([blob], fileName, {
        type: "image/png",
      });

      /*
       * Native mobile share.
       */
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        try {
          await navigator.share({
            title: "SuMo Weather",
            text: "Current weather from SuMo Weather",
            files: [file],
          });

          setMessage("Weather snapshot shared.");
        } catch (error) {
          /*
           * AbortError means the user cancelled sharing.
           */
          if (error?.name !== "AbortError") {
            downloadBlob(blob, fileName);

            setMessage("Sharing failed, so the image was downloaded instead.");
          }
        }
      } else {
        /*
         * Desktop/browser fallback.
         */
        downloadBlob(blob, fileName);

        setMessage("Weather snapshot downloaded.");
      }
    } catch (error) {
      console.error("Weather snapshot failed:", error);

      setMessage("Could not create the weather snapshot. Please try again.");
    } finally {
      /*
       * Restore hidden elements.
       */
      document.querySelectorAll('[data-capture-hide="true"]').forEach((el) => {
        el.style.visibility = el.dataset.previousVisibility || "";

        delete el.dataset.previousVisibility;
      });

      setIsCapturing(false);

      setTimeout(() => {
        setMessage(null);
      }, 4000);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        disabled={isCapturing}
        className="flex items-center gap-2 rounded-glass bg-white/10 px-4 py-2 font-body text-sm font-medium text-cloud-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Share snapshot"
      >
        {isCapturing ? (
          <Camera size={18} className="animate-pulse" />
        ) : (
          <Share2 size={18} />
        )}

        <span className="hidden sm:inline">
          {isCapturing ? "Creating…" : "Share"}
        </span>
      </button>

      {message && (
        <div
          role="status"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-64 rounded-xl border border-white/10 bg-deep-atmosphere/95 p-3 text-xs text-cloud-white shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-2">
            <Check
              size={15}
              className="mt-0.5 flex-shrink-0 text-amber-flare"
            />

            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
