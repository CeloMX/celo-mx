'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { type Address, createWalletClient, custom } from 'viem';
import { celo } from 'viem/chains';
import { tokens } from '@/config/tokens';

export function useX402Authorization() {
  const { signTypedData } = usePrivy() as any;
  const { wallets } = useWallets();

  async function wrapFetchWithPayment(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const res = await fetch(input, init);
    if (res.status !== 402) return res;

    const offer = await res.json().catch(() => ({}));
    const payment = offer?.payment;
    if (!payment) return res;

    const chainId: number = payment.chainId ?? 42220;
    const tokenAddress: Address = payment.tokenAddress || (tokens.find(t => t.symbol === payment.token)?.address as Address);
    const eip712Name = payment.eip712?.name || 'X402 Token';
    const eip712Version = payment.eip712?.version || '2';
    const now = Math.floor(Date.now() / 1000);
    const validAfter = BigInt(now);
    const validBefore = BigInt(now + 900);
    const value = BigInt(payment.amountAtomic || payment.amountInWei || '1000000000000000000');
    const w = wallets?.[0];
    if (!w?.address) throw new Error('no_wallet');
    const from = w.address as Address;
    const to = payment.recipient as Address;
    const nonce = `0x${crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '')}` as `0x${string}`;

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
    const provider = await (w as any).getEthereumProvider();
    if (!provider) throw new Error('no_provider');
    const walletClient = createWalletClient({ chain: celo, transport: custom(provider) });
    const signature = await walletClient.signTypedData({ account: from, domain, types, primaryType: 'TransferWithAuthorization', message });

    const payload = { domain, eip712: { name: eip712Name, version: eip712Version }, message, signature, tokenAddress };
    const header = typeof window !== 'undefined' ? btoa(JSON.stringify(payload)) : Buffer.from(JSON.stringify(payload)).toString('base64');

    const retry = await fetch(input, { ...init, headers: { ...(init?.headers || {}), 'x-payment': header } });
    return retry;
  }

  return { wrapFetchWithPayment };
}
