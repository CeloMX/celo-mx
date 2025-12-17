"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '../../../utils/supabase'

type MerchItem = {
  id: string
  name: string
  description?: string
  price: number
  image: string
  images?: string[]
  video?: string | null
  category: string
  sizes: string[]
  stock: number
  isActive: boolean
  tag?: string | null
}

export default function AdminMerchPage() {
  const [items, setItems] = useState<MerchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<MerchItem>>({ category: 'accessories', sizes: [] })
  const [saving, setSaving] = useState(false)
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingExtra, setUploadingExtra] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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
        images: form.images || [],
        video: form.video || null,
        category: form.category,
        sizes: form.sizes || [],
        stock: Number(form.stock || 0),
        isActive: form.isActive ?? true,
        tag: form.tag || null,
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

  const editItem = (item: MerchItem) => {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image,
      images: item.images || [],
      video: item.video || null,
      category: item.category,
      sizes: item.sizes || [],
      stock: item.stock,
      isActive: item.isActive,
      tag: item.tag || null,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const parseImages = (value: string): string[] => {
    const lines = value.split('\n')
    const all: string[] = []
    for (const line of lines) {
      const parts = line.split(',')
      for (const p of parts) {
        const t = p.trim()
        if (t) all.push(t)
      }
    }
    return all
  }

  const uploadFileToSupabase = async (file: File, type: 'image' | 'video'): Promise<string | null> => {
    try {
      setUploadError(null)
      const bucket = 'merch' // Bucket público existente
      const folder = type === 'image' ? 'images' : 'videos'
      const ext = file.name.split('.').pop() || 'dat'
      const safeName = file.name.replace(/[^a-z0-9\.\-_]/gi, '_')
      const path = `${folder}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || (type === 'image' ? `image/${ext}` : `video/${ext}`)
        })

      if (uploadError) {
        console.error('[SUPABASE UPLOAD ERROR]', uploadError)
        setUploadError(uploadError.message)
        return null
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl || null
    } catch (e: any) {
      console.error('[SUPABASE UPLOAD ERROR]', e)
      setUploadError(e?.message || 'Error al subir archivo')
      return null
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Merch</h1>
        <Link href="/admin" className="text-sm text-blue-600">← Volver</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inventario / lista de productos */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Inventario</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Cargando...</div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 border rounded p-3">
                  <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate">{it.name}</div>
                      {!it.isActive && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {it.category} • {it.price} CMT
                    </div>
                    <div className="text-sm">Stock: {it.stock}</div>
                  </div>
                  <button
                    onClick={() => editItem(it)}
                    className="px-3 py-1 rounded bg-yellow-400 text-black text-xs hover:bg-yellow-500"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario crear / editar */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">
            {form.id ? `Editar: ${form.name || form.id}` : 'Crear/Actualizar ítem'}
          </h2>
          <div className="space-y-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="ID"
              value={form.id || ''}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Nombre"
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Descripción"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Imagen principal URL"
              value={form.image || ''}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="px-3 py-1 rounded bg-gray-900 text-white text-xs hover:bg-black">
                  Subir imagen
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploadingMain(true)
                    const url = await uploadFileToSupabase(file, 'image')
                    setUploadingMain(false)
                    if (url) {
                      setForm((prev) => ({ ...prev, image: url }))
                    }
                  }}
                />
              </label>
              {uploadingMain && <span className="text-yellow-600">Subiendo imagen...</span>}
            </div>
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Imágenes adicionales (una por línea o separadas por coma)"
              value={(form.images || []).join('\n')}
              onChange={(e) => setForm({ ...form, images: parseImages(e.target.value) })}
              rows={3}
            />
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="px-3 py-1 rounded bg-gray-900 text-white text-xs hover:bg-black">
                  Subir imágenes
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || [])
                    if (!files.length) return
                    setUploadingExtra(true)
                    const urls: string[] = []
                    for (const file of files) {
                      const url = await uploadFileToSupabase(file, 'image')
                      if (url) urls.push(url)
                    }
                    setUploadingExtra(false)
                    if (urls.length) {
                      setForm((prev) => ({
                        ...prev,
                        images: [ ...(prev.images || []), ...urls ]
                      }))
                    }
                  }}
                />
              </label>
              {uploadingExtra && <span className="text-yellow-600">Subiendo imágenes...</span>}
            </div>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Video URL (opcional)"
              value={form.video || ''}
              onChange={(e) => setForm({ ...form, video: e.target.value || null })}
            />
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="px-3 py-1 rounded bg-gray-900 text-white text-xs hover:bg-black">
                  Subir video
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploadingVideo(true)
                    const url = await uploadFileToSupabase(file, 'video')
                    setUploadingVideo(false)
                    if (url) {
                      setForm((prev) => ({ ...prev, video: url }))
                    }
                  }}
                />
              </label>
              {uploadingVideo && <span className="text-yellow-600">Subiendo video...</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                className="border rounded px-3 py-2"
                value={form.category || 'accessories'}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="clothing">clothing</option>
                <option value="accessories">accessories</option>
              </select>
              <input
                className="border rounded px-3 py-2"
                type="number"
                placeholder="Precio (CMT)"
                value={form.price as any || ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Tallas (coma)"
              value={(form.sizes || []).join(',')}
              onChange={(e) =>
                setForm({
                  ...form,
                  sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                })
              }
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Tag (destacado, argentina, navidad, etc.)"
              value={form.tag || ''}
              onChange={(e) => setForm({ ...form, tag: e.target.value || null })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border rounded px-3 py-2"
                type="number"
                placeholder="Stock"
                value={form.stock as any || ''}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
              <select
                className="border rounded px-3 py-2"
                value={(form.isActive ?? true) ? 'true' : 'false'}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.value === 'true' })
                }
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveItem}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded bg-yellow-400 text-black font-semibold disabled:opacity-50 hover:bg-yellow-500"
              >
                {saving ? 'Guardando...' : form.id ? 'Actualizar' : 'Crear Producto'}
              </button>
              {form.id && (
                <button
                  onClick={() => setForm({ category: 'accessories', sizes: [] })}
                  className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
                >
                  Cancelar
                </button>
              )}
            </div>
            {uploadError && (
              <div className="text-xs text-red-600 mt-1">
                Error de subida: {uploadError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
