import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { CONFIG } from "./config/enviroment";

// Supported locales
const LOCALES = ["en", "es"];
const DEFAULT_LOCALE = "es";

// Paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/2fa/verify",
  "/2fa", // Add 2FA setup page
  "/alternative-login", // Add alternative login path
  "/_next",
  "/api/auth",
  "/favicon.ico",
  "/images",
  "/news",
];

// Helper to extract locale from pathname
function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const possibleLocale = segments[1];
  return LOCALES.includes(possibleLocale) ? possibleLocale : DEFAULT_LOCALE;
}

// Helper to check if the path is public
function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(
    (publicPath) =>
      path.includes(publicPath) ||
      path === publicPath
  );
}

// Helper to extract and validate cross-domain auth token
function extractCrossDomainToken(request: NextRequest): { token: string; userUuid: string; isValid: boolean } {
  const authToken = request.nextUrl.searchParams.get('authToken');
  
  if (!authToken) {
    return { token: '', userUuid: '', isValid: false };
  }

  try {
    const decoded = JSON.parse(atob(authToken));
    
    // Check if token is expired
    if (Date.now() > decoded.expiresAt) {
      return { token: '', userUuid: '', isValid: false };
    }

    // Validate source
    if (decoded.source !== 'alternative-login') {
      return { token: '', userUuid: '', isValid: false };
    }

    return {
      token: decoded.token,
      userUuid: decoded.userUuid,
      isValid: true
    };
  } catch (error) {
    return { token: '', userUuid: '', isValid: false };
  }
}

// Helper to set authentication cookies
function setAuthCookies(response: NextResponse, token: string, userUuid: string) {
  const cookieOptions = {
    httpOnly: false, // Allow client-side access for cross-domain
    secure: CONFIG.IS_PRODUCTION,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };

  // Set all required cookies
  response.cookies.set('auth.token', token, cookieOptions);
  response.cookies.set('auth.isAuthenticated', 'true', cookieOptions);
  response.cookies.set('auth.has2faVerified', 'true', cookieOptions);
  
  // Set a temporary marker for cross-domain auth processing
  response.cookies.set('auth.crossDomainToken', JSON.stringify({ 
    token, 
    userUuid,
    timestamp: Date.now() 
  }), {
    ...cookieOptions,
    maxAge: 60 * 5, // 5 minutes only
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Extract locale from the current pathname
  const locale = getLocaleFromPathname(pathname);

  // Handle cross-domain authentication token
  const crossDomainAuth = extractCrossDomainToken(request);
  if (crossDomainAuth.isValid && CONFIG.CROSS_DOMAIN_AUTH_ENABLED) {
    // Create response with redirect to remove token from URL
    const redirectResponse = NextResponse.redirect(
      new URL(`/${locale}/login`, request.url)
    );
    
    // Set authentication cookies
    setAuthCookies(redirectResponse, crossDomainAuth.token, crossDomainAuth.userUuid);
    
    return redirectResponse;
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return response;
  }

  // Check for authentication cookies
  const authTokenCookie = request.cookies.get("auth.token");
  const isAuthenticated = request.cookies.get("auth.isAuthenticated");
  const has2faVerified = request.cookies.get("auth.has2faVerified");
  
  console.log("redirect", authTokenCookie);

  // Handle case where no auth token exists
  if (!authTokenCookie?.value) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let authAtoken;
  try {
    authAtoken = jwtDecode(authTokenCookie.value);
  } catch (error) {
    console.log("Invalid token format");
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if token is expired
  if (authAtoken.exp && authAtoken.exp < Date.now() / 1000) {
    console.log("token expired");
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || isAuthenticated.value !== "true") {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    // Add the current path as a redirect parameter
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated but 2FA not verified, redirect to 2FA setup
  // Skip this check for the 2FA setup page itself
  if (has2faVerified?.value !== "true" && !pathname.includes("/2fa")) {
    const userCookie = request.cookies.get("auth.user")?.value;
    if (userCookie) {
      const user = JSON.parse(userCookie);
      const twoFactorUrl = new URL(`/${locale}/2fa/verify`, request.url);
      twoFactorUrl.searchParams.set("userUuid", user.uuid);
      return NextResponse.redirect(twoFactorUrl);
    }
  }

  // if its investor redirect to my-dividends
  const userCookie = request.cookies.get("auth.user")?.value;
  if (userCookie) {
    const user = JSON.parse(userCookie);

    if (user.role === "INVESTOR" && pathname === `/${locale}`) {
      const investorsHome = new URL(`/${locale}/my-dividends`, request.url);
      investorsHome.searchParams.set("userUuid", user.uuid);
      return NextResponse.redirect(investorsHome);
    }
  }

  return response;
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};