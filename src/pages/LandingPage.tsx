import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Check, Sparkles, Zap, Crown, Leaf } from "lucide-react";
import logoLight from "@/assets/logo-light.png";

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    icon: Leaf,
    color: "text-muted-foreground",
    borderClass: "border-border",
    features: [
      "3 análises de perfil/mês",
      "5 posts gerados/mês",
      "3 legendas com IA/mês",
      "Marca única",
      "Exportação básica",
    ],
    cta: "Começar grátis",
    popular: false,
  },
  {
    name: "Basic",
    price: "R$ 100",
    period: "/mês",
    icon: Zap,
    color: "text-blue",
    borderClass: "border-[hsl(var(--blue))]",
    features: [
      "30 análises de perfil/mês",
      "100 posts gerados/mês",
      "50 legendas com IA/mês",
      "Até 5 marcas",
      "Geração de imagens com IA",
      "Download de análises",
      "Suporte prioritário",
    ],
    cta: "Assinar Basic",
    popular: true,
  },
  {
    name: "Premium",
    price: "R$ 250",
    period: "/mês",
    icon: Crown,
    color: "text-[hsl(var(--amber))]",
    borderClass: "border-[hsl(var(--amber))]",
    features: [
      "Análises ilimitadas",
      "Posts ilimitados",
      "Legendas ilimitadas",
      "Marcas ilimitadas",
      "Geração de imagens com IA",
      "Download de análises",
      "Suporte VIP 24h",
      "Acesso antecipado a novidades",
    ],
    cta: "Assinar Premium",
    popular: false,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCta = () => {
    navigate(user ? "/app" : "/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <img src={logoLight} alt="Quintal de Negócios" className="h-10" />
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate("/app")} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm hover:bg-primary/90 transition-colors">
                Abrir Editor
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/auth")} className="px-4 py-2 rounded-xl text-sm font-heading font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Entrar
                </button>
                <button onClick={() => navigate("/auth")} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm hover:bg-primary/90 transition-colors">
                  Criar conta
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-heading font-bold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Gerador de conteúdo com IA
          </div>
          <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
            Crie posts incríveis
            <br />
            <span className="text-primary">em segundos</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Análise de perfil, geração de posts, legendas, hashtags e imagens com inteligência artificial. 
            Tudo o que você precisa para suas redes sociais em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleCta} className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-heading font-extrabold text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              Começar agora — é grátis
            </button>
          </div>
        </div>
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-center mb-12">
            Tudo que você precisa para criar conteúdo
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Scanner de Perfil", desc: "Analise qualquer perfil do Instagram com IA: SWOT, mapa de empatia e storytelling." },
              { title: "Geração de Posts", desc: "Crie carrosséis, reels e posts únicos com textos, hashtags e CTAs otimizados." },
              { title: "Legendas com IA", desc: "Gere legendas engajadoras alinhadas ao tom da sua marca automaticamente." },
              { title: "Imagens com IA", desc: "Gere imagens exclusivas para seus posts usando inteligência artificial." },
              { title: "Multi-marca", desc: "Gerencie múltiplas marcas com identidades visuais e tons de voz diferentes." },
              { title: "Download de Análises", desc: "Exporte suas análises estratégicas completas para compartilhar com a equipe." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface-1 border border-border hover:border-primary/20 transition-colors">
                <h3 className="font-heading font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border" id="planos">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-center mb-4">
            Planos & Preços
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Escolha o plano ideal para o seu negócio. O que muda é o volume de análises e consultas.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col p-6 rounded-2xl bg-surface-1 border-2 ${plan.popular ? plan.borderClass : "border-border"} transition-all hover:scale-[1.02]`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[hsl(var(--blue))] text-primary-foreground text-[10px] font-heading font-bold uppercase tracking-wider">
                    Mais popular
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <plan.icon className={`w-5 h-5 ${plan.color}`} />
                  <span className="font-heading font-bold text-base">{plan.name}</span>
                </div>
                <div className="mb-6">
                  <span className="font-heading font-black text-3xl">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleCta}
                  className={`w-full py-2.5 rounded-xl font-heading font-bold text-sm transition-colors ${
                    plan.popular
                      ? "bg-[hsl(var(--blue))] text-primary-foreground hover:opacity-90"
                      : "bg-surface-3 text-foreground hover:bg-surface-4"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quintal Client Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[hsl(142,40%,12%)] to-[hsl(142,30%,8%)] border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="relative">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-heading font-bold mb-4">
                🌳 Exclusivo
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl mb-3">
                Cliente Quintal de Negócios?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
                Clientes do Quintal de Negócios têm <strong className="text-primary">acesso livre e ilimitado</strong> a todas 
                as funcionalidades da plataforma, sem custo adicional. É o plano Premium incluso na sua assinatura.
              </p>
              <button
                onClick={handleCta}
                className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-heading font-extrabold text-sm hover:bg-primary/90 transition-colors"
              >
                Acessar como cliente Quintal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoLight} alt="Quintal de Negócios" className="h-8 opacity-60" />
          <p className="text-xs text-dim">
            © {new Date().getFullYear()} Quintal de Negócios. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
