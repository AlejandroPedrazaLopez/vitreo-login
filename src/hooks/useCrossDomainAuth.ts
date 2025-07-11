// hooks/useCrossDomainAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/auth.store';
import { CONFIG } from '../config/enviroment';

interface CrossDomainAuthData {
  token: string;
  userUuid: string;
  expiresAt: number;
  source: string;
}

export const useCrossDomainAuth = () => {
  const router = useRouter();
  const { setUser, set2faVerified } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const extractAuthToken = (): CrossDomainAuthData | null => {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('authToken');
    
    if (!authToken) return null;

    try {
      const decoded = JSON.parse(atob(authToken));
      
      // Check if token is expired
      if (Date.now() > decoded.expiresAt) {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Error decoding auth token:', error);
      return null;
    }
  };

  const processAuthToken = async (authData: CrossDomainAuthData) => {
    setIsProcessing(true);
    
    try {
      // Store the token
      localStorage.setItem('token', authData.token);
      
      // Set authentication state
      set2faVerified(true);
      
      // You might want to fetch user data here using the token
      // const userData = await fetchUserData(authData.token);
      // setUser(userData);
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('authToken');
      window.history.replaceState({}, document.title, url.toString());
      
      return true;
    } catch (error) {
      console.error('Error processing auth token:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const authData = extractAuthToken();
    
    if (authData && CONFIG.CROSS_DOMAIN_AUTH_ENABLED) {
      processAuthToken(authData);
    }
  }, []);

  return {
    isProcessing,
    extractAuthToken,
    processAuthToken
  };
};