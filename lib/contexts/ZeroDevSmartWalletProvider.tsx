'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import { createPublicClient, createWalletClient, http, custom } from "viem";
import {
  createZeroDevPaymasterClient,
  createKernelAccount,
  createKernelAccountClient,
} from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from '@zerodev/sdk/constants';
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { celo } from "viem/chains";
import { useChainId } from 'wagmi';

// FORCE MAINNET: Always use Celo mainnet for all smart wallet operations
const FORCED_CHAIN = celo;

type SmartWalletContextType = {
  kernelClient: any; // KernelAccountClient from ZeroDev SDK
  smartAccountAddress: `0x${string}` | null;
  isInitializing: boolean;
  isCreatingSmartAccount: boolean; // Alias for compatibility
  isSmartAccountReady: boolean;
  canSponsorTransaction: boolean;
  error: string | null; // Changed to string for React compatibility
  isLoading: boolean; // Added for compatibility
  degradedMode: boolean;
  forceReconnect: () => Promise<void>;
  executeTransaction: (params: {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
  }) => Promise<`0x${string}` | null>;
};

const SmartWalletContext = createContext<SmartWalletContextType>({
  kernelClient: null,
  smartAccountAddress: null,
  isInitializing: false,
  isCreatingSmartAccount: false,
  isSmartAccountReady: false,
  canSponsorTransaction: false,
  error: null,
  isLoading: false,
  degradedMode: false,
  forceReconnect: async () => {},
  executeTransaction: async () => null,
});

