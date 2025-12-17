'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { celo } from 'viem/chains';

const CELO_MAINNET_CHAIN_ID = '0xa4ec'; // 42220 in hex
const CELO_MAINNET_CHAIN_ID_DECIMAL = 42220;

export function NetworkChecker() {
  const { authenticated, ready } = usePrivy();
  const [showWarning, setShowWarning] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    if (!ready || !authenticated) return;

    const checkNetwork = async () => {
      try {
        // Check if MetaMask or another injected provider is available
        const provider = (window as any).ethereum;
        if (!provider) return;

        const currentChainId = await provider.request({ method: 'eth_chainId' });
        
        if (currentChainId && currentChainId.toLowerCase() !== CELO_MAINNET_CHAIN_ID.toLowerCase()) {
          setShowWarning(true);
          
          // Try to switch automatically (silently, without showing warning if it works)
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: CELO_MAINNET_CHAIN_ID }],
            });
            setShowWarning(false);
          } catch (switchError: any) {
            // If chain is not added, try to add it
            if (switchError?.code === 4902) {
              try {
                await provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: CELO_MAINNET_CHAIN_ID,
                    chainName: 'Celo Mainnet',
                    nativeCurrency: {
                      name: 'CELO',
                      symbol: 'CELO',
                      decimals: 18,
                    },
                    rpcUrls: ['https://forno.celo.org'],
                    blockExplorerUrls: ['https://celoscan.io'],
                  }],
                });
                // Try switching again after adding
                await provider.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: CELO_MAINNET_CHAIN_ID }],
                });
                setShowWarning(false);
              } catch (addError) {
                console.warn('[NETWORK CHECKER] Failed to add Celo Mainnet:', addError);
              }
            }
          }
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        console.warn('[NETWORK CHECKER] Error checking network:', error);
      }
    };

    checkNetwork();

    // Listen for chain changes
    const provider = (window as any).ethereum;
    if (provider) {
      provider.on('chainChanged', () => {
        checkNetwork();
      });
    }

    return () => {
      if (provider) {
        provider.removeListener('chainChanged', checkNetwork);
      }
    };
  }, [ready, authenticated]);

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      const provider = (window as any).ethereum;
      if (!provider) return;

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CELO_MAINNET_CHAIN_ID }],
        });
        setShowWarning(false);
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          // Chain not added, add it first
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CELO_MAINNET_CHAIN_ID,
              chainName: 'Celo Mainnet',
              nativeCurrency: {
                name: 'CELO',
                symbol: 'CELO',
                decimals: 18,
              },
              rpcUrls: ['https://forno.celo.org'],
              blockExplorerUrls: ['https://celoscan.io'],
            }],
          });
        }
      }
    } catch (error) {
      console.error('[NETWORK CHECKER] Failed to switch network:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Red incorrecta en MetaMask
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Tu wallet está conectada a una red diferente. Las transacciones se están enviando correctamente a Celo Mainnet, pero es recomendable cambiar la red en MetaMask.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitching}
                className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold text-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSwitching ? 'Cambiando...' : 'Cambiar a Celo Mainnet'}
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="ml-2 text-sm text-yellow-800 hover:text-yellow-900 underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

