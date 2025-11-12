'use client';

import { useEffect, useState } from 'react';

type SmartUser = {
  id: string;
  walletAddress: string;
  smartAccount: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminSmartAccountsPage() {
  const [rows, setRows] = useState<SmartUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/smart-accounts', { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(data.error || res.statusText);
        }
        const data = await res.json();
        setRows(data.users || []);
      } catch (e: any) {
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-celo-fg">Smart Accounts Registrados</h1>
        <p className="text-gray-600 dark:text-celo-muted">Lista de wallets con dirección de smart account registrada.</p>
      </div>

      <div className="bg-white dark:bg-celo-bg border border-gray-200 dark:border-celo-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-celo-border flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-celo-muted">
            {loading ? 'Cargando…' : `${rows.length} registros`}
          </div>
        </div>

        {error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-black/20">
                <tr className="text-left text-gray-600 dark:text-celo-muted">
                  <th className="px-4 py-3 font-medium">User ID</th>
                  <th className="px-4 py-3 font-medium">Wallet</th>
                  <th className="px-4 py-3 font-medium">Smart Account</th>
                  <th className="px-4 py-3 font-medium">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 dark:border-celo-border">
                    <td className="px-4 py-3 text-gray-900 dark:text-celo-fg">{u.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-celo-muted">{u.walletAddress}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-celo-muted">{u.smartAccount}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-celo-muted">{u.updatedAt ? new Date(u.updatedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500 dark:text-celo-muted" colSpan={4}>Sin registros aún</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}