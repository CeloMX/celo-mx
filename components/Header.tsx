'use client';
import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import PrivyLogin from './PrivyLogin';
import CeloLogo from './CeloLogo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-celo-bg/95 border-b border-celo-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <CeloLogo width={80} height={18} className="text-celo-yellow sm:w-[100px] sm:h-[22px]" />
          <span className="font-italic text-sm sm:text-lg text-celo-yellow">
            Mexico
          </span>
        </Link>
        
        {/* Desktop Navigation and Actions - All to the right */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 ml-auto">
          <nav className="flex gap-4 xl:gap-6 text-sm">
            <Link 
              href="/academy" 
              className="text-celo-fg font-medium relative group transition-all duration-200"
            >
              Academia
              <span className="absolute -bottom-2 left-0 w-full h-[0.5px] bg-celo-muted transition-all duration-400 ease-out group-hover:bottom-0 opacity-0 group-hover:opacity-100"></span>
            </Link>
            <Link 
              href="/marketplace" 
              className="text-celo-fg font-medium relative group transition-all duration-200"
            >
              Marketplace
              <span className="absolute -bottom-2 left-0 w-full h-[0.5px] bg-celo-muted transition-all duration-400 ease-out group-hover:bottom-0 opacity-0 group-hover:opacity-100"></span>
            </Link>
            <a 
              href="https://forum.celo.org" 
              target="_blank" 
              rel="noreferrer"
              className="text-celo-fg font-medium relative group transition-all duration-200"
            >
              Comunidad
              <span className="absolute -bottom-2 left-0 w-full h-[0.5px] bg-celo-muted transition-all duration-400 ease-out group-hover:bottom-0 opacity-0 group-hover:opacity-100"></span>
            </a>
            <a 
              href="https://docs.celo.org" 
              target="_blank" 
              rel="noreferrer"
              className="text-celo-fg font-medium relative group transition-all duration-200"
            >
              Documentación
              <span className="absolute -bottom-2 left-0 w-full h-[0.5px] bg-celo-muted transition-all duration-400 ease-out group-hover:bottom-0 opacity-0 group-hover:opacity-100"></span>
            </a>
          </nav>
          
          <div className="flex items-center gap-3 xl:gap-4">
            <ThemeToggle />
            <PrivyLogin />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-celo-fg transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-celo-fg transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-celo-fg transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 border-t border-celo-border">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/academy" 
              onClick={closeMenu}
              className="text-celo-fg font-medium py-2 transition-colors duration-200 hover:opacity-70"
            >
              Academia
            </Link>
            <Link 
              href="/marketplace" 
              onClick={closeMenu}
              className="text-celo-fg font-medium py-2 transition-colors duration-200 hover:opacity-70"
            >
              Marketplace
            </Link>
            <a 
              href="https://forum.celo.org" 
              target="_blank" 
              rel="noreferrer"
              className="text-celo-fg font-medium py-2 transition-colors duration-200 hover:opacity-70"
            >
              Comunidad
            </a>
            <a 
              href="https://docs.celo.org" 
              target="_blank" 
              rel="noreferrer"
              className="text-celo-fg font-medium py-2 transition-colors duration-200 hover:opacity-70"
            >
              Documentación
            </a>
          </nav>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-celo-border">
            <ThemeToggle />
            <PrivyLogin />
          </div>
        </div>
      </div>
    </header>
  );
}



