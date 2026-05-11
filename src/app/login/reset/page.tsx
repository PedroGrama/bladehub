"use client";
import { useState } from "react";
import { resetPassword } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string, error?: string } }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  if (!searchParams.token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">Link inválido ou expirado.</div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await resetPassword(formData);
      router.push("/login?reset=success");
    } catch (e: any) {
      router.push(`/login/reset?token=${searchParams.token}&error=${encodeURIComponent(e.message)}`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Criar Nova Senha</h1>
        
        {searchParams.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {searchParams.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="token" value={searchParams.token} />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium mb-1">Nova Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                required 
                minLength={6}
                className="w-full rounded-xl border px-3 py-2 pr-10 text-sm dark:bg-zinc-950 dark:border-zinc-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-500"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                required 
                minLength={6}
                className="w-full rounded-xl border px-3 py-2 pr-10 text-sm dark:bg-zinc-950 dark:border-zinc-800"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-500"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Salvar Senha
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              if (window.history.length > 2) router.back();
              else router.push("/login");
            }}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}
