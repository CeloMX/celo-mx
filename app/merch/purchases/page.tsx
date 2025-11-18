'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider'
import { useAuth } from '@/hooks/useAuth'

type PurchasedItem = {
  id: string
  name: string
  image: string
  price: number
  category: string
  sizes?: string[]
  stock: number
  txHash: string
  selectedSize?: string | null
  purchasedAt: string
}

export default function PurchasesPage() {
  const { smartAccountAddress, isSmartAccountReady } = useSmartAccount()
  const { isAuthenticated, wallet } = useAuth() as any
  const [items, setItems] = useState<PurchasedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const walletAddr = (wallet?.address as string | undefined)?.toLowerCase()
        if (!walletAddr) {
          throw new Error('Wallet not available')
        }
        const params = new URLSearchParams()
        params.set('wallet', walletAddr)
        const res = await fetch(`/api/merch/purchases/by-wallet?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Request failed' }))
          throw new Error(data.error || res.statusText)
        }
        const data = await res.json()
        setItems(data.purchases || [])
      } catch (e: any) {
        setError(e.message || 'Error')
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated && wallet?.address) {
      load()
    }
  }, [isAuthenticated, wallet?.address])

  return (
    <div className="min-h-screen bg-celo-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <a href="/merch" className="p-2 hover:bg-celo-border rounded-lg transition">
            <ArrowLeft className="w-6 h-6 text-celo-fg" />
          </a>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-celo-fg">Mis Compras</h1>
            <p className="text-celo-muted mt-1">Artículos comprados con tu wallet o smart account</p>
          </div>
        </div>

        {loading ? (
          <div className="text-celo-muted">Cargando compras…</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-celo-muted">No tienes compras registradas</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-black/50 border border-celo-border rounded-2xl overflow-hidden">
                <div className="relative h-56">
                  <Image src={(item.image || '').replace(/[)\s]+$/, '')} alt={item.name} fill className="object-cover" />
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-celo-fg">{item.name}</h3>
                    <div className="text-2xl font-bold text-celo-fg">
                      {item.price} <span className="text-lg text-celo-yellow">CMT</span>
                    </div>
                  </div>
                  <div className="text-sm text-celo-muted">{item.selectedSize ? `Talla: ${item.selectedSize}` : 'Sin talla'}</div>
                  <div className="text-sm text-celo-muted">Comprado: {new Date(item.purchasedAt).toLocaleString()}</div>
                  <a
                    href={`https://celoscan.io/tx/${item.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-celo-yellow text-black font-semibold rounded-xl hover:opacity-90 transition"
                  >
                    Ver TX <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
