'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect } from 'wagmi';
import { type Address, encodeFunctionData } from 'viem';
import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { LEGACY_COURSE_TOKEN_IDS, generateTokenIdFromCourseId, getCourseTokenId } from '@/lib/courseToken';
import {
  OPTIMIZED_CONTRACT_CONFIG,
  getOptimizedContractAddress,
  ENROLLMENT_CACHE_CONFIG,
  MODULE_CACHE_CONFIG,
} from '@/lib/contracts/optimized-badge-config';

// Use unified contract configuration (SINGLE SOURCE OF TRUTH)
const { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI } = OPTIMIZED_CONTRACT_CONFIG;

// Hook to check if a user has a badge (optimized contract uses isEnrolled)
export function useHasBadge(userAddress?: Address, tokenId?: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isEnrolled',
    args: userAddress && tokenId !== undefined ? [userAddress, tokenId] : undefined,
    query: {
      enabled: !!userAddress && tokenId !== undefined,
      ...ENROLLMENT_CACHE_CONFIG,
    },
  });
}

// Hook to check if a user is enrolled (using optimized contract isEnrolled)
export function useHasClaimed(userAddress?: Address, courseId?: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isEnrolled',
    args: userAddress && courseId !== undefined ? [userAddress, courseId] : undefined,
    query: {
      enabled: !!userAddress && courseId !== undefined,
      ...ENROLLMENT_CACHE_CONFIG,
    },
  });
}

// Hook to check enrollment status (replaces legacy balanceOf)
export function useBadgeBalance(userAddress?: Address, courseId?: bigint) {
  // For optimized contract, we use isEnrolled instead of balanceOf
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isEnrolled',
    args: userAddress && courseId !== undefined ? [userAddress, courseId] : undefined,
    query: {
      enabled: !!userAddress && courseId !== undefined,
      ...MODULE_CACHE_CONFIG,
    },
  });
}

// Hook to claim a badge (user function)
export function useClaimBadge() {
  const { writeContract, data: wagmiHash, error: wagmiError, isPending } = useWriteContract();
  const { isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const queryClient = useQueryClient();
  const [fallbackHash, setFallbackHash] = useState<`0x${string}` | undefined>(undefined);
  const [fallbackError, setFallbackError] = useState<Error | null>(null);

  const claimBadge = async (courseId: bigint) => {
    // 1) Try wagmi connector path first
    try {
      if (!isConnected) {
        const readyConnectors = connectors.filter((c) => (c as any)?.ready);
        const injected = readyConnectors.find((c) => c.id === 'injected');
        const connector = injected || readyConnectors[0];
        if (connector) {
          await connectAsync({ connector });
        }
      }
      if (isConnected) {
        const hash = await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'enroll',
          args: [courseId],
        });
        
        // Invalidate enrollment cache immediately after transaction is sent
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: ['readContract'], 
            predicate: (query: any) => {
              const queryKey = query.queryKey;
              return queryKey && 
                     queryKey[0] === 'readContract' && 
                     queryKey[1]?.address === CONTRACT_ADDRESS && 
                     queryKey[1]?.functionName === 'isEnrolled';
            }
          });
        }, 1000);
        
        return hash;
      }
    } catch (_) {
      // fallthrough to Privy fallback
    }

    // 2) Privy embedded wallet fallback (mobile Safari without connectors)
    try {
      if (!ready || !authenticated || !wallets || wallets.length === 0) {
        throw new Error('No Privy wallet available. Please sign in to Privy.');
      }
      const primary = wallets[0] as any;
      if (typeof primary.getEthereumProvider !== 'function') {
        throw new Error('Privy provider unavailable in this environment.');
      }
      const provider = await primary.getEthereumProvider();

      // Ensure we're on Celo Alfajores before sending tx (chainId 44787 = 0xaef3)
      await ensureCeloAlfajores(provider);

      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'enroll',
        args: [courseId],
      });
      const from = primary.address || (await provider.request({ method: 'eth_accounts' }))[0];
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: CONTRACT_ADDRESS, data, value: '0x0' }],
      });
      setFallbackHash(txHash as `0x${string}`);
      
      // Invalidate enrollment cache immediately after transaction is sent
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['readContract'], 
          predicate: (query: any) => {
            const queryKey = query.queryKey;
            return queryKey && 
                   queryKey[0] === 'readContract' && 
                   queryKey[1]?.address === CONTRACT_ADDRESS && 
                   queryKey[1]?.functionName === 'isEnrolled';
          }
        });
      }, 1000);
      
      return txHash;
    } catch (err: any) {
      setFallbackError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  // Ensure Privy provider is connected to Celo Alfajores (44787)
  async function ensureCeloAlfajores(provider: any) {
    try {
      const desiredHex = '0xaef3'; // 44787
      const current = await provider.request({ method: 'eth_chainId' });
      if (typeof current === 'string' && current.toLowerCase() === desiredHex) return;
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredHex }],
        });
        return;
      } catch (switchErr: any) {
        // 4902: Unrecognized chain
        if (switchErr?.code === 4902 || /unrecognized|unknown chain/i.test(String(switchErr?.message))) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: desiredHex,
                chainName: 'Celo Alfajores',
                nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
                rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                blockExplorerUrls: ['https://alfajores.celoscan.io'],
              }],
            });
            // Try switching again after adding
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: desiredHex }],
            });
            return;
          } catch (_) {
            // If add/switch fails, continue; the tx may still succeed if provider routes correctly
          }
        }
        // If other switch errors, proceed without hard fail
      }
    } catch (_) {
      // Ignore chain detection errors; best-effort only
    }
  }

  return {
    claimBadge,
    hash: (wagmiHash as `0x${string}` | undefined) || fallbackHash,
    error: wagmiError || fallbackError,
    isPending,
  };
}

