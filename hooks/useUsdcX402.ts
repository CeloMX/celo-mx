'use client';

import { usePrivy } from '@privy-io/react-auth';
import { type Address } from 'viem';

export function useUsdcX402() {
  const { signTypedData, getWallet } = usePrivy() as any;

  async function wrapFetchWithPayment(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const res = await fetch(input, init);
    if (res.status !== 402) return res;
    const offer = await res.json().catch(() => ({}));
    const payment = offer?.payment;
    if (!payment) return res;

    const chainId: number = payment.chainId ?? 84532;
    const recipient: Address = payment.recipient as Address;
    const tokenAddress: Address = (payment.tokenAddress || process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA) as Address;
    const eip712Name = payment.eip712?.name || 'USD Coin';
    const eip712Version = payment.eip712?.version || '2';
    const now = Math.floor(Date.now() / 1000);
    const validAfter = BigInt(now);
    const validBefore = BigInt(now + 900);
    const value = BigInt(payment.amountAtomic || payment.amountInWei || '10000');
    const from = (await getWallet())?.address as Address;
    const to = recipient;
    const nonce = (crypto as any).randomUUID?.() ? `0x${(crypto as any).randomUUID().replace(/-/g, '').padEnd(64, '0')}` as `0x${string}` : `0x${Array(64).fill('0').join('')}` as `0x${string}`;

    const domain = { name: eip712Name, version: eip712Version, chainId, verifyingContract: tokenAddress } as const;
    const types: Record<string, { name: string; type: string }[]> = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
      ],
    };
    const message = { from, to, value, validAfter, validBefore, nonce } as const;
    const signature = await signTypedData({ domain, types, primaryType: 'TransferWithAuthorization', message });

    const payload = { domain, eip712: { name: eip712Name, version: eip712Version }, message, signature, tokenAddress };
    const header = typeof window !== 'undefined' ? btoa(JSON.stringify(payload)) : Buffer.from(JSON.stringify(payload)).toString('base64');

    const retry = await fetch(input, { ...init, headers: { ...(init?.headers || {}), 'x-payment': header } });
    return retry;
  }

  return { wrapFetchWithPayment };
}

