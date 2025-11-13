'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Wallet, Check, X, ExternalLink } from 'lucide-react';
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useAuth } from '@/hooks/useAuth';
import { merchItems, MERCHANT_ADDRESS, MerchItem } from '@/config/merch';
import Image from 'next/image';

export default function MerchPage() {
  const router = useRouter();
  const { smartAccountAddress, isSmartAccountReady } = useSmartAccount();
  const { balances, isLoading: balancesLoading } = useTokenBalances(smartAccountAddress ?? undefined);
  const { isAuthenticated } = useAuth();
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Record<string, { txHash: string; timestamp: number }>>({});

  const cmtBalance = balances.find(b => b.symbol === 'CMT');

  // Load purchases from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('merch-purchases');
    if (stored) {
      try {
        setPurchases(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse purchases:', e);
      }
    }
  }, []);

  const isPurchased = (itemId: string) => !!purchases[itemId];

  const handlePurchase = async (item: MerchItem) => {
    if (!smartAccountAddress) return;
    if (isPurchased(item.id)) return;

    setPurchasingItem(item.id);
    try {
      // TODO: Implement gasless CMT transfer via ZeroDev
      console.log('Purchasing:', {
        item: item.name,
        price: item.price,
        from: smartAccountAddress,
        to: MERCHANT_ADDRESS,
      });

      // Placeholder for actual transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock transaction hash (replace with actual tx hash from ZeroDev)
      const mockTxHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      // Save purchase to localStorage
      const newPurchases = {
        ...purchases,
        [item.id]: {
          txHash: mockTxHash,
          timestamp: Date.now(),
        },
      };
      setPurchases(newPurchases);
      localStorage.setItem('merch-purchases', JSON.stringify(newPurchases));

      alert(`✓ Compra exitosa! Ver transacción: https://celoscan.io/tx/${mockTxHash}`);
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Error al procesar la compra');
    } finally {
      setPurchasingItem(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-celo-bg">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-celo-yellow" />
          <h2 className="text-2xl font-bold text-celo-fg mb-2">Conecta tu Wallet</h2>
          <p className="text-celo-muted mb-6">Necesitas conectar tu wallet para comprar merch</p>
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

  return (
    <div className="min-h-screen bg-celo-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-celo-border rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-celo-fg" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-celo-fg">Celo MX Merch</h1>
            <p className="text-celo-muted mt-1">Compra con CMT · Transacciones sin gas</p>
          </div>
        </div>

        {/* Balance Display */}
        {isSmartAccountReady && smartAccountAddress && (
          <div className="bg-gradient-to-br from-celo-yellow/20 to-celo-yellow/5 border border-celo-border rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-celo-muted">Tu balance CMT</p>
                <p className="text-2xl font-bold font-mono text-celo-fg">
                  {balancesLoading ? '...' : cmtBalance?.formattedBalance || '0.0000'} CMT
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-celo-yellow" />
            </div>
          </div>
        )}

        {/* Merch Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {merchItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-black/50 border border-celo-border rounded-2xl overflow-hidden hover:border-celo-yellow transition relative"
            >
              {isPurchased(item.id) && (
                <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Comprado
                </div>
              )}
              <div className="aspect-square bg-gradient-to-br from-celo-yellow/20 to-celo-yellow/5 flex items-center justify-center relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-celo-fg mb-2">{item.name}</h3>
                <p className="text-celo-muted text-sm mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-celo-fg">
                    {item.price} <span className="text-lg text-celo-yellow">CMT</span>
                  </div>
                  {isPurchased(item.id) ? (
                    <a
                      href={`https://celoscan.io/tx/${purchases[item.id].txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-2 bg-green-500/20 text-green-600 dark:text-green-400 font-semibold rounded-xl hover:bg-green-500/30 transition"
                    >
                      Ver TX <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={purchasingItem === item.id}
                      className="px-6 py-2 bg-celo-yellow text-black font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasingItem === item.id ? 'Comprando...' : 'Comprar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
