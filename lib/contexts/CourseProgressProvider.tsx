"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useEnrollment } from './EnrollmentContext';
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider';
import { useModulesCompleted, useHasCompletedModule } from '@/lib/hooks/useModuleCompletion';
import { getCourseTokenId } from '@/lib/courseToken';
import type { Address } from 'viem';

interface CourseProgressState {
  // User identification
  userAddress: Address | undefined;
  isConnected: boolean;
  
  // Course identification
  courseSlug: string;
  courseId: string;
  tokenId: bigint;
  
  // Progress data - SINGLE SOURCE OF TRUTH
  totalModules: number;
  completedModules: number;
  progressPercentage: number;
  isComplete: boolean;
  
  // Individual module completion status
  moduleCompletionStatus: boolean[];
  
  // Loading states
  isLoading: boolean;
}

const CourseProgressContext = createContext<CourseProgressState | null>(null);

interface CourseProgressProviderProps {
  children: ReactNode;
  courseSlug: string;
  courseId: string;
  totalModules: number;
}

export function CourseProgressProvider({
  children,
  courseSlug,
  courseId,
  totalModules,
}: CourseProgressProviderProps) {
  // USE ENROLLMENT CONTEXT FOR CONSISTENT ADDRESS
  const enrollment = useEnrollment();
  const smartAccount = useSmartAccount();
  
  // MATCH THE ENROLLMENT CONTEXT ADDRESS LOGIC
  const walletAddress = enrollment.userAddress;
  const addressForProgressCheck = smartAccount.smartAccountAddress || walletAddress;
  const isConnected = enrollment.isWalletConnected;
  
  const tokenId = getCourseTokenId(courseSlug, courseId);
  
  // Read contract data for BOTH wallet and smart account addresses and combine
  const walletModulesCompleted = useModulesCompleted(walletAddress, tokenId);
  const smartModulesCompleted = useModulesCompleted(smartAccount.smartAccountAddress || undefined, tokenId);
  
  // Individual module completion status for wallet
  const wallet_module0 = useHasCompletedModule(walletAddress, tokenId, 0);
  const wallet_module1 = useHasCompletedModule(walletAddress, tokenId, 1);
  const wallet_module2 = useHasCompletedModule(walletAddress, tokenId, 2);
  const wallet_module3 = useHasCompletedModule(walletAddress, tokenId, 3);
  const wallet_module4 = useHasCompletedModule(walletAddress, tokenId, 4);
  
  // Individual module completion status for smart account
  const smart_module0 = useHasCompletedModule(smartAccount.smartAccountAddress || undefined, tokenId, 0);
  const smart_module1 = useHasCompletedModule(smartAccount.smartAccountAddress || undefined, tokenId, 1);
  const smart_module2 = useHasCompletedModule(smartAccount.smartAccountAddress || undefined, tokenId, 2);
  const smart_module3 = useHasCompletedModule(smartAccount.smartAccountAddress || undefined, tokenId, 3);
  const smart_module4 = useHasCompletedModule(smartAccount.smartAccountAddress || undefined, tokenId, 4);
  
  // Build completion status array
  const moduleCompletionStatus = [
    (wallet_module0.data || false) || (smart_module0.data || false),
    (wallet_module1.data || false) || (smart_module1.data || false),
    (wallet_module2.data || false) || (smart_module2.data || false),
    (wallet_module3.data || false) || (smart_module3.data || false),
    (wallet_module4.data || false) || (smart_module4.data || false),
  ].slice(0, totalModules);
  
  // Count actual completed modules from individual checks
  const completedModules = moduleCompletionStatus.filter(Boolean).length;
  
  // Calculate progress
  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const isComplete = progressPercentage === 100;
  
  // Loading state
  const isLoading = (walletModulesCompleted.isLoading || smartModulesCompleted.isLoading) ||
                   wallet_module0.isLoading || wallet_module1.isLoading || wallet_module2.isLoading ||
                   smart_module0.isLoading || smart_module1.isLoading || smart_module2.isLoading;
  
  console.log('[COURSE PROGRESS PROVIDER] PROGRESS DATA:', {
    walletAddress,
    smartAccountAddress: smartAccount.smartAccountAddress,
    addressForProgressCheck,
    isConnected,
    courseSlug,
    totalModules,
    completedModules,
    progressPercentage,
    moduleCompletionStatus,
    contractModulesCompletedWallet: walletModulesCompleted.data?.toString(),
    contractModulesCompletedSmart: smartModulesCompleted.data?.toString(),
  });
  
  const contextValue: CourseProgressState = {
    userAddress: addressForProgressCheck,
    isConnected,
    courseSlug,
    courseId,
    tokenId,
    totalModules,
    completedModules,
    progressPercentage,
    isComplete,
    moduleCompletionStatus,
    isLoading,
  };
  
  return (
    <CourseProgressContext.Provider value={contextValue}>
      {children}
    </CourseProgressContext.Provider>
  );
}

export function useCourseProgress() {
  const context = useContext(CourseProgressContext);
  if (!context) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
}
