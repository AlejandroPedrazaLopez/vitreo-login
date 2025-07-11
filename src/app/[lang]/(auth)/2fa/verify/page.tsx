"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/tremmor/Button";
import { Input } from "@/src/components/ui/tremmor/Input";
import { Card } from "@/src/components/ui/tremmor/Card";
import { TwoFactorService } from "@/src/services/auth/2fa.service";
import { toast } from "react-toastify";
import { useAuthStore } from "@/src/stores/auth.store";
import { useTranslation } from "@/src/hooks/useTranslation";

export default function MFAVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const { set2faVerified } = useAuthStore();
  const { t, getCurrentLanguage } = useTranslation();
  const lang = getCurrentLanguage();
  const { user } = useAuthStore();

  const userUuid = searchParams.get("userUuid");
  const redirectUrl = searchParams.get("redirectUrl");

  if (!userUuid) {
    router.push(`/${lang}/login`);
    return null;
  }

  const handleSuccessfulLogin = (token: string, backendRedirectUrl?: string) => {
    // Store the token and set 2FA as verified
    localStorage.setItem("token", token);
    set2faVerified(true);

    // Determine redirect URL priority: Backend > URL param > Default
    let finalRedirectUrl = backendRedirectUrl;
    
    if (!finalRedirectUrl && redirectUrl) {
      finalRedirectUrl = decodeURIComponent(redirectUrl);
    }
    
    if (!finalRedirectUrl) {
      // Default logic based on user role
      if (user?.role === "INVESTOR") {
        finalRedirectUrl = `/${lang}/my-dividends`;
      } else {
        finalRedirectUrl = `/${lang}/dashboard`;
      }
    }

    // Check if this is a cross-domain redirect
    if (finalRedirectUrl.startsWith('http://') || finalRedirectUrl.startsWith('https://')) {
      // For cross-domain redirects, ensure we're using the cross-domain auth page
      if (finalRedirectUrl.includes('/dashboard')) {
        finalRedirectUrl = finalRedirectUrl.replace('/dashboard', '/auth/cross-domain');
      }
      window.location.href = finalRedirectUrl;
    } else {
      router.push(finalRedirectUrl);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await TwoFactorService.verifyLogin(
        userUuid, 
        code, 
        redirectUrl || undefined
      );
      
      handleSuccessfulLogin(data.token, data.redirectUrl);
    } catch (error) {
      toast.error(t("twoFA.verify.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const useRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await TwoFactorService.useRecoveryCode(
        userUuid,
        recoveryCode,
        redirectUrl || undefined
      );
      
      handleSuccessfulLogin(data.token, data.redirectUrl);
    } catch (error) {
      toast.error(t("twoFA.recovery.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2e2D2c] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="">
            <img
              src="https://puy-images.s3.us-east-1.amazonaws.com/logo-vitreo.png"
              alt="Vitreo Logo"
              className="object-contain w-48"
            />
          </div>
        </div>

        <Card className="bg-[#d4d4d4] dark:bg-[#0F1629] shadow-xl">
          <div className="p-8">
            {!showRecovery ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {t("twoFA.verify.title")}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t("twoFA.verify.description")}
                  </p>
                </div>

                <form onSubmit={verifyCode} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex flex-col items-center">
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        required
                        maxLength={6}
                        className="text-center text-2xl tracking-[0.5em] font-mono"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          if (value.length <= 6) {
                            setCode(value);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full bg-[#f1a644] hover:bg-[#ffde7d] disabled:bg-[#fdbd00]"
                    isLoading={isLoading}
                    loadingText="Verificando..."
                  >
                    {t("twoFA.verify.verify")}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-[#f1a644] hover:text-[#ffde7d] disabled:text-[#fdbd00]"
                      onClick={() => setShowRecovery(true)}
                    >
                      {t("twoFA.verify.recovery")}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {t("twoFA.recovery.title")}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t("twoFA.recovery.description")}
                  </p>
                </div>

                <form onSubmit={useRecovery} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex flex-col items-center">
                      <Input
                        id="recoveryCode"
                        name="recoveryCode"
                        type="text"
                        required
                        className="text-center font-mono text-[#f1a644] hover:text-[#ffde7d] disabled:text-[#fdbd00]"
                        placeholder="Código de recuperación"
                        value={recoveryCode}
                        onChange={(e) =>
                          setRecoveryCode(e.target.value.toUpperCase())
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full bg-[#f1a644] hover:bg-[#ffde7d] disabled:bg-[#fdbd00]"
                    isLoading={isLoading}
                    loadingText="Verificando..."
                  >
                    {t("twoFA.recovery.continue")}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-[#f1a644] hover:text-[#ffde7d] disabled:text-[#fdbd00]"
                      onClick={() => setShowRecovery(false)}
                    >
                      {t("twoFA.verify.back")}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}