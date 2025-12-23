import { Address } from 'viem';

// cUSD Token Contract Configuration (Celo Mainnet)
export const CUSD_TOKEN_CONFIG = {
  // Same address as in config/tokens.ts for cUSD
  address: '0x765DE816845861e75A25fCA122bb6898B8B1282a' as Address,
  decimals: 18,
  symbol: 'cUSD',
  name: 'Celo Dollar',
} as const;

// Reuse standard ERC20 ABI (same as CMT)
export { ERC20_ABI } from './cmt';

/**
 * Convert cUSD amount to smallest unit (18 decimals)
 */
export function cusdToSmallestUnit(amount: number): bigint {
  return BigInt(Math.floor(amount * 10 ** CUSD_TOKEN_CONFIG.decimals));
}

/**
 * Convert smallest unit to cUSD amount (18 decimals)
 */
export function smallestUnitToCusd(amount: bigint): number {
  return Number(amount) / 10 ** CUSD_TOKEN_CONFIG.decimals;
}


