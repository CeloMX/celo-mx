import { type Address, createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celo, base, baseSepolia } from 'viem/chains';
import { EIP3009_ABI, splitSignature } from '@/lib/x402/eip3009';

export type SettleRequest = {
  tokenAddress: Address;
  eip712Name: string;
  eip712Version: string;
  from: Address;
  to: Address;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: `0x${string}`;
  signature: `0x${string}`;
  chainId?: number;
};

export async function settleAuthorization(req: SettleRequest) {
  const chainId = req.chainId ?? 42220;
  const pk = process.env.X402_FACILITATOR_PRIVATE_KEY;
  if (!pk) throw new Error('facilitator_key_missing');

  const chain = chainId === 42220 ? celo : chainId === 8453 ? base : chainId === 84532 ? baseSepolia : celo;
  const defaultRpc = chainId === 42220 ? 'https://forno.celo.org' : undefined;
  const rpc = process.env.X402_FACILITATOR_RPC_URL || defaultRpc;
  if (!rpc) throw new Error('rpc_not_configured');

  const publicClient = createPublicClient({ chain, transport: http(rpc) });
  const account = privateKeyToAccount(pk as `0x${string}`);
  const walletClient = createWalletClient({ chain, transport: http(rpc), account });

  const { v, r, s } = splitSignature(req.signature);

  const hash = await walletClient.writeContract({
    address: req.tokenAddress,
    abi: EIP3009_ABI,
    functionName: 'transferWithAuthorization',
    args: [req.from, req.to, req.value, req.validAfter, req.validBefore, req.nonce, v, r, s],
  });

  return { txHash: hash };
}

export async function facilitatorStatus() {
  const rpc = process.env.X402_FACILITATOR_RPC_URL || 'https://forno.celo.org';
  try {
    const client = createPublicClient({ chain: celo, transport: http(rpc) });
    const bn = await client.getBlockNumber();
    return { ok: true, blockNumber: bn, network: 'celo-mainnet' };
  } catch {
    return { ok: false };
  }
}
