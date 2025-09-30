import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';

// Environment variables
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const NODE_ENV = process.env.NODE_ENV;

/**
 * Rate limiting store (in-memory for now, use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
};

/**
 * Protected route patterns
 */
const PROTECTED_ROUTES = {
  admin: /^\/admin/,
  api: {
    admin: /^\/api\/admin-api/,  // Changed to avoid conflicts with /admin pages
    protected: /^\/api\/(progress|user)/,
  },
} as const;

/**
 * Public route patterns (bypass authentication)
 */
const PUBLIC_ROUTES = {
  api: /^\/api\/(health|courses$|contact|subscribe)/,
  pages: /^\/($|academy|marketplace|ramps)/,
} as const;

/**
 * Apply rate limiting
 */
function applyRateLimit(request: NextRequest): NextResponse | null {
  const clientId = getClientId(request);
  const now = Date.now();
  const key = `${clientId}:${now}`;
  
  const current = rateLimitStore.get(clientId);
  
  // Clean up expired entries
  if (current && now > current.resetTime) {
    rateLimitStore.delete(clientId);
  }
  
  const existing = rateLimitStore.get(clientId);
  
  if (existing) {
    if (existing.count >= RATE_LIMIT_CONFIG.maxRequests) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((existing.resetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((existing.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': existing.resetTime.toString(),
          },
        }
      );
    }
    
    existing.count += 1;
  } else {
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    });
  }
  
  return null;
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Try to get client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] ?? realIp ?? 'unknown';
  
  // Include user agent for better identification
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  const hash = simpleHash(`${ip}:${userAgent}`);
  
  return hash;
}

/**
 * Simple hash function for rate limiting keys
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validate authentication token and check admin role using Privy server API
 */
async function validateUserAuth(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  error?: string;
}> {
  try {
    const authResult = await getAuthenticatedUser(request);
    return authResult;
  } catch (error) {
    console.error('Authentication validation error:', error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}


/**
 * Create unauthorized response
 */
function createUnauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Unauthorized',
      message,
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer',
      },
    }
  );
}

/**
 * Create forbidden response
 */
function createForbiddenResponse(message = 'Forbidden'): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Forbidden',
      message,
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Log security events
 */
function logSecurityEvent(event: string, request: NextRequest, details?: any) {
  const clientId = getClientId(request);
  const timestamp = new Date().toISOString();
  
  console.warn(`[SECURITY] ${timestamp} - ${event}`, {
    clientId,
    path: request.nextUrl.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
    ...details,
  });
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets and Next.js internal routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Static assets with extensions
  ) {
    return NextResponse.next();
  }
  
  // TEMPORARY: Skip authentication for admin routes during testing
  if (pathname.startsWith('/admin')) {
    console.log(`[DEBUG] Skipping middleware for admin route: ${pathname}`);
    return NextResponse.next();
  }
  
  // Apply rate limiting to all requests
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', request);
    return rateLimitResponse;
  }
  
  // Check if route requires authentication
  const isAdminPage = PROTECTED_ROUTES.admin.test(pathname);
  const isAdminAPI = PROTECTED_ROUTES.api.admin.test(pathname);
  const isProtectedAPI = PROTECTED_ROUTES.api.protected.test(pathname);
  const isPublicAPI = PUBLIC_ROUTES.api.test(pathname);
  const isPublicPage = PUBLIC_ROUTES.pages.test(pathname);
  
  // Allow public routes to pass through
  if (isPublicAPI || isPublicPage) {
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  if (isAdminPage || isAdminAPI || isProtectedAPI) {
    console.log(`[DEBUG] Checking auth for protected route: ${pathname}`);
    console.log(`[DEBUG] isAdminPage: ${isAdminPage}, isAdminAPI: ${isAdminAPI}, isProtectedAPI: ${isProtectedAPI}`);
    
    const authResult = await validateUserAuth(request);
    console.log(`[DEBUG] Auth result:`, {
      isAuthenticated: authResult.isAuthenticated,
      isAdmin: authResult.isAdmin,
      error: authResult.error,
      hasUser: !!authResult.user
    });
    
    if (!authResult.isAuthenticated) {
      logSecurityEvent('AUTHENTICATION_FAILED', request, { error: authResult.error });
      
      if (isAdminPage) {
        console.log(`[DEBUG] Redirecting to login for admin page: ${pathname}`);
        // Redirect to login page for web requests
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      return createUnauthorizedResponse(authResult.error || 'Authentication required');
    }
    
    // Check admin role for admin routes
    if (isAdminPage || isAdminAPI) {
      if (!authResult.isAdmin) {
        console.log(`[DEBUG] User authenticated but not admin. Redirecting to home.`);
        logSecurityEvent('INSUFFICIENT_PERMISSIONS', request, { 
          requiredRole: 'admin',
          userId: authResult.user?.id 
        });
        
        if (isAdminPage) {
          // Redirect to main app
          return NextResponse.redirect(new URL('/', request.url));
        }
        
        return createForbiddenResponse('Admin role required');
      }
    }
    
    console.log(`[DEBUG] Authentication successful, allowing access to: ${pathname}`);
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP header (restrictive for security)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.privy.io https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://i.postimg.cc https://res.cloudinary.com https://images.unsplash.com https://via.placeholder.com",
    "connect-src 'self' https://auth.privy.io https://api.privy.io wss://relay.walletconnect.com",
    "frame-src https://auth.privy.io",
  ].join('; ');
  
  if (NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

/**
 * Configure which routes should run middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/health (health checks)
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. Static files (those with a file extension)
     */
    '/((?!api/health|_next|_static|favicon.ico|.*\\..*).*)',
  ],
};