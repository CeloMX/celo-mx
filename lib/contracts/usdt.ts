import { Address } from 'viem';

// USDT Token Contract Configuration (Celo Mainnet)
export const USDT_TOKEN_CONFIG = {
  address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' as Address,
  decimals: 6, // USDT typically uses 6 decimals
  symbol: 'USDT',
  name: 'Tether USD',
} as const;

// Standard ERC20 ABI for transfer function (same as CMT)
export { ERC20_ABI } from './cmt';

/**
 * Convert USDT amount to smallest unit (6 decimals)
 */
export function usdtToSmallestUnit(amount: number): bigint {
  return BigInt(Math.floor(amount * 10 ** USDT_TOKEN_CONFIG.decimals));
}

/**
 * Convert smallest unit to USDT amount (6 decimals)
 */
export function smallestUnitToUsdt(amount: bigint): number {
  return Number(amount) / (10 ** USDT_TOKEN_CONFIG.decimals);
}