// Hook to admin mint badges (NOT SUPPORTED in optimized contract)
export function useAdminMintBadge() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const adminMint = (to: Address, courseId: bigint, amount: bigint = 1n) => {
    // adminMint function does not exist in optimized contract
    console.error('[ADMIN MINT] adminMint function is not available in optimized contract');
    throw new Error('adminMint function is not supported in optimized contract. Use enroll() instead.');
  };

  return {
    adminMint,
    hash,
    error,
    isPending,
  };
}

// Hook to wait for transaction confirmation
export function useBadgeTransactionStatus(hash?: `0x${string}`) {
  return useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });
}

// Combined hook for claiming badges with status tracking
export function useClaimBadgeWithStatus() {
  const { claimBadge, hash, error, isPending } = useClaimBadge();
  const { isLoading: isConfirming, isSuccess, error: confirmError } = useBadgeTransactionStatus(hash);

  return {
    claimBadge,
    hash,
    error: error || confirmError,
    isPending,
    isConfirming,
    isSuccess,
  };
}

// Hook specifically for course enrollment badges
export function useCourseEnrollmentBadge(courseSlug: string, courseId?: string, userAddress?: Address) {
  const tokenId = getCourseTokenId(courseSlug, courseId);
  const hasBadge = useHasBadge(userAddress, tokenId);
  const hasClaimed = useHasClaimed(userAddress, tokenId);
  const { claimBadge, hash, error, isPending, isConfirming, isSuccess } = useClaimBadgeWithStatus();

  const enrollInCourse = () => {
    // With dynamic generation, we should always have a token ID
    return claimBadge(tokenId);
  };

  return {
    tokenId,
    hasBadge: hasBadge.data || false,
    hasClaimed: hasClaimed.data || false,
    isLoading: hasBadge.isLoading || hasClaimed.isLoading,
    enrollInCourse,
    enrollmentHash: hash,
    enrollmentError: error,
    isEnrolling: isPending,
    isConfirmingEnrollment: isConfirming,
    enrollmentSuccess: isSuccess,
  };
}
