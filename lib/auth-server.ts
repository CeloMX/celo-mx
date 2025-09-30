/**
 * Basic JWT token validation (simplified for development)
 * In production, you should use proper JWT verification
 */
export async function validatePrivyToken(token: string) {
  try {
    if (!token) {
      return { isValid: false, user: null, error: 'No token provided' };
    }

    // Basic token format validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, user: null, error: 'Invalid token format' };
    }

    // Decode payload (without verification for development)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return { isValid: false, user: null, error: 'Token expired' };
    }
    
    // Check issuer
    if (payload.iss && !payload.iss.includes('privy')) {
      return { isValid: false, user: null, error: 'Invalid issuer' };
    }

    // Return basic user info from token
    return {
      isValid: true,
      user: {
        id: payload.sub,
        linkedAccounts: payload.wallet ? [{ type: 'wallet', address: payload.wallet }] : [],
        email: payload.email,
      },
      userId: payload.sub,
      error: null,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      isValid: false,
      user: null,
      error: error instanceof Error ? error.message : 'Token validation failed',
    };
  }
}

/**
 * Checks if a user has admin privileges
 */
export function checkAdminRole(user: any): boolean {
  if (!user) return false;

  // Check against admin wallet whitelist
  const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.toLowerCase().trim()) || [];
  
  // Check all linked accounts for wallet addresses
  const walletAddresses = user.linkedAccounts
    ?.filter((account: any) => account.type === 'wallet')
    .map((account: any) => account.address.toLowerCase()) || [];

  const hasAdminWallet = walletAddresses.some((address: string) => 
    adminWallets.includes(address)
  );

  if (hasAdminWallet) {
    return true;
  }

  // Check for admin role in custom claims (if using Privy's custom claims)
  if (user.customClaims?.role === 'admin') {
    return true;
  }

  // Check email-based admin access (if needed)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.toLowerCase().trim()) || [];
  const userEmail = user.email?.address?.toLowerCase();
  
  if (userEmail && adminEmails.includes(userEmail)) {
    return true;
  }

  return false;
}

/**
 * Validates token and checks admin role in one call
 */
export async function validateAdminToken(token: string) {
  const validation = await validatePrivyToken(token);
  
  if (!validation.isValid) {
    return {
      ...validation,
      isAdmin: false,
    };
  }

  const isAdmin = checkAdminRole(validation.user);
  
  return {
    ...validation,
    isAdmin,
  };
}

/**
 * Middleware helper to extract and validate token from request
 */
export async function getAuthenticatedUser(request: Request) {
  console.log('[DEBUG] Getting authenticated user from request');
  
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  let token: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
    console.log('[DEBUG] Found token in Authorization header');
  }

  // Try to get token from cookies if not in header
  if (!token) {
    const cookies = request.headers.get('cookie');
    console.log('[DEBUG] Cookies:', cookies ? 'present' : 'none');
    if (cookies) {
      const tokenMatch = cookies.match(/privy-token=([^;]+)/);
      token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
      console.log('[DEBUG] Token from cookies:', token ? 'found' : 'not found');
    }
  }

  if (!token) {
    console.log('[DEBUG] No authentication token found');
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      error: 'No authentication token found',
    };
  }

  console.log('[DEBUG] Validating token...');
  const validation = await validateAdminToken(token);
  console.log('[DEBUG] Token validation result:', {
    isValid: validation.isValid,
    isAdmin: validation.isAdmin,
    error: validation.error
  });

  return {
    isAuthenticated: validation.isValid,
    isAdmin: validation.isAdmin,
    user: validation.user,
    error: validation.error,
  };
}
