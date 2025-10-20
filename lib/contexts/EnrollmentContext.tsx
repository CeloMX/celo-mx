"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourseEnrollmentBadge } from '@/lib/hooks/useSimpleBadge';
import { useEnrollmentService } from '@/lib/hooks/useEnrollmentService';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import type { Address } from 'viem';

interface EnrollmentState {
  hasBadge: boolean;
  hasClaimed: boolean;
  isLoading: boolean;
  enrollInCourse: () => Promise<void>;
  enrollmentHash?: `0x${string}`;
  enrollmentError?: Error | null;
  isEnrolling: boolean;
  isConfirmingEnrollment: boolean;
  enrollmentSuccess: boolean;
  serverHasAccess: boolean;
  isWalletConnected: boolean;
  userAddress?: Address;
}

const EnrollmentContext = createContext<EnrollmentState | null>(null);

interface EnrollmentProviderProps {
  children: ReactNode;
  courseSlug: string;
  courseId: string;
  serverHasAccess: boolean;
}

export function EnrollmentProvider({
  children,
  courseSlug,
  courseId,
  serverHasAccess,
}: EnrollmentProviderProps) {
  console.log('[ENROLLMENT CONTEXT] Initializing for course:', courseSlug);
  
  const { isAuthenticated, wallet } = useAuth();
  const { authenticated: privyAuthenticated } = usePrivy();
  const queryClient = useQueryClient();
  const userAddress = wallet?.address as Address | undefined;
  const isWalletConnected = isAuthenticated && !!userAddress;

  console.log('[ENROLLMENT CONTEXT] Wallet state:', {
    isAuthenticated,
    privyAuthenticated,
    hasWalletAddress: !!userAddress,
    isWalletConnected,
  });

  // Use optimized enrollment for read operations (badge/claim status)
  const optimizedEnrollment = useCourseEnrollmentBadge(courseSlug, courseId, userAddress);
  
  // Use ENROLLMENT SERVICE for write operations (follows Motus pattern)
  const enrollmentService = useEnrollmentService();

  console.log('[ENROLLMENT CONTEXT] Enrollment state:', {
    hasBadge: optimizedEnrollment.hasBadge,
    hasClaimed: optimizedEnrollment.hasClaimed,
    isLoading: optimizedEnrollment.isLoading,
    serviceInitialized: enrollmentService.isInitialized,
    serviceReady: enrollmentService.isServiceReady,
    hasSmartAccount: enrollmentService.hasSmartAccount,
    canSponsorTransaction: enrollmentService.canSponsorTransaction,
    serverHasAccess,
  });

  // Cache invalidation is now handled by the enrollment service
  // The service automatically invalidates cache after successful transactions
  // This follows the Motus pattern of letting the service manage its own state

  // Use enrollment service (follows Motus pattern with direct kernelClient usage)
  const enrollInCourse = async () => {
    console.log('[ENROLLMENT CONTEXT] 🚀 Starting enrollment process for:', {
      courseSlug,
      courseId,
      privyAuthenticated,
      serviceReady: enrollmentService.isServiceReady,
      hasSmartAccount: enrollmentService.hasSmartAccount,
      canSponsorTransaction: enrollmentService.canSponsorTransaction,
      userAddress,
      isWalletConnected,
    });
    
    if (!enrollmentService.isServiceReady) {
      console.error('[ENROLLMENT CONTEXT] ❌ Service not ready');
      throw new Error('Enrollment service not ready. Please wait for smart account initialization.');
    }
    
    console.log('[ENROLLMENT CONTEXT] 🔄 Calling enrollment service...');
    
    try {
      // CRITICAL: Use enrollment service with direct kernelClient.sendTransaction
      const result = await enrollmentService.enrollInCourse(courseSlug, courseId);
      
      console.log('[ENROLLMENT CONTEXT] 📨 Enrollment service response:', result);
      
      if (!result.success) {
        console.error('[ENROLLMENT CONTEXT] ❌ Enrollment failed:', result.error);
        throw new Error(result.error || 'Enrollment failed');
      }
      
      console.log('[ENROLLMENT CONTEXT] ✅ Enrollment completed:', result.transactionHash);
      
      // Force immediate cache refresh
      setTimeout(() => {
        console.log('[ENROLLMENT CONTEXT] 🔄 Triggering cache refresh...');
        queryClient.invalidateQueries();
      }, 500);
      
    } catch (error: any) {
      console.error('[ENROLLMENT CONTEXT] 💥 Enrollment error:', error);
      throw error;
    }
  };

  const enrollmentState: EnrollmentState = {
    hasBadge: optimizedEnrollment.hasBadge,
    hasClaimed: optimizedEnrollment.hasClaimed,
    isLoading: optimizedEnrollment.isLoading || enrollmentService.isLoading,
    enrollInCourse,
    enrollmentHash: undefined, // Service handles transaction hashes internally
    enrollmentError: enrollmentService.error ? new Error(enrollmentService.error) : optimizedEnrollment.enrollmentError,
    isEnrolling: enrollmentService.isLoading,
    isConfirmingEnrollment: false, // Service manages confirmation internally
    enrollmentSuccess: false, // Service handles success state internally
    serverHasAccess,
    isWalletConnected: enrollmentService.hasSmartAccount,
    userAddress,
  };

  return (
    <EnrollmentContext.Provider value={enrollmentState}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}

/**
 * Utility hook to determine if user has access to course content
 */
export function useHasAccess() {
  const enrollment = useEnrollment();
  
  // Check access from multiple sources:
  // 1. Server-side access (already enrolled)
  // 2. Legacy badge/claim status (from SimpleBadge contract)
  // 3. Recent enrollment success (from sponsored or legacy enrollment)
  const hasAccess = enrollment.serverHasAccess || 
                   enrollment.hasBadge || 
                   enrollment.hasClaimed || 
                   enrollment.enrollmentSuccess;

  console.log('[ENROLLMENT ACCESS] Access check:', {
    serverHasAccess: enrollment.serverHasAccess,
    hasBadge: enrollment.hasBadge,
    hasClaimed: enrollment.hasClaimed,
    enrollmentSuccess: enrollment.enrollmentSuccess,
    finalHasAccess: hasAccess,
  });

  return hasAccess;
}
