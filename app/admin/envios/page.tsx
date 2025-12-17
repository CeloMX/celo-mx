"use client";

import { useEffect, useState } from "react";
import { Download, Package, Trash2, AlertTriangle } from "lucide-react";

interface ShippingData {
  id: string;
  purchaseId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  phone: string;
  createdAt: string;
  purchase: {
    id: string;
    txHash: string;
    amount: number;
    selectedSize: string | null;
    createdAt: string;
    item: {
      id: string;
      name: string;
      description: string | null;
    };
    user: {
      walletAddress: string | null;
      email: string | null;
      displayName: string | null;
    };
  };
}

export default function AdminEnviosPage() {
  const [shippings, setShippings] = useState<ShippingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  useEffect(() => {
    loadShippings();
  }, []);

  const loadShippings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/shippings", {
        credentials: 'include', // Asegurar que las cookies se envíen
      });
      
      if (!res.ok) {
        let errorData: any = {};
        try {
          const text = await res.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch {
          errorData = { error: `Error ${res.status}: ${res.statusText}` };
        }
        console.error("API Error:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
          fullResponse: errorData
        });
        const errorMessage = errorData.error || errorData.message || `Error ${res.status}: ${res.statusText}`;
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      setShippings(data.shippings || []);
    } catch (err: any) {
      console.error("Error loading shippings:", err);
      setError(err.message || "Error al cargar los envíos");
    } finally {
      setLoading(false);
    }
  };

  const deleteShipping = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este envío? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/shippings?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al eliminar el envío');
      }

      // Recargar la lista
      await loadShippings();
    } catch (err: any) {
      console.error('Error deleting shipping:', err);
      alert(`Error al eliminar: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const deleteAllShippings = async () => {
    if (!confirm('¿Estás SEGURO de que quieres eliminar TODOS los envíos? Esta acción es PERMANENTE y NO se puede deshacer.')) {
      setShowDeleteAllConfirm(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/shippings?all=true', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al eliminar los envíos');
      }

      const data = await res.json();
      alert(`Se eliminaron ${data.deletedCount} envíos correctamente.`);
      
      // Recargar la lista
      await loadShippings();
      setShowDeleteAllConfirm(false);
    } catch (err: any) {
      console.error('Error deleting all shippings:', err);
      alert(`Error al eliminar: ${err.message}`);
      setShowDeleteAllConfirm(false);
    }
  };

  const exportToCSV = () => {
    if (shippings.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // Definir las columnas del CSV
    const headers = [
      "ID Envío",
      "Fecha",
      "Nombre",
      "Apellidos",
      "Email",
      "Teléfono",
      "Dirección",
      "Dirección Línea 2",
      "Código Postal",
      "Estado",
      "Producto",
      "Descripción",
      "Talla",
      "TX Hash",
      "Monto (CMT)",
      "Wallet",
      "Usuario Email",
    ];

    // Crear las filas de datos
    const rows = shippings.map((shipping) => [
      shipping.id,
      new Date(shipping.createdAt).toLocaleString("es-MX"),
      shipping.firstName,
      shipping.lastName,
      shipping.email,
      shipping.phone,
      shipping.address,
      shipping.addressLine2 || "",
      shipping.postalCode,
      shipping.city,
      shipping.purchase.item.name,
      shipping.purchase.item.description || "",
      shipping.purchase.selectedSize || "",
      shipping.purchase.txHash,
      shipping.purchase.amount.toString(),
      shipping.purchase.user.walletAddress || "",
      shipping.purchase.user.email || "",
    ]);

    // Crear el contenido CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
            const cellStr = String(cell || "");
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Crear el blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `envios-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Cargando envíos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error al cargar los envíos</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="text-sm text-red-600 mb-4">
            <p>Posibles causas:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>No estás autenticado como administrador</li>
              <li>La tabla ShippingInfo no existe en la base de datos</li>
              <li>Problema de conexión con la base de datos</li>
            </ul>
          </div>
          <button
            onClick={loadShippings}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Envíos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {shippings.length} {shippings.length === 1 ? "envío registrado" : "envíos registrados"}
          </p>
        </div>
        <div className="flex gap-2">
          {shippings.length > 0 && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Todos
            </button>
          )}
          <button
            onClick={exportToCSV}
            disabled={shippings.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {showDeleteAllConfirm && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold mb-2">Confirmar eliminación de todos los envíos</h3>
              <p className="text-red-700 mb-4">
                Esta acción eliminará permanentemente todos los {shippings.length} envíos registrados. Esta acción NO se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={deleteAllShippings}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                >
                  Sí, eliminar todos
                </button>
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {shippings.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay envíos registrados aún</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TX Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shippings.map((shipping) => (
                  <tr key={shipping.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(shipping.createdAt).toLocaleString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {shipping.firstName} {shipping.lastName}
                      </div>
                      {shipping.purchase.selectedSize && (
                        <div className="text-xs text-gray-500">Talla: {shipping.purchase.selectedSize}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{shipping.email}</div>
                      <div className="text-xs text-gray-500">{shipping.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{shipping.address}</div>
                      {shipping.addressLine2 && (
                        <div className="text-xs text-gray-500">{shipping.addressLine2}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {shipping.postalCode} - {shipping.city}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{shipping.purchase.item.name}</div>
                      {shipping.purchase.item.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {shipping.purchase.item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={`https://celoscan.io/tx/${shipping.purchase.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono text-xs truncate block max-w-xs"
                      >
                        {shipping.purchase.txHash.slice(0, 10)}...
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        {shipping.purchase.amount} CMT
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteShipping(shipping.id)}
                        disabled={deletingId === shipping.id}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        {deletingId === shipping.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

