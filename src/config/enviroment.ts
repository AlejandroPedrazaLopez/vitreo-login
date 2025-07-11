// config/environment.ts
export const CONFIG = {
  // Main domain configuration
  MAIN_DOMAIN: process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://puygroup.com',
  CURRENT_DOMAIN: process.env.NEXT_PUBLIC_CURRENT_DOMAIN || 'https://example.com',
  
  // API configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.puygroup.com',
  
  // Allowed domains for cross-domain auth
  ALLOWED_DOMAINS: [
    process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://puygroup.com',
    process.env.NEXT_PUBLIC_CURRENT_DOMAIN || 'https://example.com',
    'https://www.puygroup.com',
    'https://www.example.com',
    // Development domains
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  
  // Environment detection
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Cross-domain authentication
  CROSS_DOMAIN_AUTH_ENABLED: process.env.NEXT_PUBLIC_CROSS_DOMAIN_AUTH === 'true',
};

// Helper functions
export const getDashboardUrl = (locale: string = 'es') => {
  return `${CONFIG.MAIN_DOMAIN}/${locale}/login`;
};

export const getLoginSuccessUrl = (locale: string = 'es', from?: string) => {
  const params = new URLSearchParams();
  params.set('loginSuccess', 'true');
  if (from) params.set('from', from);
  
  return `${CONFIG.MAIN_DOMAIN}/${locale}/login?${params.toString()}`;
};

export const getCurrentDomainName = () => {
  try {
    return new URL(CONFIG.CURRENT_DOMAIN).hostname;
  } catch {
    return 'example.com';
  }
};