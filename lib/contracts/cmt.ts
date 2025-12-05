import { Address } from 'viem';

// CMT Token Contract Configuration
export const CMT_TOKEN_CONFIG = {
  address: '0xe8f33f459ffa69314f3d92eb51633ae4946de8f0' as Address,
  decimals: 18,
  symbol: 'CMT',
  name: 'Celo MX Token',
} as const;

// Standard ERC20 ABI for transfer function
export const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'account', type: 'address' }
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Convert CMT amount to wei (18 decimals)
 */
export function cmtToWei(amount: number): bigint {
  return BigInt(Math.floor(amount * 10 ** CMT_TOKEN_CONFIG.decimals));
}

/**
 * Convert wei to CMT amount (18 decimals)
 */
export function weiToCmt(wei: bigint): number {
  return Number(wei) / (10 ** CMT_TOKEN_CONFIG.decimals);
}