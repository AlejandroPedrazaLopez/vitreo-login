"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/tremmor/Button";
import { Input } from "@/src/components/ui/tremmor/Input";
import { Card } from "@/src/components/ui/tremmor/Card";
import { TwoFactorService } from "@/src/services/auth/2fa.service";
import { toast } from "react-toastify";
import { useTranslation } from "@/src/hooks/useTranslation";
import { CONFIG, getCurrentDomainName, getDashboardUrl } from "@/src/config/enviroment";

export default function MFASetupPage() {
  const router = useRouter();
  const { t, getCurrentLanguage } = useTranslation();
  const lang = getCurrentLanguage();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [step, setStep] = useState<"setup" | "verify" | "recovery">("setup");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const setup2FA = async () => {
    try {
      setIsLoading(true);
      const data = await TwoFactorService.setup();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("verify");
    } catch (error) {
      toast.error("No se pudo configurar la autenticación de dos factores");
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await TwoFactorService.verify(code);
      if (data.recoveryCodes) {
        setRecoveryCodes(data.recoveryCodes);
        setStep("recovery");
      }
      toast.success("La autenticación de dos factores ha sido configurada");
    } catch (error) {
      toast.error("Código inválido. Por favor, inténtalo de nuevo");
    } finally {
      setIsLoading(false);
    }
  };

  const finishSetup = () => {
    // Check if cross-domain auth is enabled
    if (CONFIG.CROSS_DOMAIN_AUTH_ENABLED) {
      // Redirect to main domain after 2FA setup
      const dashboardUrl = getDashboardUrl(lang);
      toast.success(`Redirigiendo a ${CONFIG.MAIN_DOMAIN}...`);
      
      setTimeout(() => {
        window.location.href = dashboardUrl;
      }, 2000);
    } else {
      // Local redirect for single-domain setup
      router.push(`/${lang}/login`);
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
            {step === "setup" ? (
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
                  Configurar autenticación de dos factores
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  La autenticación de dos factores agrega una capa adicional de seguridad a tu cuenta
                </p>
                <Button
                  onClick={setup2FA}
                  variant="primary"
                  className="w-full bg-[#f1a644] hover:bg-[#ffde7d] disabled:bg-[#fdbd00]"
                  isLoading={isLoading}
                  loadingText="Configurando..."
                >
                  Comenzar configuración
                </Button>
              </div>
            ) : step === "verify" ? (
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    Escanea el código QR
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Usa Google Authenticator o cualquier otra aplicación compatible
                  </p>
                </div>

                {qrCode && (
                  <div className="flex justify-center mb-6">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}

                {secret && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
                      O ingresa este código manualmente:
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-center font-mono text-sm">
                      {secret}
                    </div>
                  </div>
                )}

                <form onSubmit={verify2FA} className="space-y-6">
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Ingresa el código de 6 dígitos de tu aplicación
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                    loadingText="Verificando..."
                  >
                    Verificar y activar
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  Códigos de recuperación
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu dispositivo.
                  <br />
                  <strong className="text-red-500 dark:text-red-400">
                    ¡Estos códigos solo se mostrarán una vez!
                  </strong>
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={finishSetup}
                  variant="primary"
                  className="w-full bg-[#f1a644] hover:bg-[#ffde7d] disabled:bg-[#fdbd00]"
                >
                  {CONFIG.CROSS_DOMAIN_AUTH_ENABLED ? "Continuar a dashboard principal" : "Continuar al dashboard"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}