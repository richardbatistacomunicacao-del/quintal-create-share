import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "✅ Conta criada!", description: "Verifique seu email para confirmar." });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Erro na autenticação", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: "Erro", description: "Falha ao conectar com Google", variant: "destructive" });
      }
      if (result.redirected) return;
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Erro", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-700 rounded-xl flex items-center justify-center text-xl">
            🌿
          </div>
          <span className="font-heading font-black text-2xl tracking-tight">
            Quintal<span className="text-primary">Posts</span>
          </span>
        </div>

        <div className="bg-surface-1 border border-border rounded-2xl p-6">
          <h2 className="font-heading font-black text-lg mb-1 text-center">
            {isLogin ? "Entrar" : "Criar conta"}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isLogin ? "Acesse o melhor gerador de conteúdo com IA" : "Comece a criar conteúdo incrível"}
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground font-heading font-bold text-sm cursor-pointer transition-colors hover:bg-surface-3 disabled:opacity-50 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Conectando..." : "Continuar com Google"}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-dim font-heading font-bold uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-surface-2 border border-border rounded-xl text-foreground text-sm px-3 py-2.5 outline-none focus:border-primary/40 placeholder:text-dim"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mín. 6 caracteres)"
              required
              minLength={6}
              className="w-full bg-surface-2 border border-border rounded-xl text-foreground text-sm px-3 py-2.5 outline-none focus:border-primary/40 placeholder:text-dim"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl border-none bg-primary text-primary-foreground font-heading font-extrabold text-sm cursor-pointer transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold cursor-pointer bg-transparent border-none hover:underline">
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-dim mt-4">
          Powered by QuintalPosts IA ✨
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
