"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface GoogleLoginButtonProps {
  isLandingPage?: boolean;
  externalLoading?: boolean;
  setExternalError?: (error: string | null) => void;
  setExternalLoading?: (loading: boolean) => void;
}

export function GoogleLoginButton({ 
  isLandingPage = false,
  externalLoading,
  setExternalError,
  setExternalLoading 
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const loading = externalLoading ?? internalLoading;
  const error = internalError; // We will show internal errors locally but also send to parent if asked

  const setLoading = (val: boolean) => {
    setInternalLoading(val);
    if (setExternalLoading) setExternalLoading(val);
  };

  const setError = (val: string | null) => {
    setInternalError(val);
    if (setExternalError) setExternalError(val);
  };

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    try {
      // 1. Obter URL de consentimento do Google
      const authResponse = await fetch("/api/auth/google", {
        method: "GET",
      });

      if (!authResponse.ok) {
        throw new Error("Falha ao iniciar autenticação Google");
      }

      const { authUrl } = await authResponse.json();

      // 2. Redirecionar para Google OAuth
      // (Em produção, usar popup seguro ou redirecionamento direto)
      window.location.href = authUrl;
    } catch (err: any) {
      console.error("Erro no login Google:", err);
      setError(
        err.message || "Falha na autenticação com Google. Tente novamente."
      );
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white/80" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest text-white">
              {isLandingPage ? "Entrar com o Google" : "Logar com o Google"}
            </span>
          </>
        )}
      </button>

      {error && !setExternalError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3 mt-4"
        >
          <p className="text-xs font-bold text-red-400 leading-snug">{error}</p>
        </motion.div>
      )}
    </>
  );
}
