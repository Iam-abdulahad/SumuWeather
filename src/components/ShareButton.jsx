import html2canvas from "html2canvas-pro";
import { Camera } from "lucide-react";
import { useState } from "react";

export default function ShareButton({
  targetId = "app-dashboard",
  fileName = "sumo-weather.png",
}) {
  const [isCapturing, setIsCapturing] = useState(false);

  const canvasToBlob = (canvas) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Unable to create screenshot."));
        },
        "image/png",
        1,
      );
    });

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShare = async () => {
    if (isCapturing) return;

    const element = document.getElementById(targetId);

    if (!element) {
      console.error("Screenshot target not found.");
      return;
    }

    setIsCapturing(true);

    element.classList.add("screenshot-mode");

    try {
      // Let React/browser finish the temporary UI changes
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));

      const rect = element.getBoundingClientRect();

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: false,

        scale: Math.min(window.devicePixelRatio || 2, 2),

        width: rect.width,
        height: element.scrollHeight,

        backgroundColor: "#0B1526",

        logging: false,

        imageTimeout: 15000,

        onclone: (clonedDocument) => {
          const clonedElement = clonedDocument.getElementById(targetId);

          if (clonedElement) {
            clonedElement.classList.add("screenshot-clone");
          }
        },
      });

      const blob = await canvasToBlob(canvas);

      const file = new File([blob], fileName, {
        type: "image/png",
        lastModified: Date.now(),
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: "SuMo Weather",
            text: "Check out my current weather!",
            files: [file],
          });
        } catch (error) {
          // User cancelled the share dialog.
          if (error?.name !== "AbortError") {
            downloadBlob(blob, fileName);
          }
        }
      } else {
        downloadBlob(blob, fileName);
      }
    } catch (error) {
      console.error("Screenshot failed:", error);
    } finally {
      element.classList.remove("screenshot-mode");
      setIsCapturing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isCapturing}
      className="
        flex
        items-center
        gap-2
        rounded-glass
        bg-white/10
        px-4
        py-2
        font-body
        text-sm
        font-medium
        text-cloud-white
        transition
        hover:bg-white/20
        disabled:cursor-wait
        disabled:opacity-50
      "
      aria-label="Share snapshot"
    >
      <Camera size={18} className={isCapturing ? "animate-pulse" : ""} />

      <span className="hidden sm:inline">
        {isCapturing ? "Capturing..." : "Share"}
      </span>
    </button>
  );
}
