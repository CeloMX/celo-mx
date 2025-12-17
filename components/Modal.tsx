'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export default function Modal({ isOpen, onClose, title, children, type = 'info' }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeStyles = {
    success: {
      border: 'border-green-500/30',
      bg: 'bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
    },
    error: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
    },
    warning: {
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      border: 'border-celo-border',
      bg: 'bg-celo-bg',
      text: 'text-celo-fg',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking outside the modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className={`
          relative z-10 w-full max-w-md
          bg-celo-bg
          border border-celo-border rounded-2xl
          shadow-2xl
          animate-in fade-in-0 zoom-in-95
          duration-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`
          flex items-center justify-between p-6 border-b border-celo-border
          ${type !== 'info' ? style.border : ''}
        `}>
          {title && (
            <h2 className={`text-xl font-bold ${type !== 'info' ? style.text : 'text-celo-fg'}`}>
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              hover:bg-celo-border/50
              transition-colors
              text-celo-fg
              focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:ring-offset-2
            "
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`text-celo-fg ${type !== 'info' ? style.text : ''} whitespace-pre-line`}>
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-celo-border">
          <button
            onClick={onClose}
            className="
              px-6 py-2
              bg-celoLegacy-yellow text-black
              font-semibold rounded-xl
              hover:opacity-90
              transition
              border border-celo-border/40
              focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:ring-offset-2
            "
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

