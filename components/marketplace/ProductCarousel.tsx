'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react';

interface ProductCarouselProps {
  images: string[];
  video?: string | null;
  alt: string;
  className?: string;
}

export default function ProductCarousel({ images, video, alt, className = '' }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Combine video and images: video first if exists, then images
  const allMedia = video ? [video, ...images] : images;
  const hasMultiple = allMedia.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
    setIsVideoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
    setIsVideoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsVideoPlaying(false);
  };

  const isVideo = (url: string) => {
    return url === video && video;
  };

  const currentMedia = allMedia[currentIndex];
  const isCurrentVideo = isVideo(currentMedia);

  if (allMedia.length === 0) {
    return (
      <div className={`aspect-square bg-gradient-to-br from-celo-yellow/20 to-celo-yellow/5 flex items-center justify-center ${className}`}>
        <ImageIcon className="w-16 h-16 text-celo-muted" />
      </div>
    );
  }

  return (
    <div className={`relative aspect-square bg-gradient-to-br from-celo-yellow/20 to-celo-yellow/5 overflow-hidden ${className}`}>
      {/* Main Media Display */}
      <div className="relative w-full h-full">
        {isCurrentVideo && video ? (
          <div className="relative w-full h-full">
            {!isVideoPlaying ? (
              <div className="relative w-full h-full">
                <img
                  src={images[0] || video}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
                >
                  <div className="bg-white/90 rounded-full p-4 hover:bg-white transition">
                    <Play className="w-12 h-12 text-black ml-1" fill="black" />
                  </div>
                </button>
              </div>
            ) : (
              <video
                src={video}
                controls
                autoPlay
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
              >
                Tu navegador no soporta videos.
              </video>
            )}
          </div>
        ) : (
          <img
            src={currentMedia}
            alt={`${alt} - ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {allMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex
                  ? 'bg-celo-yellow w-6'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Video Indicator */}
      {video && currentIndex === 0 && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
          Video
        </div>
      )}
    </div>
  );
}

