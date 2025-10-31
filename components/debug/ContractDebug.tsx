'use client';

import { useState } from 'react';

export function ContractDebug() {
  const [visible, setVisible] = useState(true);
  const optimizedAddress = process.env.NEXT_PUBLIC_OPTIMIZED_CONTRACT_ADDRESS_ALFAJORES;
  const legacyAddress = process.env.NEXT_PUBLIC_MILESTONE_CONTRACT_ADDRESS_ALFAJORES;
  
  console.log('🔍 CONTRACT DEBUG:', {
    optimizedAddress,
    legacyAddress,
    timestamp: new Date().toISOString(),
  });

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs font-mono z-50 shadow-soft">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div>🔍 CONTRACT DEBUG:</div>
          <div>Optimized: {optimizedAddress || 'NOT SET'}</div>
          <div>Legacy: {legacyAddress || 'NOT SET'}</div>
        </div>
        <button
          aria-label="Close contract debug"
          onClick={() => setVisible(false)}
          className="ml-4 rounded bg-white/10 hover:bg-white/20 text-white px-2 py-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
