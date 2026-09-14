import { useState, useRef, useEffect } from 'react';

export default function LocationCarousel({ locations, activeIndex, onIndexChange, children }) {
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Sync scroll position with activeIndex when changed externally
  useEffect(() => {
    if (!isScrolling && containerRef.current) {
      const container = containerRef.current;
      const targetScroll = container.clientWidth * activeIndex;
      if (Math.abs(container.scrollLeft - targetScroll) > 10) {
        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  }, [activeIndex, isScrolling]);

  // Handle native scroll snapping to update activeIndex
  const handleScroll = (e) => {
    const container = e.target;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    
    if (index !== activeIndex) {
      onIndexChange(index);
    }
  };

  // Multiple locations logic only matters on mobile, desktop will just render normally
  return (
    <div className="w-full pb-8 md:pb-0">
      <div 
        ref={containerRef}
        className="flex w-full snap-x snap-mandatory overflow-x-auto hide-scrollbar md:block md:overflow-x-visible md:snap-none"
        onScroll={handleScroll}
        onTouchStart={() => setIsScrolling(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsScrolling(false), 150); // slight delay to allow snap to finish
        }}
      >
        {locations.length > 0 ? (
          locations.map((loc, i) => (
            <div 
              key={loc.id || i}
              className="w-full flex-shrink-0 snap-center px-4 md:px-0"
              style={{ minWidth: '100%' }}
            >
              {/* Only render children for the active or adjacent slides on mobile to save memory,
                  but for simplicity, we pass the active index down to children or they handle it */}
              {activeIndex === i ? children : (
                <div className="h-full w-full min-h-[50vh] flex items-center justify-center opacity-50">
                  <p className="text-cloud-white">Loading {loc.name}...</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full min-w-full px-4 md:px-0">
            {children}
          </div>
        )}
      </div>

      {/* Pagination Dots (Mobile Only) */}
      {locations.length > 1 && (
        <div className="mt-4 flex w-full justify-center gap-2 md:hidden">
          {locations.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'w-4 bg-amber-flare' : 'w-2 bg-white/20'
              }`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
