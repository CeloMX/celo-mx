"use client";

import React, { useEffect, useRef, useState } from "react";

type ParallaxBannerProps = {
  imageUrl: string;
  heightClass?: string; // Tailwind height classes, e.g., h-[60vh]
  overlayClassName?: string; // Optional overlay for contrast
};

export default function ParallaxBanner({
  imageUrl,
  heightClass = "h-[70vh] md:h-[80vh]",
  overlayClassName = "bg-black/30 dark:bg-black/40",
}: ParallaxBannerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);

  // Calcula progreso de revelado con base en la posición del elemento en el viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const elementHeight = rect.height;

      const scrollStart = windowHeight; // empieza a revelar al entrar
      const scrollEnd = -elementHeight; // termina al salir
      const scrollRange = scrollStart - scrollEnd;
      const current = rect.top;
      const progress = Math.max(0, Math.min(1, (scrollStart - current) / scrollRange));
      setRevealProgress(progress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      aria-label="Buildathon banner"
      className={`relative w-full ${heightClass} overflow-hidden`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain", // mostrar imagen completa
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundAttachment: "fixed", // fondo fijo
        }}
      />

      {/* Overlay que se desvanece conforme se revela */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${overlayClassName}`}
        style={{ opacity: 1 - revealProgress }}
      />

      {/* Máscara tipo cortinilla desde arriba hacia abajo (transparente para evitar bloque blanco) */}
      <div
        className="absolute inset-0 bg-transparent transition-all duration-500 ease-out"
        style={{ clipPath: `inset(${(1 - revealProgress) * 100}% 0% 0% 0%)` }}
      />

      {/* Spacer para mantener altura */}
      <div className="relative h-full" />
    </section>
  );
}


