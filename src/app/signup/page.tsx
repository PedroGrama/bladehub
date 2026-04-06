"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scissors, Mail, Lock, User, Store, ChevronRight, Loader2, ArrowLeft, Zap, Check, Eye, EyeOff } from "lucide-react";
import { registerUser } from "./actions";
import { useToast } from "@/components/ToastProvider";
import { validarEmail, validarTelefone, formatarTelefone } from "@/lib/validations";

function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"type" | "details">("type");
  const [isAdmin, setIsAdmin] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    tenantName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => validarEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.email) newErrors.email = "Email é obrigatório";
    else if (!validateEmail(formData.email)) newErrors.email = "Email inválido";
    if (!formData.password) newErrors.password = "Senha é obrigatória";
    else if (formData.password.length < 6) newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Senhas não conferem";
    if (isAdmin && !formData.tenantName) newErrors.tenantName = "Nome do estabelecimento é obrigatório";

    if (!termsAccepted) {
      newErrors.terms = "É necessário aceitar os termos para continuar";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        tenantName: isAdmin ? formData.tenantName : undefined,
        isAdmin,
      });

      if (result.error) {
        toast(result.error, "error");
        return;
      }

      toast("Cadastro realizado com sucesso!", "success");
      router.replace(result.redirectUrl || "/tenant");
      router.refresh();
    } catch (err) {
      toast("Erro ao registrar. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950 font-sans selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 flex flex-col items-center"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <div className="relative">
                <Scissors className="w-6 h-6 text-white" />
                <Zap className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">BladeHub</span>
          </Link>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Crie sua conta</h2>
            <p className="text-sm text-zinc-500 font-medium tracking-tight">Comece a gerenciar sua agenda agora</p>
          </div>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-3xl overflow-hidden relative"
        >
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

          {step === "type" ? (
            // Step 1: Type Selection
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white text-center">Qual é seu perfil?</h3>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsAdmin(true);
                    setStep("details");
                  }}
                  className="w-full p-4 rounded-2xl border-2 border-zinc-700 hover:border-green-500 hover:bg-green-500/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center group-hover:bg-green-600/40 transition-colors">
                      <Store className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">Sou Dono de Estabelecimento</p>
                      <p className="text-xs text-zinc-400">Cadastro reservado para o responsável</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-green-400 transition-colors" />
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-zinc-500 text-center">
                  Já tem conta?{" "}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold">
                    Faça login
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            // Step 2: Details Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 2) router.back();
                  else router.replace("/");
                }}
                className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-3 h-3" />
                Voltar
              </button>

              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                    Nome do Estabelecimento
                  </label>
                  <div className="relative group">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Minha Barbearia"
                      value={formData.tenantName}
                      onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  {errors.tenantName && <p className="text-xs text-red-400 ml-1">{errors.tenantName}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                  Nome Completo
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="João Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-400 ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                  E-mail
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                  Confirmar Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400 ml-1">{errors.confirmPassword}</p>}
              </div>

              <div className="bg-zinc-900/80 border border-zinc-700 p-4 rounded-xl space-y-2">
                <details className="text-xs text-zinc-100">
                  <summary className="cursor-pointer font-bold">Termos de uso e política de privacidade</summary>
                  <div className="mt-2 text-zinc-300 text-[12px] leading-relaxed max-h-40 overflow-auto">
                    <p>Ao utilizar o BladeHub, você concorda em gerenciar as informações do seu estabelecimento com responsabilidade e a cumprir as regras de uso.</p>
                    <p>Seus dados serão utilizados para agendamento, cobrança e envio de notificações.</p>
                    <p>Para mais detalhes, consulte a política completa disponível em seu painel.</p>
                  </div>
                </details>
                <label className="inline-flex items-center gap-2 text-xs text-zinc-100">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-zinc-600 bg-zinc-800"
                  />
                  Eu li e aceito os termos de uso e privacidade
                </label>
                {errors.terms && <p className="text-xs text-red-400 ml-1">{errors.terms}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-600/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Criar Conta
                  </>
                )}
              </button>

              <p className="text-xs text-zinc-500 text-center">
                Já tem conta?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold">
                  Faça login
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SignupForm />
    </Suspense>
  );
}
