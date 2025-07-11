"use client";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import useTranslation from "@/src/hooks/useTranslation";
export default function NotFound() {
  const { t } = useTranslation();
  const { getCurrentLanguage } = useTranslation();

  const language = getCurrentLanguage();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-7xl font-bold text-[#1C1E2E]">404</h1>
        <h2 className="mb-8 text-2xl text-neutral-700">
          {t("common.not_found_title")}
        </h2>
        <p className="mb-8 text-neutral-600 max-w-sm mx-auto">
          {t("common.not_found_description")} 
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={`/${language}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              border border-neutral-200 bg-white
              text-neutral-700 hover:text-[#4169B9] 
              hover:border-[#4169B9]/30 hover:bg-[#4169B9]/5
              transition-all duration-200 ease-in-out"
          >
            <Home className="w-4 h-4" />
            {t("common.home")}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer
              border border-neutral-200 bg-white
              text-neutral-700 hover:text-[#4169B9]
              hover:border-[#4169B9]/30 hover:bg-[#4169B9]/5
              transition-all duration-200 ease-in-out"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </button>
        </div>
      </div>
    </main>
  );
}
