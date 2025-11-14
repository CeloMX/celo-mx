'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Wallet, Check, X, ExternalLink, RefreshCw } from 'lucide-react';
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useAuth } from '@/hooks/useAuth';
import { usePrivy } from '@privy-io/react-auth';
import { merchItems, MERCHANT_ADDRESS, MerchItem } from '@/config/merch';
import { CMT_TOKEN_CONFIG, ERC20_ABI, cmtToWei } from '@/lib/contracts/cmt';
import { encodeFunctionData } from 'viem';
import Image from 'next/image';

export default function MerchPage() {
  const router = useRouter();
  const { ready: privyReady, authenticated: privyAuth } = usePrivy();
  const smartAccount = useSmartAccount();
  const { smartAccountAddress, isSmartAccountReady } = smartAccount;
  // Fix: Convert null to undefined by using || undefined
  const { balances, isLoading: balancesLoading } = useTokenBalances(smartAccountAddress || undefined);
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
    // Validation checks
    if (!smartAccountAddress) {
      alert('Smart account no está disponible. Por favor espera a que se inicialice.');
      return;
    }
    
    if (!smartAccount.canSponsorTransaction) {
      alert('Smart account no está listo para transacciones patrocinadas. Por favor espera...');
      return;
    }
    
    if (isPurchased(item.id)) return;

    // Check if user has enough CMT balance
    const cmtBalanceNum = parseFloat(cmtBalance?.formattedBalance || '0');
    if (cmtBalanceNum < item.price) {
      alert(`Balance insuficiente. Necesitas ${item.price} CMT pero solo tienes ${cmtBalanceNum.toFixed(4)} CMT.`);
      return;
    }

    setPurchasingItem(item.id);
    try {
      console.log('[MERCH] Starting real CMT transfer:', {
        item: item.name,
        price: item.price,
        from: smartAccountAddress,
        to: MERCHANT_ADDRESS,
        cmtTokenAddress: CMT_TOKEN_CONFIG.address,
      });

      // Convert CMT amount to wei (18 decimals)
      const amountInWei = cmtToWei(item.price);
      console.log('[MERCH] Amount in wei:', amountInWei.toString());
      
      // Encode the ERC20 transfer function call
      const transferData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [MERCHANT_ADDRESS as `0x${string}`, amountInWei],
      });

      console.log('[MERCH] Executing sponsored CMT transfer via ZeroDev...');
      console.log('[MERCH] Transfer data:', transferData);
      
      // Execute the real CMT transfer using ZeroDev sponsored transaction
      const txHash = await smartAccount.executeTransaction({
        to: CMT_TOKEN_CONFIG.address,
        data: transferData,
        value: 0n, // No ETH value needed for ERC20 transfer
      });

      if (!txHash) {
        throw new Error('Transaction failed - no hash returned');
      }

      console.log('[MERCH] ✅ Real CMT transfer completed:', txHash);

      // Save purchase to localStorage with real transaction hash
      const newPurchases = {
        ...purchases,
        [item.id]: {
          txHash,
          timestamp: Date.now(),
        },
      };
      setPurchases(newPurchases);
      localStorage.setItem('merch-purchases', JSON.stringify(newPurchases));

      alert(`✓ Compra exitosa! ${item.price} CMT transferidos.\n\nTransacción: ${txHash}\n\nVer en Celoscan: https://celoscan.io/tx/${txHash}`);
      
      // Refresh balances after successful purchase
      // The useTokenBalances hook should automatically refresh, but we can trigger it
      setTimeout(() => {
        window.location.reload(); // Simple way to refresh balances
      }, 3000);

    } catch (error: any) {
      console.error('[MERCH] Purchase error:', error);
      
      // More detailed error handling
      let errorMessage = 'Error desconocido al procesar la compra';
      if (error?.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Fondos insuficientes para la transacción';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transacción cancelada por el usuario';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de red. Por favor intenta de nuevo';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`Error al procesar la compra: ${errorMessage}`);
    } finally {
      setPurchasingItem(null);
    }
  };

  // Show loading while Privy initializes
  if (!privyReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-celo-bg">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-celo-yellow animate-spin" />
          <h2 className="text-2xl font-bold text-celo-fg mb-2">Cargando...</h2>
          <p className="text-celo-muted">Iniciando aplicación</p>
        </div>
      </div>
    );
  }

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

  if (!isSmartAccountReady || !smartAccountAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-celo-bg">
        <div className="text-center max-w-md mx-auto px-4">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-celo-yellow animate-spin" />
          <h2 className="text-2xl font-bold text-celo-fg mb-2">Preparando Smart Account...</h2>
          <p className="text-celo-muted mb-4">Configurando tu cuenta gasless para transacciones sin gas</p>
          {smartAccount.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-600 dark:text-red-400 text-sm">
                Error: {smartAccount.error}
              </p>
            </div>
          )}
          <p className="text-xs text-celo-muted">
            Esto puede tomar unos segundos la primera vez...
          </p>
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