"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'

type MerchItem = {
  id: string
  name: string
  description?: string
  price: number
  image: string
  category: string
  sizes: string[]
  stock: number
  isActive: boolean
}

export default function AdminMerchPage() {
  const [items, setItems] = useState<MerchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<MerchItem>>({ category: 'accessories', sizes: [] })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/merch/items')
    const json = await res.json()
    setItems(json.items || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveItem = async () => {
    if (!form.id || !form.name || !form.image || !form.price || !form.category) return
    setSaving(true)
    await fetch('/api/admin/merch/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        description: form.description || '',
        price: Number(form.price),
        image: form.image,
        category: form.category,
        sizes: form.sizes || [],
        stock: Number(form.stock || 0),
        isActive: form.isActive ?? true,
      })
    })
    setSaving(false)
    setForm({ category: 'accessories', sizes: [] })
    await load()
  }

  const updateStock = async (id: string, stock: number) => {
    await fetch(`/api/admin/merch/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    })
    await load()
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/merch/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    })
    await load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Merch</h1>
        <Link href="/admin" className="text-sm text-blue-600">← Volver</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Crear/Actualizar ítem</h2>
          <div className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="ID" value={form.id || ''} onChange={(e) => setForm({ ...form, id: e.target.value })} />
            <input className="w-full border rounded px-3 py-2" placeholder="Nombre" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className="w-full border rounded px-3 py-2" placeholder="Descripción" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="w-full border rounded px-3 py-2" placeholder="Imagen URL" value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="border rounded px-3 py-2" value={form.category || 'accessories'} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="clothing">clothing</option>
                <option value="accessories">accessories</option>
              </select>
              <input className="border rounded px-3 py-2" type="number" placeholder="Precio (CMT)" value={form.price as any || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <input className="w-full border rounded px-3 py-2" placeholder="Tallas (coma)" value={(form.sizes || []).join(',')} onChange={(e) => setForm({ ...form, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2" type="number" placeholder="Stock" value={form.stock as any || ''} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              <select className="border rounded px-3 py-2" value={(form.isActive ?? true) ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <button onClick={saveItem} disabled={saving} className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Inventario</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Cargando...</div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 border rounded p-3">
                  <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">{it.category} • {it.price} CMT</div>
                    <div className="text-sm">Stock: {it.stock}</div>
                  </div>
                  <input type="number" className="w-24 border rounded px-2 py-1" defaultValue={it.stock} onBlur={(e) => updateStock(it.id, Number(e.target.value))} />
                  <button onClick={() => toggleActive(it.id, !it.isActive)} className={`px-3 py-1 rounded ${it.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-800'}`}>{it.isActive ? 'Activo' : 'Inactivo'}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
