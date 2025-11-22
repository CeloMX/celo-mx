'use client';

import { useState } from 'react';
import { Wallet, RefreshCw, CheckCircle2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useUsdcX402 } from '@/hooks/useUsdcX402';

export default function X402UsdcPage() {
  const { ready, authenticated, login } = usePrivy();
  const { wrapFetchWithPayment } = useUsdcX402();
  const [status, setStatus] = useState<'idle'|'paying'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const runTest = async () => {
    setStatus('paying');
    setMessage('');
    setTxHash(undefined);
    try {
      const response = await wrapFetchWithPayment('/api/x402/usdc');
      if (!response.ok) {
        const b = await response.json().catch(() => ({}));
        setStatus('error');
        setMessage(b?.error || `HTTP ${response.status}`);
        return;
      }
      const data = await response.json().catch(() => ({}));
      setStatus('success');
      setMessage('USDC pago verificado');
      setTxHash(data?.txHash);
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'unknown error');
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-celo-bg">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-celo-yellow animate-spin" />
          <h2 className="text-2xl font-bold text-celo-fg mb-2">Cargando...</h2>
          <p className="text-celo-muted">Inicializando Privy</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-celo-bg">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-celo-yellow" />
          <h2 className="text-2xl font-bold text-celo-fg mb-2">Conecta tu Wallet</h2>
          <p className="text-celo-muted mb-6">Usa tu wallet Privy para pagar con USDC (gas patrocinado)</p>
          <button onClick={() => login()} className="px-6 py-3 bg-celoLegacy-yellow text-black font-semibold rounded-xl hover:opacity-90 transition">Conectar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-celo-bg">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-celo-fg mb-6">Pagar con USDC (gas facilitador)</h1>
        <p className="text-celo-muted mb-6">Demostración de x402 con EIP-3009: el facilitador patrocina el gas. Requiere USDC en Base Sepolia (pruebas) o red compatible.</p>
        <button
          onClick={runTest}
          disabled={status==='paying'}
          className="px-6 py-3 bg-celoLegacy-yellow text-black rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {status==='paying' ? 'Pagando...' : 'Solicitar Payload USDC'}
        </button>

        {status==='success' && (
          <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle2 className="w-5 h-5" /> Pago verificado
            </div>
            <div className="mt-2 text-sm text-green-800">Payload: {message}</div>
            {txHash && (
              <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 underline mt-2 inline-block">Ver TX</a>
            )}
          </div>
        )}

        {status==='error' && (
          <div className="mt-6 p-4 border border-red-200 bg-red-50 rounded-xl text-red-700">Error: {message}</div>
        )}
      </div>
    </div>
  );
}