export const ZeroDevSmartWalletProvider = ({
  children,
  zeroDevProjectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || "e46f4ac3-404e-42fc-a3d3-1c75846538a8",
}: {
  children: React.ReactNode;
  zeroDevProjectId?: string;
}) => {
  console.log('[ZERODEV] Provider initialized with project ID:', zeroDevProjectId);
  const { wallets } = useWallets();
  const { authenticated, ready: privyReady, login, logout } = usePrivy();
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    `0x${string}` | null
  >(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [degradedMode, setDegradedMode] = useState(false);
  const [fallbackTimerStarted, setFallbackTimerStarted] = useState(false);
  
  console.log('[ZERODEV] Using FORCED mainnet chain:', FORCED_CHAIN.name, 'ID:', FORCED_CHAIN.id);

  const executeTransaction = async (params: {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
  }): Promise<`0x${string}` | null> => {
    if (!kernelClient) {
      console.error('[ZERODEV] Kernel client not ready');
      return null;
    }

    try {
      console.log('[ZERODEV] Executing sponsored transaction:', {
        to: params.to,
        data: params.data.slice(0, 10) + '...',
        value: params.value?.toString() || '0',
      });

      // Use ZeroDev's sendTransaction which handles paymaster automatically
      const hash = await kernelClient.sendTransaction({
        to: params.to,
        data: params.data,
        value: params.value || 0n,
      });

      console.log('[ZERODEV] Transaction sent:', hash);
      return hash;
    } catch (error) {
      console.error('[ZERODEV] Transaction failed:', error);
      throw error;
    }
  };

  const forceReconnect = async () => {
    try {
      await logout();
    } catch {}
    try {
      localStorage.removeItem('privy-token');
      document.cookie = 'privy-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'wallet-address=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch {}
    setKernelClient(null);
    setSmartAccountAddress(null);
    setHasInitialized(false);
    setDegradedMode(false);
    try {
      await login();
    } catch {}
  };

  // Helper function to check if smart account already exists
  const checkExistingSmartAccount = async (walletAddress: string): Promise<string | null> => {
    try {
      // Check localStorage for existing smart account address
      const existingSmartAccount = localStorage.getItem(`zerodev-smart-account-${walletAddress.toLowerCase()}`);
      if (existingSmartAccount) {
        console.log('[ZERODEV] Found existing smart account in storage:', existingSmartAccount);
        return existingSmartAccount;
      }
      return null;
    } catch (error) {
      console.error('[ZERODEV] Error checking existing smart account:', error);
      return null;
    }
  };

  // Immediate recovery effect - try to restore previous state as soon as possible
  useEffect(() => {
    const immediateRecovery = () => {
      // Try to recover state immediately, even before Privy is fully ready
      if (hasInitialized || isInitializing || smartAccountAddress) {
        return;
      }

      console.log('[ZERODEV] Attempting immediate Smart Account state recovery...');
      
      try {
        const storedWalletAddress = localStorage.getItem('zerodev-selected-wallet');
        if (storedWalletAddress) {
          const existingSmartAccount = localStorage.getItem(`zerodev-smart-account-${storedWalletAddress.toLowerCase()}`);
          if (existingSmartAccount) {
            console.log('[ZERODEV] ⚡ Immediate recovery successful:', {
              wallet: storedWalletAddress,
              smartAccount: existingSmartAccount
            });
            
            // Set the smart account address immediately for UI responsiveness
            setSmartAccountAddress(existingSmartAccount as `0x${string}`);
            return;
          }
        }
      } catch (error) {
        console.error('[ZERODEV] Error during immediate recovery:', error);
      }
    };

    immediateRecovery();
  }, []); // Run only once on mount

  useEffect(() => {
    if (fallbackTimerStarted) return;
    setFallbackTimerStarted(true);
    const timeout = setTimeout(() => {
      const storedWalletAddress = localStorage.getItem('zerodev-selected-wallet');
      const existingSmartAccount = storedWalletAddress
        ? localStorage.getItem(`zerodev-smart-account-${storedWalletAddress.toLowerCase()}`)
        : null;
      const shouldDegrade = !privyReady || !authenticated || (!kernelClient && !!smartAccountAddress);
      if (shouldDegrade) {
        if (!smartAccountAddress && existingSmartAccount) {
          setSmartAccountAddress(existingSmartAccount as `0x${string}`);
        }
        setDegradedMode(true);
        console.log('[ZERODEV] Fallback mode activated');
      }
    }, 7000);
    return () => clearTimeout(timeout);
  }, [fallbackTimerStarted, privyReady, authenticated, kernelClient, smartAccountAddress]);

  // Full recovery effect - wait for Privy and wallets to be ready
  useEffect(() => {
    const recoverSmartAccountState = async () => {
      // Wait for Privy to be ready first
      if (!privyReady) {
        console.log('[ZERODEV] Waiting for Privy to be ready...');
        return;
      }

      if (!authenticated || !wallets || wallets.length === 0 || hasInitialized || isInitializing) {
        return;
      }

      setIsRecovering(true);
      console.log('[ZERODEV] Attempting full Smart Account state recovery...');

      try {
        // Check if we have a stored wallet address and smart account
        const storedWalletAddress = localStorage.getItem('zerodev-selected-wallet');
        if (storedWalletAddress) {
          const existingSmartAccount = localStorage.getItem(`zerodev-smart-account-${storedWalletAddress.toLowerCase()}`);
          if (existingSmartAccount) {
            console.log('[ZERODEV] Found previous Smart Account state:', {
              wallet: storedWalletAddress,
              smartAccount: existingSmartAccount
            });
            
            // Set the smart account address if not already set
            if (!smartAccountAddress) {
              setSmartAccountAddress(existingSmartAccount as `0x${string}`);
            }
            
            // Trigger full initialization in the background
            setTimeout(() => {
              setIsRecovering(false);
            }, 500);
            
            return;
          }
        }
      } catch (error) {
        console.error('[ZERODEV] Error during state recovery:', error);
      } finally {
        setIsRecovering(false);
      }
    };

    recoverSmartAccountState();
  }, [privyReady, authenticated, wallets, smartAccountAddress]);

  useEffect(() => {
    const initializeSmartWallet = async () => {
      // Wait for Privy to be ready first
      if (!privyReady) {
        console.log('[ZERODEV] Waiting for Privy to be ready before initializing...');
        return;
      }

      if (!authenticated || !wallets || wallets.length === 0) {
        setKernelClient(null);
        setSmartAccountAddress(null);
        setIsInitializing(false);
        setHasInitialized(false);
        return;
      }

      // Prevent multiple initializations
      if (isInitializing || hasInitialized) {
        console.log('[ZERODEV] Already initializing or initialized, skipping...');
        return;
      }

      // Wait for recovery to complete
      if (isRecovering) {
        console.log('[ZERODEV] Waiting for state recovery to complete...');
        return;
      }

      // Retry logic for network failures
      const maxRetries = 3;
      let retryCount = 0;

      const attemptInitialization = async (): Promise<void> => {
        try {
          setIsInitializing(true);
          setError(null);
          console.log('[ZERODEV] Initializing smart wallet with wallets:', wallets.length, `(attempt ${retryCount + 1}/${maxRetries})`);
        
        // DETERMINISTIC WALLET SELECTION WITH PERSISTENCE
        // Check if we have a previously selected wallet address stored
        const storedWalletAddress = localStorage.getItem('zerodev-selected-wallet');
        let walletToUse = null;

        if (storedWalletAddress) {
          walletToUse = wallets.find(wallet => wallet.address.toLowerCase() === storedWalletAddress.toLowerCase());
          console.log('[ZERODEV] Found stored wallet address:', storedWalletAddress, 'Available:', !!walletToUse);

          if (!walletToUse) {
            console.log('[ZERODEV] Stored wallet not available yet, waiting for wallets to load...');
            setIsInitializing(false);
            return;
          }
        }

        if (!walletToUse) {
          const sortedWallets = [...wallets].sort((a, b) => {
            if (a.walletClientType === 'privy' && b.walletClientType !== 'privy') return -1;
            if (a.walletClientType !== 'privy' && b.walletClientType === 'privy') return 1;
            return a.address.localeCompare(b.address);
          });

          walletToUse = sortedWallets[0];

          if (walletToUse) {
            localStorage.setItem('zerodev-selected-wallet', walletToUse.address);
            console.log('[ZERODEV] Stored wallet address for future use:', walletToUse.address);
          }
        }
        
        if (!walletToUse) {
          console.log('[ZERODEV] No wallet found for smart account connection');
          setIsInitializing(false);
          return;
        }

        console.log('[ZERODEV] Selected wallet:', {
          address: walletToUse.address,
          type: walletToUse.walletClientType,
          isEmbedded: walletToUse.walletClientType === 'privy',
        });

        // Check if we already have a smart account for this wallet
        const existingSmartAccount = await checkExistingSmartAccount(walletToUse.address);
        if (existingSmartAccount) {
          console.log('[ZERODEV] ✅ Found existing smart account:', existingSmartAccount);
        } else {
          console.log('[ZERODEV] No existing smart account found, will create new one...');
        }
        
        // Get EntryPoint v0.7 from ZeroDev SDK
        const entryPoint = getEntryPoint('0.7');
        
        // Get the EIP1193 provider from the selected wallet
        const provider = await walletToUse.getEthereumProvider();
        if (!provider) {
          throw new Error('Failed to get Ethereum provider from wallet');
        }

        console.log('[ZERODEV] Creating ECDSA Kernel smart account...');
        
        // Create public client for blockchain interactions
        const publicClient = createPublicClient({
          chain: FORCED_CHAIN,
          transport: http(),
        });
        
        // Create wallet client from the EIP-1193 provider
        const walletClient = createWalletClient({
          chain: FORCED_CHAIN,
          transport: custom(provider),
        });
        
        console.log('[ZERODEV] Creating ECDSA validator...');
        
        // Create ECDSA validator using ZeroDev SDK
        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
          signer: walletClient as any, // Type assertion for compatibility
          entryPoint: entryPoint,
          kernelVersion: KERNEL_V3_1,
        });
        
        console.log('[ZERODEV] Creating Kernel account...');
        
        // Create Kernel account using ZeroDev SDK with proper version for EntryPoint v0.7
        const account = await createKernelAccount(publicClient, {
          plugins: {
            sudo: ecdsaValidator,
          },
          entryPoint: entryPoint,
          kernelVersion: KERNEL_V3_1,
        });

        console.log('[ZERODEV] Created smart account:', account.address);

        const baseUrl = `https://rpc.zerodev.app/api/v3/${zeroDevProjectId}/chain/${FORCED_CHAIN.id}`;
        const bundlerUrl = `${baseUrl}?selfFunded=true`;
        const paymasterUrl = `${baseUrl}?selfFunded=true`;




        console.log('[ZERODEV] URLs configured:', {
          bundlerUrl,
          paymasterUrl,
          projectId: zeroDevProjectId,
          chainId: FORCED_CHAIN.id,
          chainName: FORCED_CHAIN.name
        });

        console.log('[ZERODEV] Creating paymaster client...');
        
        // Create paymaster client following ZeroDev docs pattern
        const paymasterClient = createZeroDevPaymasterClient({
          chain: FORCED_CHAIN,
          transport: http(paymasterUrl),
        });
        const paymasterClientFallback = createZeroDevPaymasterClient({
          chain: FORCED_CHAIN,
          transport: http(baseUrl),
        });
        
        console.log('[ZERODEV] Creating Kernel account client...');
        
        // Create Kernel client using ZeroDev SDK with explicit sponsorUserOperation callback
        const client = createKernelAccountClient({
          account,
          chain: FORCED_CHAIN,
          bundlerTransport: http(baseUrl),
          paymaster: {
            getPaymasterData: async (userOperation: any) => {
              try {
                return await paymasterClient.sponsorUserOperation({ userOperation });
              } catch (err: any) {
                const msg = String(err?.message || '');
                const details = String((err?.details as any) || '');
                const isBundlerNotFound = msg.includes('No bundler RPC found') || details.includes('No bundler RPC found');
                if (isBundlerNotFound) {
                  console.warn('[ZERODEV] selfFunded paymaster unavailable on 42220, falling back to base RPC');
                  return await paymasterClientFallback.sponsorUserOperation({ userOperation });
                }
                throw err;
              }
            },
          },
          client: publicClient,
        });
        
        console.log("[ZERODEV] ✅ Smart account client created:", client.account.address);
        console.log("[ZERODEV] Chain ID:", await client.getChainId());

        setKernelClient(client);
        
        // Set the smart account address (either existing or newly created)
        const finalSmartAccountAddress = existingSmartAccount || account.address;
        
        // Store the smart account address for future use if it's new
        if (!existingSmartAccount) {
          localStorage.setItem(`zerodev-smart-account-${walletToUse.address.toLowerCase()}`, account.address);
          console.log('[ZERODEV] Stored new smart account address for wallet:', walletToUse.address, '->', account.address);
        }
        
        setSmartAccountAddress(finalSmartAccountAddress as `0x${string}`);
        setHasInitialized(true);
        setDegradedMode(false);
          console.log('[ZERODEV] 🎉 Smart wallet initialization complete!');
      } catch (err) {
          console.error(`[ZERODEV] ❌ Error initializing smart wallet (attempt ${retryCount + 1}):`, err);
          
          retryCount++;
          
          // Check if it's a network error that we should retry
          const isRetryableError = err instanceof Error && (
            err.message.includes('Failed to fetch') ||
            err.message.includes('HTTP request failed') ||
            err.message.includes('network') ||
            err.message.includes('timeout')
          );
          
          if (retryCount < maxRetries && isRetryableError) {
            console.log(`[ZERODEV] Retrying initialization in 2 seconds... (${retryCount}/${maxRetries})`);
            setError(`Connection failed, retrying... (${retryCount}/${maxRetries})`);
            
            // Wait 2 seconds before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            return attemptInitialization();
          } else {
            // Final failure
            setError(err instanceof Error ? err.message : "Unknown error");
            setHasInitialized(false);
            throw err;
          }
        } finally {
          setIsInitializing(false);
        }
      };

      await attemptInitialization();
    };

    initializeSmartWallet();
  }, [privyReady, authenticated, wallets, zeroDevProjectId]);

  useEffect(() => {
    if (!privyReady) {
      return;
    }
    if (!authenticated) {
      setKernelClient(null);
      setSmartAccountAddress(null);
      setError(null);
      setHasInitialized(false);
      localStorage.removeItem('merch-purchases');
      console.log('[ZERODEV] Cleared legacy data on logout');
    }
  }, [privyReady, authenticated]);

  const contextValue: SmartWalletContextType = {
    kernelClient,
    smartAccountAddress,
    isInitializing: isInitializing || isRecovering,
    isCreatingSmartAccount: isInitializing || isRecovering, // Alias for compatibility
    isSmartAccountReady: !!kernelClient && !!smartAccountAddress && !isInitializing && !isRecovering,
    canSponsorTransaction: !!kernelClient && !!smartAccountAddress && !isInitializing && !isRecovering,
    error,
    isLoading: isInitializing || isRecovering, // Alias for compatibility
    degradedMode,
    forceReconnect,
    executeTransaction,
  };

  return (
    <SmartWalletContext.Provider value={contextValue}>
      {children}
    </SmartWalletContext.Provider>
  );
};

export const useZeroDevSmartWallet = () => {
  const context = useContext(SmartWalletContext);
  if (context === undefined) {
    throw new Error("useZeroDevSmartWallet must be used within a ZeroDevSmartWalletProvider");
  }
  return context;
};

// Alias for backward compatibility with existing code
export const useSmartAccount = useZeroDevSmartWallet;
