/**
 * Marketplace Payment Splitter Contract Integration
 * 
 * This contract automatically splits payments:
 * - $10 to Treasury (22.22% of $45)
 * - $35 to Artist (77.78% of $45)
 */

import { encodeFunctionData } from 'viem';

export const PAYMENT_SPLITTER_ABI = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'splitPayment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'artist',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'calculateTreasuryShare',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'calculateArtistShare',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getPendingAmounts',
    outputs: [
      { name: 'treasuryPending', type: 'uint256' },
      { name: 'artistPending', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * Get the payment splitter contract address for a given chain
 */
export function getPaymentSplitterAddress(chainId: number): `0x${string}` | null {
  // TODO: Set these addresses after deployment
  const addresses: Record<number, `0x${string}`> = {
    // Alfajores testnet
    44787: process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_ALFAJORES as `0x${string}`,
    // Celo Mainnet
    42220: process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_MAINNET as `0x${string}`,
  };

  const address = addresses[chainId];
  if (!address || !address.startsWith('0x')) {
    return null;
  }
  return address;
}

/**
 * Encode splitPayment function call
 */
export function encodeSplitPayment(
  tokenAddress: `0x${string}`,
  amount: bigint
): `0x${string}` {
  return encodeFunctionData({
    abi: PAYMENT_SPLITTER_ABI,
    functionName: 'splitPayment',
    args: [tokenAddress, amount],
  });
}

/**
 * Calculate treasury share ($10 from $45 = 22.22%)
 */
export function calculateTreasuryShare(amount: bigint): bigint {
  return (amount * 10n) / 45n;
}

/**
 * Calculate artist share ($35 from $45 = 77.78%)
 */
export function calculateArtistShare(amount: bigint): bigint {
  return (amount * 35n) / 45n;
}

/**
 * Payment splitter configuration
 */
export const PAYMENT_SPLITTER_CONFIG = {
  TREASURY_SHARES: 10,
  ARTIST_SHARES: 35,
  TOTAL_SHARES: 45,
} as const;

