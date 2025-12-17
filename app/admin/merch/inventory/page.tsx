"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MerchItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  stock: number | null;
  isActive?: boolean | null;
  tag?: string | null;
};

export default function MerchInventoryPage() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/merch/items");
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateItem = async (id: string, data: Partial<MerchItem>) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/merch/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStockChange = (id: string, value: string) => {
    const stock = Number(value);
    if (Number.isNaN(stock)) return;
    updateItem(id, { stock });
  };

  const handleSoftDeleteToggle = (item: MerchItem) => {
    const nextActive = !(item.isActive ?? true);
    updateItem(item.id, { isActive: nextActive });
  };

  const handleHardDelete = async (item: MerchItem) => {
    const confirmed = window.confirm(
      `¿Eliminar permanentemente "${item.name}" del inventario?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    setUpdatingId(item.id);
    try {
      await fetch(`/api/admin/merch/items/${item.id}`, {
        method: "DELETE",
      });
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Inventario de Merch</h1>
          <p className="text-sm text-gray-500">
            Administra stock, estado y soft delete de los productos.
          </p>
        </div>
        <Link
          href="/admin/merch"
          className="text-sm px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-500"
        >
          + Añadir / Editar Merch
        </Link>
      </div>

      <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
        {loading ? (
          <div className="text-sm text-gray-500 py-8 text-center">
            Cargando inventario...
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500 py-8 text-center">
            No hay productos en el inventario.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isActive = item.isActive ?? true;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 border rounded p-3 ${
                    !isActive ? "opacity-60 bg-gray-50" : ""
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{item.name}</div>
                      {!isActive && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                          Soft deleted
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.category} • {item.price} CMT
                    </div>
                    {item.tag && (
                      <div className="text-xs text-blue-600 mt-1">
                        Tag: {item.tag}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs">
                      Stock:{" "}
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1 text-xs"
                        defaultValue={item.stock ?? 0}
                        onBlur={(e) =>
                          handleStockChange(item.id, e.target.value)
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSoftDeleteToggle(item)}
                        disabled={updatingId === item.id}
                        className={`text-xs px-3 py-1 rounded ${
                          isActive
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        } disabled:opacity-50`}
                      >
                        {isActive ? "Soft delete" : "Restaurar"}
                      </button>
                      <button
                        onClick={() => handleHardDelete(item)}
                        disabled={updatingId === item.id}
                        className="text-xs px-3 py-1 rounded bg-gray-700 text-white hover:bg-black disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


