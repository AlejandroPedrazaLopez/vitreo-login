"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/src/components/ui/tremmor/Button";
import { Input } from "@/src/components/ui/tremmor/Input";
import { Card } from "@/src/components/ui/tremmor/Card";
import { useTranslation } from "@/src/hooks/useTranslation";
import { TwoFactorService } from "@/src/services/auth/2fa.service";
import { useAuthStore } from "@/src/stores/auth.store";
import { CONFIG, getCurrentDomainName, getDashboardUrl } from "@/src/config/enviroment";
// Define the login form schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede tener más de 50 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export default function AlternativeLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [persist, setPersist] = useState(true);
  const { t, getCurrentLanguage } = useTranslation();
  const lang = getCurrentLanguage();
  const { setUser, set2faVerified } = useAuthStore();

  const validateField = (field: keyof LoginFormData, value: string) => {
    try {
      loginSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors[0].message,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsLoading(true);
      
      // Validate all form data
      const validatedData = loginSchema.parse(formData);

      // Use the new alternative login endpoint with environment-based URL
      const redirectUrl = `${CONFIG.MAIN_DOMAIN}/${lang}/auth/cross-domain`;
      
      const response = await TwoFactorService.alternativeLogin(
        validatedData.email,
        validatedData.password,
        redirectUrl
      );

      // Set user data in store
      setUser(response.user);

      if (response.is2faEnabled) {
        // For 2FA users, redirect to 2FA verification first
        router.push(
          `/${lang}/2fa/verify?userUuid=${response.user.uuid}&redirectUrl=${encodeURIComponent(response.redirectUrl || getDashboardUrl(lang))}`
        );
      } else {
        
        // Redirect to external domain with token
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        } else {
          // Fallback redirect
          window.location.href = getDashboardUrl(lang);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Handle API errors
        console.error("Alternative login failed:", error);
        setErrors({ form: "Login failed. Please check your credentials." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#2e2D2c] min-h-dvh">
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
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
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  {t("auth.welcome")}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t("auth.enter_credentials")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {errors.form && (
                  <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded-md">
                    {errors.form}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder={t("auth.email")}
                      value={formData.email}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({ ...prev, email: value }));
                        validateField("email", value);
                      }}
                      hasError={!!errors.email}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder={t("auth.password")}
                      value={formData.password}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({ ...prev, password: value }));
                        validateField("password", value);
                      }}
                      hasError={!!errors.password}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#f1a644] hover:text-[#fdbd00]"
                      checked={persist}
                      onChange={(e) => setPersist(e.target.checked)}
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      {t("auth.remember_me")}
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#f1a644] hover:text-[#fdbd00]"
                  >
                    {t("auth.forgot_password")}
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-[#f1a644] hover:bg-[#fdbd00]"
                  isLoading={isLoading}
                  loadingText={t("auth.sign_in_loading")}
                >
                  {t("auth.sign_in")}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}