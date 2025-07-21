import { useState, useRef, useEffect } from "react";

interface Props {
  images: string[];
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function SwipeableImageGallery({ images, onClick }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const clampIndex = (index: number) =>
    Math.max(0, Math.min(index, images.length - 1));

  // Touch support
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      startX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const diff = e.changedTouches[0].clientX - startX.current;
      isDragging.current = false;

      if (diff > 50 && activeIndex > 0) {
        setActiveIndex((prev) => clampIndex(prev - 1));
      } else if (diff < -50 && activeIndex < images.length - 1) {
        setActiveIndex((prev) => clampIndex(prev + 1));
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeIndex, images.length]);

  // Trackpad horizontal scroll (wheel)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastScrollTime = 0;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < 300) return; // debounce
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        if (e.deltaX > 0 && activeIndex < images.length - 1) {
          setActiveIndex((prev) => clampIndex(prev + 1));
          lastScrollTime = now;
        } else if (e.deltaX < 0 && activeIndex > 0) {
          setActiveIndex((prev) => clampIndex(prev - 1));
          lastScrollTime = now;
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [activeIndex, images.length]);


  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        onClick={onClick}
      >
        {images.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Image ${i + 1}`}
            className="w-full object-contain flex-shrink-0"
            style={{ minWidth: "100%" }}
          />
        ))}
      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          {activeIndex > 0 && (
            <button
              onClick={() => setActiveIndex((i) => clampIndex(i - 1))}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white text-3xl z-10"
              style={{ textShadow: "0 0 3px black" }}
            >
              ‹
            </button>
          )}
          {activeIndex < images.length - 1 && (
            <button
              onClick={() => setActiveIndex((i) => clampIndex(i + 1))}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white text-3xl z-10"
              style={{ textShadow: "0 0 3px black" }}
            >
              ›
            </button>
          )}
        </>
      )}
    </div>
  );
}
