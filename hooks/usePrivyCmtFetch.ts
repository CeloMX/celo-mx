'use client';

import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { celo } from 'viem/chains';
import { tokens } from '@/config/tokens';

export function usePrivyCmtFetch() {
  const { wallets } = useWallets();
  async function fetchWithPayment(input: RequestInfo | URL, init?: RequestInit): Promise<{ response: Response; txHash?: string }> {
    const res = await fetch(input, init);
    if (res.status !== 402) return { response: res };

    const body = await res.json().catch(() => ({}));
    const offer = body?.payment;
    if (!offer || offer.token !== 'CMT') return { response: res };

    const w = wallets?.[0];
    if (!w) throw new Error('no_wallet');
    const provider = await w.getEthereumProvider();
    if (!provider) throw new Error('no_provider');

    const walletClient = createWalletClient({ chain: celo, transport: custom(provider) });
    try { await walletClient.switchChain(celo); } catch {}

    const amountWei = BigInt(offer.amountInWei || '0');
    const tokenEntry = tokens.find(t => t.symbol === offer.token);
    const tokenAddress = tokenEntry?.address as `0x${string}`;
    const hash = await walletClient.writeContract({
      account: w.address as `0x${string}`,
      address: tokenAddress,
      abi: [
        {
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          name: 'transfer',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ] as const,
      functionName: 'transfer',
      args: [offer.recipient, amountWei],
    });

    const publicClient = createPublicClient({ chain: celo, transport: http('https://forno.celo.org') });
    await publicClient.waitForTransactionReceipt({ hash });

    const retry = await fetch(input, { ...init, headers: { ...(init?.headers || {}), 'x-payment': hash } });
    return { response: retry, txHash: hash };
  }

  return fetchWithPayment;
}
