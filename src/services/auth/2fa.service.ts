import { apiClient } from "../apiClient";

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  recoveryCodes?: string[];
}

export interface TwoFactorLoginResponse {
  user: {
    uuid: string;
    email: string;
    name: string;
    role?: string;
    // Add other user fields as needed
  };
  token: string;
  redirectUrl?: string;
}

export interface AlternativeLoginResponse {
  user: {
    uuid: string;
    email: string;
    name: string;
    role?: string;
  };
  token?: string;
  is2faEnabled: boolean;
  source: string;
  redirectUrl?: string;
}

export class TwoFactorService {
  static async setup(): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.post("/auth/2fa/setup");
    return response.data.data;
  }

  static async verify(token: string): Promise<TwoFactorVerifyResponse> {
    const response = await apiClient.post("/auth/2fa/verify", { token });
    return response.data.data;
  }

  static async verifyLogin(
    userUuid: string, 
    token: string, 
    redirectUrl?: string
  ): Promise<TwoFactorLoginResponse> {
    const response = await apiClient.post("/auth/2fa/login", { 
      userUuid, 
      token,
      redirectUrl 
    });
    return response.data.data;
  }

  static async useRecoveryCode(
    userUuid: string, 
    recoveryCode: string,
    redirectUrl?: string
  ): Promise<TwoFactorLoginResponse> {
    const response = await apiClient.post("/auth/2fa/recovery", { 
      userUuid, 
      recoveryCode,
      redirectUrl 
    });
    return response.data.data;
  }

  // New method for alternative login
  static async alternativeLogin(
    email: string,
    password: string,
    redirectUrl?: string
  ): Promise<AlternativeLoginResponse> {
    // Validate redirect URL format if provided
    if (redirectUrl) {
      try {
        new URL(redirectUrl);
      } catch (error) {
        throw new Error("Invalid redirect URL format");
      }
    }
    const response = await apiClient.post("/auth/alternative-login", {
      email,
      password,
      redirectUrl
    });
    return response.data;
  }
}