'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SuccessModal from './SuccessModal';

interface RegisterProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegisterProjectModal({
  open,
  onOpenChange,
}: RegisterProjectModalProps) {
  const [formData, setFormData] = useState({
    teamName: '',
    teamMembers: '',
    githubRepo: '',
    karmaGapLink: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/buildathon/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({
          teamName: '',
          teamMembers: '',
          githubRepo: '',
          karmaGapLink: '',
        });
        // Cerrar el modal del formulario y mostrar el modal de éxito
        onOpenChange(false);
        setShowSuccessModal(true);
        setStatus('idle');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#FCF6F1] dark:bg-celo-bg border-celo-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-celo-fg">
            Registra tu proyecto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-celo-fg">
              Nombre del Equipo *
            </label>
            <input
              type="text"
              required
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              className="w-full border border-celo-border rounded-lg px-4 py-3 bg-white dark:bg-celo-bg text-celo-fg focus:outline-none focus:ring-2 focus:ring-celo-yellow"
              placeholder="Ej: Team Celo MX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-celo-fg">
              Nombre de los integrantes *
            </label>
            <input
              type="text"
              required
              value={formData.teamMembers}
              onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
              className="w-full border border-celo-border rounded-lg px-4 py-3 bg-white dark:bg-celo-bg text-celo-fg focus:outline-none focus:ring-2 focus:ring-celo-yellow"
              placeholder="Ej: Juan Pérez, María García, Carlos López"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-celo-fg">
              Github del proyecto
            </label>
            <input
              type="url"
              value={formData.githubRepo}
              onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
              className="w-full border border-celo-border rounded-lg px-4 py-3 bg-white dark:bg-celo-bg text-celo-fg focus:outline-none focus:ring-2 focus:ring-celo-yellow"
              placeholder="https://github.com/usuario/proyecto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-celo-fg">
              Link del KarmaGap
            </label>
            <input
              type="url"
              value={formData.karmaGapLink}
              onChange={(e) => setFormData({ ...formData, karmaGapLink: e.target.value })}
              className="w-full border border-celo-border rounded-lg px-4 py-3 bg-white dark:bg-celo-bg text-celo-fg focus:outline-none focus:ring-2 focus:ring-celo-yellow"
              placeholder="https://karmagap.com/proyecto"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full group relative overflow-hidden rounded-full border-celo-fg dark:border-celo-yellow border-[0.3px] px-8 py-3 font-bold text-black dark:text-celo-yellow text-sm bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 dark:group-hover:text-black">
              {status === 'loading' ? 'Registrando...' : 'Registrar Proyecto'}
            </span>
            <span className="pointer-events-none absolute inset-0 m-auto h-full w-full rounded-full bg-[#fcf6f1] scale-0 transition-transform duration-300 ease-out group-hover:scale-150 z-0" />
          </button>

          {status === 'error' && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg text-red-800 dark:text-red-200 text-sm">
              Error al registrar el proyecto. Por favor intenta de nuevo.
            </div>
          )}
        </form>
      </DialogContent>

      <SuccessModal 
        open={showSuccessModal} 
        onOpenChange={setShowSuccessModal} 
      />
    </Dialog>
  );
}

