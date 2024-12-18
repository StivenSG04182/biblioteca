import React, { useState, useEffect } from 'react';

const images = [
  '/backgrounds/bg1.jpg',
  '/backgrounds/bg2.jpg',
  '/backgrounds/bg3.jpg',
];

interface BackgroundCarouselProps {
  children: React.ReactNode;
}

function BackgroundCarousel({ children }: BackgroundCarouselProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  useEffect(() => {
    // Preload images
    images.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setLoadedImages(prev => [...prev, src]);
      };
    });

    const interval = setInterval(() => {
      setCurrentImage((current) => (current + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentImage && loadedImages.includes(image) ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            zIndex: index === currentImage ? 0 : -1,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      ))}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default BackgroundCarousel;