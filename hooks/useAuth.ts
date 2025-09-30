import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export interface UseAuthReturn {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  
  // Token management
  accessToken: string | null;
  getAccessToken: () => Promise<string>;
  
  // Admin role management
  isAdmin: boolean;
  checkAdminRole: () => boolean;
  
  // Auth actions
  login: () => void;
  logout: () => Promise<void>;
  
  // Wallet info
  wallet: {
    address: string | null;
    chainId: number | null;
  };
}

export function useAuth(): UseAuthReturn {
  const {
    authenticated,
    ready,
    user,
    login,
    logout,
    getAccessToken,
  } = usePrivy();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Get the primary wallet from linked accounts
  const wallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet'
  ) || null;

  // Update access token when authentication state changes
  useEffect(() => {
    const updateToken = async () => {
      if (authenticated && ready) {
        try {
          const token = await getAccessToken();
          setAccessToken(token);
          
          // Store token in localStorage for middleware access
          if (token) {
            localStorage.setItem('privy-token', token);
            
            // Also set as cookie for SSR
            document.cookie = `privy-token=${token}; path=/; max-age=86400; SameSite=strict`;
          }
        } catch (error) {
          console.error('Failed to get access token:', error);
          setAccessToken(null);
        }
      } else {
        setAccessToken(null);
        localStorage.removeItem('privy-token');
        // Clear cookie
        document.cookie = 'privy-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    };

    updateToken();
  }, [authenticated, ready, getAccessToken]);

  // Check admin role based on user data or environment variables
  const checkAdminRole = () => {
    if (!user || !wallet) return false;

    // Check against admin wallet whitelist from environment
    const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS?.split(',').map(addr => addr.toLowerCase().trim()) || [];
    const walletAddress = (wallet as any)?.address?.toLowerCase();
    
    if (walletAddress && adminWallets.includes(walletAddress)) {
      return true;
    }

    // Check for admin role in user custom claims (if using Privy's custom claims)
    if ((user as any)?.customClaims?.role === 'admin') {
      return true;
    }

    return false;
  };

  // Update admin status when user changes
  useEffect(() => {
    setIsAdmin(checkAdminRole());
  }, [user, wallet]);

  // Enhanced logout that cleans up tokens and admin state
  const handleLogout = async () => {
    try {
      await logout();
      setAccessToken(null);
      setIsAdmin(false);
      localStorage.removeItem('privy-token');
      document.cookie = 'privy-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Enhanced getAccessToken with error handling
  const getTokenSafely = async (): Promise<string> => {
    if (!authenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No token received');
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  };

  return {
    // Authentication state
    isAuthenticated: authenticated && ready,
    isLoading: !ready,
    user,
    
    // Token management
    accessToken,
    getAccessToken: getTokenSafely,
    
    // Admin role management
    isAdmin,
    checkAdminRole,
    
    // Auth actions
    login,
    logout: handleLogout,
    
    // Wallet info
    wallet: {
      address: (wallet as any)?.address || null,
      chainId: (wallet as any)?.chainId || null,
    },
  };
}

// Hook for admin-only components
export function useRequireAdmin() {
  const auth = useAuth();
  
  useEffect(() => {
    // Only enforce admin requirements in production or when explicitly authenticated
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment && auth.isAuthenticated && !auth.isAdmin) {
      // Redirect non-admin users (only in production)
      console.warn('Non-admin user attempted to access admin area');
      window.location.href = '/';
    }
  }, [auth.isAuthenticated, auth.isAdmin]);
  
  return auth;
}

// Hook for authenticated-only components
export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect unauthenticated users to login
      window.location.href = '/login';
    }
  }, [auth.isLoading, auth.isAuthenticated]);
  
  return auth;
}