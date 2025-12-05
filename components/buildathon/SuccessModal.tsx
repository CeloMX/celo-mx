'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SuccessModal({
  open,
  onOpenChange,
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#FCF6F1] dark:bg-celo-bg border-celo-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-celo-fg text-center">
            ¡Felicidades!
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          
          <p className="text-lg text-celo-fg font-medium">
            Tu proyecto se ha subido con éxito
          </p>
          
          <p className="text-celo-muted">
            Nos pondremos en contacto contigo pronto.
          </p>

          <button
            onClick={() => onOpenChange(false)}
            className="mt-6 w-full group relative overflow-hidden rounded-full border-celo-fg dark:border-celo-yellow border-[0.3px] px-8 py-3 font-bold text-black dark:text-celo-yellow text-sm bg-transparent transition-colors"
          >
            <span className="relative z-10 dark:group-hover:text-black">
              Cerrar
            </span>
            <span className="pointer-events-none absolute inset-0 m-auto h-full w-full rounded-full bg-[#fcf6f1] scale-0 transition-transform duration-300 ease-out group-hover:scale-150 z-0" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

