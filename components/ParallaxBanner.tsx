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
  const bgRef = useRef<HTMLDivElement | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  const [mobileParallax, setMobileParallax] = useState(false);

  // Detecta móvil y reduce motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMobileParallax(isMobile && !prefersReduced);
  }, []);

  // Calcula progreso de revelado y aplica parallax suave compatible con móvil (sin background-attachment: fixed)
  useEffect(() => {
    const el = containerRef.current;
    const bg = bgRef.current;
    if (!el || !bg) return;

    let ticking = false;
    let active = true;

    const update = () => {
      if (!active) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const elementHeight = rect.height;

      const scrollStart = windowHeight;
      const scrollEnd = -elementHeight;
      const scrollRange = scrollStart - scrollEnd;
      const current = rect.top;
      const progress = Math.max(0, Math.min(1, (scrollStart - current) / scrollRange));
      setRevealProgress(progress);

      // Parallax offset for mobile: move background up slower than scroll
      if (mobileParallax) {
        const offset = Math.max(-150, Math.min(150, (rect.top - windowHeight / 2) * -0.15));
        bg.style.transform = `translateY(${offset}px)`;
      } else {
        bg.style.transform = '';
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // Pause updates when offscreen for perf
    const io = new IntersectionObserver(
      (entries) => {
        active = entries.some(e => e.isIntersecting);
        if (active) update();
      },
      { root: null, threshold: [0, 0.1, 0.5, 1] }
    );
    io.observe(el);

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [mobileParallax]);

  return (
    <section
      aria-label="Buildathon banner"
      className={`relative w-full ${heightClass} overflow-hidden`}
    >
      {/* Background layer: desktop uses background-attachment: fixed directly on container; mobile uses inner layer with translateY */}
      {mobileParallax ? (
        <div ref={containerRef} className="absolute inset-0">
          <div
            ref={bgRef}
            className="absolute inset-0 will-change-transform"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
            }}
          />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed',
          }}
        />
      )}

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


