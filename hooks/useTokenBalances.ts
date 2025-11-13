'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { tokens } from '@/config/tokens';

export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  formattedBalance: string;
  decimals: number;
  logo: string;
  isNative?: boolean;
  isStablecoin?: boolean;
}

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useTokenBalances(address?: string) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!address || !publicClient) {
      setBalances([]);
      return;
    }

    const fetchBalances = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const balancePromises = tokens.map(async (token) => {
          try {
            let balance: bigint;

            if (token.isNative) {
              // Get native CELO balance
              balance = await publicClient.getBalance({
                address: address as `0x${string}`,
              });
            } else {
              // Get ERC20 token balance
              balance = await publicClient.readContract({
                address: token.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
              }) as bigint;
            }

            const formattedBalance = formatUnits(balance, token.decimals);
            const displayBalance = parseFloat(formattedBalance).toFixed(4);

            return {
              symbol: token.symbol,
              name: token.name,
              address: token.address,
              balance: balance.toString(),
              formattedBalance: displayBalance,
              decimals: token.decimals,
              logo: token.logo,
              isNative: token.isNative,
              isStablecoin: token.isStablecoin,
            };
          } catch (err) {
            console.error(`Error fetching balance for ${token.symbol}:`, err);
            return {
              symbol: token.symbol,
              name: token.name,
              address: token.address,
              balance: '0',
              formattedBalance: '0.0000',
              decimals: token.decimals,
              logo: token.logo,
              isNative: token.isNative,
              isStablecoin: token.isStablecoin,
            };
          }
        });

        const results = await Promise.all(balancePromises);
        setBalances(results);
      } catch (err) {
        console.error('Error fetching token balances:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();

    // Refresh balances every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [address, publicClient]);

  return { balances, isLoading, error };
}
