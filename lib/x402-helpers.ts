import { type Address, createPublicClient, http, parseUnits } from 'viem';
import { celo } from 'viem/chains';
import { tokens } from '@/config/tokens';

export type X402VerifyParams = {
  expectedRecipient: Address;
  expectedTokenSymbol: 'cUSD' | 'CMT' | 'CELO' | 'X402';
  expectedAmount: string; // human units string, e.g. '1.00'
};

export async function verifyX402Payment(paymentProof: string, params: X402VerifyParams): Promise<boolean> {
  try {
    const client = createPublicClient({ chain: celo, transport: http('https://forno.celo.org') });
    const txHash = paymentProof as `0x${string}`;
    const receipt = await client.getTransactionReceipt({ hash: txHash });
    if (!receipt) return false;

    const token = tokens.find(t => t.symbol === params.expectedTokenSymbol);
    if (!token) return false;

    const amountWei = parseUnits(params.expectedAmount, token.decimals);

    if (token.isNative) {
      const tx = await client.getTransaction({ hash: txHash });
      if (tx && tx.to && tx.to.toLowerCase() === params.expectedRecipient.toLowerCase()) {
        return tx.value >= amountWei;
      }
      return false;
    }

    const transferSig = '0xddf252ad';
    const tokenAddr = token.address.toLowerCase();
    const recipientTopic = '0x' + params.expectedRecipient.toLowerCase().slice(2).padStart(64, '0');

    const logs = receipt.logs || [];
    for (const log of logs) {
      if (log.address.toLowerCase() !== tokenAddr) continue;
      if (!log.topics || log.topics.length < 3) continue;
      if (!log.topics[0]?.toLowerCase().startsWith(transferSig)) continue;
      if (log.topics[2]?.toLowerCase() !== recipientTopic) continue;
      const amountHex = BigInt(log.data || '0x0');
      if (amountHex >= amountWei) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export function buildX402Offer({
  amount,
  tokenSymbol,
  recipient,
  expiresInSeconds = 900,
}: { amount: string; tokenSymbol: 'cUSD' | 'CMT' | 'CELO' | 'X402'; recipient: Address; expiresInSeconds?: number }) {
  const now = Date.now();
  const token = tokens.find(t => t.symbol === tokenSymbol)!;
  return {
    id: 'offer_' + now,
    network: 'celo:42220',
    token: tokenSymbol,
    amount,
    amountInWei: parseUnits(amount, token.decimals).toString(),
    recipient,
    expiresAt: new Date(now + expiresInSeconds * 1000).toISOString(),
    facilitator: null,
  };
}
