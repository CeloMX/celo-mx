import type { Address } from 'viem'

export const CMT_FAUCET_ABI = [
  { type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'faucetAmount', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balance', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
] as const

export const CMT_FAUCET_ADDRESSES = {
  44787: (process.env.NEXT_PUBLIC_CMT_FAUCET_ADDRESS_ALFAJORES || '') as Address,
  42220: (process.env.NEXT_PUBLIC_CMT_FAUCET_ADDRESS_MAINNET || '') as Address,
} as const

export function getCmtFaucetAddress(chainId?: number): Address | undefined {
  const id = chainId || 42220
  const addr = CMT_FAUCET_ADDRESSES[id as 44787 | 42220]
  return addr && addr.length === 42 ? (addr as Address) : undefined
}

