'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Copy, Check, Wallet, RefreshCw } from 'lucide-react';
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useAuth } from '@/hooks/useAuth';

export default function PortfolioPage() {
  const router = useRouter();
  const { smartAccountAddress, isSmartAccountReady } = useSmartAccount();
  const { balances, isLoading } = useTokenBalances(smartAccountAddress ?? undefined);
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const copyAddress = async () => {
    if (!smartAccountAddress) return;
    try {
      await navigator.clipboard.writeText(smartAccountAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncate = (address: string) => {
    return address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '';
  };

  const handleSend = async () => {
    if (!selectedToken || !sendTo || !sendAmount) return;
    
    setIsSending(true);
    try {
      // TODO: Implement gasless send via ZeroDev
      console.log('Sending:', { token: selectedToken, to: sendTo, amount: sendAmount });
      
      // Placeholder for actual send logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Transacción enviada! (Placeholder - implement actual send)');
      setSelectedToken(null);
      setSendTo('');
      setSendAmount('');
    } catch (error) {
      console.error('Send error:', error);
      alert('Error al enviar transacción');
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-celo-bg">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-celo-yellow" />
          <h2 className="text-2xl font-bold text-celo-fg mb-2">Conecta tu Wallet</h2>
          <p className="text-celo-muted mb-6">Necesitas conectar tu wallet para ver tu portafolio</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-celo-yellow text-black font-semibold rounded-xl hover:opacity-90 transition"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!isSmartAccountReady || !smartAccountAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-celo-bg">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-celo-yellow animate-spin" />
          <h2 className="text-2xl font-bold text-celo-fg mb-2">Cargando Smart Account...</h2>
          <p className="text-celo-muted">Preparando tu portafolio gasless</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-celo-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-celo-border rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-celo-fg" />
          </button>
          <h1 className="text-3xl font-bold text-celo-fg">Mi Portafolio</h1>
        </div>

        {/* Smart Account Card */}
        <div className="bg-gradient-to-br from-celo-yellow/20 to-celo-yellow/5 border border-celo-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-celo-muted mb-1">Smart Account</p>
              <p className="font-mono text-lg font-semibold text-celo-fg">{truncate(smartAccountAddress)}</p>
            </div>
            <button
              onClick={copyAddress}
              className="p-3 bg-celo-yellow/20 hover:bg-celo-yellow/30 rounded-xl transition"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-celo-fg" />
              )}
            </button>
          </div>
          <p className="text-sm text-celo-muted">
            ⚡ Transacciones sin gas · Powered by ZeroDev
          </p>
        </div>

        {/* Token List */}
        <div className="bg-white dark:bg-black/50 border border-celo-border rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-celo-fg mb-6">Tokens</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-celo-yellow animate-spin" />
            </div>
          ) : balances.length > 0 ? (
            <div className="space-y-3">
              {balances.map((token) => (
                <div
                  key={token.symbol}
                  className={`flex items-center justify-between p-4 rounded-xl border transition cursor-pointer ${
                    selectedToken === token.symbol
                      ? 'border-celo-yellow bg-celo-yellow/10'
                      : 'border-celo-border hover:border-celo-yellow/50'
                  }`}
                  onClick={() => setSelectedToken(token.symbol)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-celo-yellow/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-celo-fg">{token.symbol.slice(0, 1)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-celo-fg">{token.symbol}</p>
                      <p className="text-sm text-celo-muted">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono text-celo-fg">{token.formattedBalance}</p>
                    <p className="text-sm text-celo-muted">{token.symbol}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-celo-muted">
              No se encontraron tokens
            </div>
          )}
        </div>

        {/* Send Form */}
        {selectedToken && (
          <div className="bg-white dark:bg-black/50 border border-celo-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Send className="w-5 h-5 text-celo-yellow" />
              <h2 className="text-xl font-bold text-celo-fg">
                Enviar {selectedToken}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-celo-fg mb-2">
                  Dirección destino
                </label>
                <input
                  type="text"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-celo-bg border border-celo-border rounded-xl text-celo-fg font-mono focus:border-celo-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-celo-fg mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.0001"
                  className="w-full px-4 py-3 bg-celo-bg border border-celo-border rounded-xl text-celo-fg font-mono focus:border-celo-yellow focus:outline-none"
                />
                <p className="text-sm text-celo-muted mt-2">
                  Balance: {balances.find(t => t.symbol === selectedToken)?.formattedBalance} {selectedToken}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedToken(null);
                    setSendTo('');
                    setSendAmount('');
                  }}
                  className="flex-1 px-6 py-3 bg-celo-bg border border-celo-border rounded-xl font-semibold text-celo-fg hover:bg-celo-border transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  disabled={!sendTo || !sendAmount || isSending}
                  className="flex-1 px-6 py-3 bg-celo-yellow text-black rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
