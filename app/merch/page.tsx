'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Wallet, ExternalLink, RefreshCw } from 'lucide-react';
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useAuth } from '@/hooks/useAuth';
import { usePrivy } from '@privy-io/react-auth';
import { MERCHANT_ADDRESS } from '@/config/merch';
import { CMT_TOKEN_CONFIG, ERC20_ABI, cmtToWei } from '@/lib/contracts/cmt';
import { CMT_FAUCET_ABI, getCmtFaucetAddress } from '@/lib/contracts/cmtFaucet';
import { encodeFunctionData } from 'viem';
import Image from 'next/image';
import ProductCarousel from '@/components/marketplace/ProductCarousel';

type MerchItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  images?: string[];
  video?: string | null;
  category: 'clothing' | 'accessories';
  sizes?: string[];
  tag?: string | null;
  stock: number;
  isActive: boolean;
}

function MerchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready: privyReady } = usePrivy();
  const smartAccount = useSmartAccount();
  const { smartAccountAddress, isSmartAccountReady } = smartAccount;
  // Fix: Convert null to undefined by using || undefined
  const { balances, isLoading: balancesLoading, refetch: refetchBalances } = useTokenBalances(smartAccountAddress || undefined);
  const { isAuthenticated, wallet } = useAuth() as any;
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Record<string, { txHash: string; timestamp: number }>>({});
  const [items, setItems] = useState<MerchItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const userIdParam = (searchParams.get('userId') || '').trim() || null;
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  const cmtBalance = balances.find(b => b.symbol === 'CMT');

  // Load purchases from server (authenticated) without relying on query/userId
  useEffect(() => {
    const resolveAndLoad = async () => {
      if (!smartAccountAddress && !userIdParam && !wallet?.address) {
        return;
      }
      try {
        const idParams = new URLSearchParams();
        if (smartAccountAddress) idParams.set('smartAccount', smartAccountAddress);
        const walletAddr = (wallet?.address as string | undefined)?.toLowerCase();
        if (walletAddr) idParams.set('wallet', walletAddr);
        const idRes = await fetch(`/api/merch/user-id?${idParams.toString()}`, { cache: 'no-store' });
        if (idRes.ok) {
          const idJson = await idRes.json();
          setResolvedUserId(idJson.userId || null);
        } else {
          setResolvedUserId(null);
        }
      } catch {
        setResolvedUserId(null);
      }
      try {
        const pParams = new URLSearchParams();
        const walletAddr = (wallet?.address as string | undefined)?.toLowerCase();
        const effectiveUserId = userIdParam || resolvedUserId || '';
        if (effectiveUserId) {
          pParams.set('userId', effectiveUserId);
        } else {
          if (smartAccountAddress) pParams.set('smartAccount', smartAccountAddress);
          if (walletAddr) pParams.set('wallet', walletAddr);
        }
        const res = await fetch(`/api/merch/purchases/by-wallet?${pParams.toString()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const map: Record<string, { txHash: string; timestamp: number }> = {};
          (json.purchases || []).forEach((p: any) => {
            const itemId = p.itemid ?? p.id;
            const tx = p.txhash ?? p.txHash;
            const ts = p.createdat ?? p.purchasedAt;
            if (itemId && tx) map[itemId] = { txHash: tx, timestamp: Date.parse(ts) || Date.now() };
          });
          setPurchases(map);
        } else {
          setPurchases({});
        }
      } catch {
        setPurchases({});
      }
    };
    resolveAndLoad();
  }, [smartAccountAddress, userIdParam, wallet?.address, resolvedUserId]);

  const isPurchased = (itemId: string) => !!purchases[itemId];

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/merch/items?t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      setItems(json.items || []);
    };
    load();
  }, []);

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
    if (item.sizes && item.sizes.length) {
      let chosen = selectedSizes[item.id];
      if (!chosen) {
        const isShirt = /shirt/i.test(item.id) || /shirt/i.test(item.name);
        if (isShirt) {
          chosen = 'XL';
          setSelectedSizes((s) => ({ ...s, [item.id]: 'XL' }));
        }
      }
      if (!chosen) {
        alert('Selecciona una talla antes de comprar');
        return;
      }
    }
    if (item.stock <= 0) {
      alert('Producto agotado');
      return;
    }

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

      const selectedSize = (item.sizes && item.sizes.length)
        ? (selectedSizes[item.id] || ((/shirt/i.test(item.id) || /shirt/i.test(item.name)) ? 'XL' : undefined))
        : undefined;
      const userIdForPurchase = userIdParam || resolvedUserId || null;
      const purchaseRes = await fetch('/api/merch/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, txHash, amount: item.price, selectedSize, smartAccount: smartAccountAddress, userId: userIdForPurchase || undefined })
      });
      if (!purchaseRes.ok) {
        const err = await purchaseRes.json().catch(() => ({ error: 'Compra no registrada' }));
        throw new Error(err?.error || 'Compra no registrada');
      }
      const purchaseJson = await purchaseRes.json();
      const updatedItem = purchaseJson.item as { id: string; stock: number } | undefined;
      const purchaseUserId = purchaseJson.userId as string | undefined;

      if (updatedItem && typeof updatedItem.stock === 'number') {
        setItems((prev) => prev.map((it) => it.id === updatedItem.id ? { ...it, stock: updatedItem.stock } : it));
      }
      if (purchaseUserId) {
        setResolvedUserId(purchaseUserId);
      }

      setPurchases((prev) => ({ ...prev, [item.id]: { txHash, timestamp: Date.now() } }));
      alert(`✓ Compra exitosa! ${item.price} CMT transferidos.\n\nTransacción: ${txHash}\n\nVer en Celoscan: https://celoscan.io/tx/${txHash}`);
      
      // Refresh balances after successful purchase
      setTimeout(() => {
        refetchBalances();
      }, 2000);
      const params = new URLSearchParams();
      const walletAddr = (wallet?.address as string | undefined)?.toLowerCase();
      const effectiveUserId2 = userIdParam || resolvedUserId || '';
      if (effectiveUserId2) {
        params.set('userId', effectiveUserId2);
      } else {
        if (smartAccountAddress) params.set('smartAccount', smartAccountAddress);
        if (walletAddr) params.set('wallet', walletAddr);
      }
      const [itemsRes, purchasesRes] = await Promise.all([
        fetch(`/api/merch/items?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/merch/purchases/by-wallet?${params.toString()}`, { cache: 'no-store' })
      ]);
      if (itemsRes.ok) {
        const json = await itemsRes.json();
        setItems(json.items || []);
      }
      if (purchasesRes.ok) {
        const pj = await purchasesRes.json();
        const map: Record<string, { txHash: string; timestamp: number }> = {};
        (pj.purchases || []).forEach((p: any) => {
          const itemId = p.itemid ?? p.id;
          const tx = p.txhash ?? p.txHash;
          const ts = p.createdat ?? p.purchasedAt;
          if (itemId && tx) map[itemId] = { txHash: tx, timestamp: Date.parse(ts) || Date.now() };
        });
        setPurchases(map);
      }

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
            className="px-6 py-3 bg-celoLegacy-yellow text-black font-semibold rounded-xl hover:opacity-90 transition"
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
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={smartAccount.forceReconnect}
              className="px-6 py-2 bg-celoLegacy-yellow text-black font-semibold rounded-xl hover:opacity-90 transition"
            >
              Reconectar sesión
            </button>
          </div>
          {smartAccount.degradedMode && (
            <p className="mt-3 text-xs text-celo-muted">
              Modo fallback activo. Intentando recuperar sesión.
            </p>
          )}
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
          <button
            onClick={() => router.push('/merch/purchases')}
            className="px-4 py-2 bg-celoLegacy-yellow text-black font-semibold rounded-xl hover:opacity-90 transition"
          >
            Mis Compras
          </button>
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
            <div className="mt-4 flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const faucetAddr = getCmtFaucetAddress(42220);
                    if (!faucetAddr) {
                      alert('Faucet no está configurado');
                      return;
                    }
                    const data = encodeFunctionData({ abi: CMT_FAUCET_ABI as any, functionName: 'claim', args: [] });
                    const txHash = await smartAccount.executeTransaction({ to: faucetAddr, data, value: 0n });
                    if (!txHash) throw new Error('Faucet claim fallo');
                    alert(`✓ Faucet solicitado. TX: ${txHash}`);
                    setTimeout(() => { refetchBalances(); }, 2000);
                  } catch (e: any) {
                    alert(`Error faucet: ${e?.message || 'desconocido'}`);
                  }
                }}
                className="px-4 py-2 bg-celoLegacy-yellow text-black font-semibold rounded-xl hover:opacity-90 transition"
              >
                Obtener CMT del Faucet
              </button>
            </div>
          </div>
        )}

        {/* Merch Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-black/50 border border-celo-border rounded-2xl overflow-hidden hover:border-celo-yellow transition relative"
            >
              {isPurchased(item.id) && (
                <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Comprado
                </div>
              )}
              {item.stock <= 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Agotado
                </div>
              )}
              <div className="relative">
                {item.tag ? (
                  <span className={`absolute ${isPurchased(item.id) ? 'top-2 left-2' : 'top-2 right-2'} z-20 px-2 py-1 rounded-lg bg-celoLegacy-yellow text-black text-xs font-semibold shadow`}>
                    {item.tag}
                  </span>
                ) : null}
                <ProductCarousel
                  images={[item.image, ...(item.images || [])]}
                  video={item.video}
                  alt={item.name}
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
                      disabled={purchasingItem === item.id || item.stock <= 0}
                      className="px-6 py-2 bg-celoLegacy-yellow text-black font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasingItem === item.id ? 'Comprando...' : 'Comprar'}
                    </button>
                  )}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className={item.stock > 0 ? 'text-celo-muted' : 'text-red-500'}>
                      {item.stock > 0 ? `Quedan ${item.stock}` : 'Sin stock'}
                    </span>
                  </div>
                  {item.sizes && item.sizes.length && !(/shirt/i.test(item.id) || /shirt/i.test(item.name)) ? (
                    <div className="mt-4">
                      <select
                        value={selectedSizes[item.id] || ''}
                        onChange={(e) => setSelectedSizes((s) => ({ ...s, [item.id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-celo-border rounded-xl bg-transparent"
                      >
                        <option value="">Selecciona talla</option>
                        {item.sizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function MerchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-celo-bg"><div className="text-center"><RefreshCw className="w-16 h-16 mx-auto mb-4 text-celo-yellow animate-spin" /><h2 className="text-2xl font-bold text-celo-fg mb-2">Cargando...</h2><p className="text-celo-muted">Iniciando aplicación</p></div></div>}>
      <MerchPageInner />
    </Suspense>
  );
}
