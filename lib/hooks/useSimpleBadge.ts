import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address, parseEther } from 'viem';

// SimpleBadge contract ABI - focused on the functions we need
const SIMPLE_BADGE_ABI = [
  {
    type: 'function',
    name: 'claim',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'adminMint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasBadge',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimed',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const;

// Get contract address from environment
const getContractAddress = (): Address => {
  const address = process.env.NEXT_PUBLIC_MILESTONE_CONTRACT_ADDRESS_ALFAJORES;
  if (!address || address === '[YOUR_ALFAJORES_CONTRACT_ADDRESS]') {
    throw new Error('SimpleBadge contract address not configured');
  }
  return address as Address;
};

// Hook to check if a user has claimed a specific badge
export function useHasBadge(userAddress?: Address, tokenId?: bigint) {
  return useReadContract({
    address: getContractAddress(),
    abi: SIMPLE_BADGE_ABI,
    functionName: 'hasBadge',
    args: userAddress && tokenId !== undefined ? [userAddress, tokenId] : undefined,
    query: {
      enabled: !!userAddress && tokenId !== undefined,
    },
  });
}

// Hook to check if a user has claimed a specific token
export function useHasClaimed(userAddress?: Address, tokenId?: bigint) {
  return useReadContract({
    address: getContractAddress(),
    abi: SIMPLE_BADGE_ABI,
    functionName: 'claimed',
    args: userAddress && tokenId !== undefined ? [userAddress, tokenId] : undefined,
    query: {
      enabled: !!userAddress && tokenId !== undefined,
    },
  });
}

// Hook to get user's badge balance for a specific token
export function useBadgeBalance(userAddress?: Address, tokenId?: bigint) {
  return useReadContract({
    address: getContractAddress(),
    abi: SIMPLE_BADGE_ABI,
    functionName: 'balanceOf',
    args: userAddress && tokenId !== undefined ? [userAddress, tokenId] : undefined,
    query: {
      enabled: !!userAddress && tokenId !== undefined,
    },
  });
}

// Hook to claim a badge (user function)
export function useClaimBadge() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const claimBadge = (tokenId: bigint) => {
    return writeContract({
      address: getContractAddress(),
      abi: SIMPLE_BADGE_ABI,
      functionName: 'claim',
      args: [tokenId],
    });
  };

  return {
    claimBadge,
    hash,
    error,
    isPending,
  };
}

// Hook to admin mint badges
export function useAdminMintBadge() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const adminMint = (to: Address, tokenId: bigint, amount: bigint = 1n) => {
    return writeContract({
      address: getContractAddress(),
      abi: SIMPLE_BADGE_ABI,
      functionName: 'adminMint',
      args: [to, tokenId, amount],
    });
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

// Course-specific token ID helpers
export const COURSE_TOKEN_IDS = {
  'desarrollo-dapps': 1n,
  'defi-fundamentals': 2n,
  'nft-development': 3n,
  'web3-security': 4n,
  // Add more course slugs and their corresponding token IDs
} as const;

// Helper to get token ID from course slug
export function getCourseTokenId(courseSlug: string): bigint {
  return COURSE_TOKEN_IDS[courseSlug as keyof typeof COURSE_TOKEN_IDS] || 0n;
}

// Hook specifically for course enrollment badges
export function useCourseEnrollmentBadge(courseSlug: string, userAddress?: Address) {
  const tokenId = getCourseTokenId(courseSlug);
  const hasBadge = useHasBadge(userAddress, tokenId);
  const hasClaimed = useHasClaimed(userAddress, tokenId);
  const { claimBadge, hash, error, isPending, isConfirming, isSuccess } = useClaimBadgeWithStatus();

  const enrollInCourse = () => {
    if (tokenId === 0n) {
      throw new Error(`No token ID configured for course: ${courseSlug}`);
    }
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