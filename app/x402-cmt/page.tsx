'use client';

import { useEffect, useState } from 'react';
import { Wallet, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyCmtFetch } from '@/hooks/usePrivyCmtFetch';

export default function X402CmtPage() {
  const { ready, authenticated, login } = usePrivy();
  const fetchWithPayment = usePrivyCmtFetch();
  const [status, setStatus] = useState<'idle'|'paying'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  const runTest = async () => {
    setStatus('paying');
    setMessage('');
    setTxHash(undefined);
    try {
      const { response, txHash } = await fetchWithPayment('/api/x402/cmt');
      setTxHash(txHash);
      if (!response.ok) {
        const b = await response.json().catch(() => ({}));
        setStatus('error');
        setMessage(b?.error || `HTTP ${response.status}`);
        return;
      }
      const data = await response.json().catch(() => ({}));
      setStatus('success');
      setMessage(typeof data?.payload === 'string' ? data.payload : 'ok');
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
          <p className="text-celo-muted mb-6">Necesitas conectar tu wallet para pagar 1 CMT</p>
          <button onClick={() => login()} className="px-6 py-3 bg-celoLegacy-yellow text-black font-semibold rounded-xl hover:opacity-90 transition">Conectar</button>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-celo-bg">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-celo-fg mb-6">Pagar 1 X402</h1>
        <p className="text-celo-muted mb-6">Solicita contenido protegido en X402. Si el servidor responde 402, se paga 1 X402 con tu wallet y se reintenta automáticamente.</p>
        <button
          onClick={runTest}
          disabled={status==='paying'}
          className="px-6 py-3 bg-celoLegacy-yellow text-black rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {status==='paying' ? 'Pagando...' : 'Solicitar Payload CMT'}
        </button>

        {status==='success' && (
          <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle2 className="w-5 h-5" /> Pago verificado
            </div>
            <div className="mt-2 text-sm text-green-800">Payload: {message}</div>
            {txHash && (
              <a href={`https://celoscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 underline mt-2 inline-block">Ver TX</a>
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
