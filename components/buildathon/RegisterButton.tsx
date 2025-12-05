'use client';

import { useState } from 'react';
import RegisterProjectModal from './RegisterProjectModal';

export default function RegisterButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-full border-celo-fg dark:border-celo-yellow border-[0.3px] px-8 py-3 font-bold text-black dark:text-celo-yellow text-sm bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-celo-yellow focus-visible:ring-offset-0 inline-block"
      >
        <span className="relative z-10 dark:group-hover:text-black">Registra tu Proyecto</span>
        <span className="pointer-events-none absolute inset-0 m-auto h-full w-full rounded-full bg-[#fcf6f1] scale-0 transition-transform duration-300 ease-out group-hover:scale-150 z-0" />
      </button>
      <RegisterProjectModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

