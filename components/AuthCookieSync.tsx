'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

/**
 * Component that syncs Privy authentication tokens to cookies
 * This ensures middleware can access auth state on every request
 */
export function AuthCookieSync() {
  const { authenticated, ready, user, getAccessToken } = usePrivy();

  useEffect(() => {
    const syncTokens = async () => {
      if (!ready) return;

      if (authenticated && user) {
        try {
          // Get fresh token
          const token = await getAccessToken();
          
          if (token) {
            // Set token cookie
            const isProduction = window.location.protocol === 'https:';
            const cookieOptions = `path=/; max-age=86400; SameSite=lax${isProduction ? '; secure' : ''}`;
            document.cookie = `privy-token=${token}; ${cookieOptions}`;

            // Get wallet address from linked accounts
            const wallet = user.linkedAccounts?.find(
              (account: any) => account.type === 'wallet'
            );
            
            if (wallet && 'address' in wallet) {
              document.cookie = `wallet-address=${(wallet as { address: string }).address}; ${cookieOptions}`;
            }

            console.log('[AuthCookieSync] Tokens synced to cookies');
          }
        } catch (error) {
          console.error('[AuthCookieSync] Failed to sync tokens:', error);
        }
      } else {
        // Clear cookies when not authenticated
        document.cookie = 'privy-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'wallet-address=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        console.log('[AuthCookieSync] Cookies cleared');
      }
    };

    syncTokens();
  }, [authenticated, ready, user, getAccessToken]);

  return null; // This component doesn't render anything
}
