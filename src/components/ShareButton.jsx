import html2canvas from 'html2canvas-pro';
import { Camera } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ targetId = 'app-dashboard', fileName = 'weather-snapshot.png' }) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleShare = async () => {
    if (isCapturing) return;
    
    const element = document.getElementById(targetId);
    if (!element) {
      console.error('Target element not found');
      return;
    }

    try {
      setIsCapturing(true);
      
      // We temporarily adjust some styles to make sure the capture looks right
      // html2canvas doesn't always love backdrop-blur, but pro handles it better.
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#0B1526', // Fallback
        logging: false
      });

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Canvas to Blob failed');

        // Check if Web Share API is supported and can share files
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'image/png' })] })) {
          const file = new File([blob], fileName, { type: 'image/png' });
          try {
            await navigator.share({
              title: 'SuMo Weather',
              text: 'Check out the weather!',
              files: [file]
            });
          } catch (e) {
            // User cancelled or share failed, fallback to download
            downloadBlob(blob, fileName);
          }
        } else {
          // Desktop fallback: Download the image
          downloadBlob(blob, fileName);
        }
      }, 'image/png');

    } catch (err) {
      console.error('Failed to capture screen:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={handleShare}
      disabled={isCapturing}
      className="flex items-center gap-2 rounded-glass bg-white/10 px-4 py-2 font-body text-sm font-medium text-cloud-white transition-colors hover:bg-white/20 disabled:opacity-50"
      aria-label="Share snapshot"
    >
      <Camera size={18} className={isCapturing ? 'animate-pulse' : ''} />
      <span className="hidden sm:inline">{isCapturing ? 'Capturing...' : 'Share'}</span>
    </button>
  );
}
