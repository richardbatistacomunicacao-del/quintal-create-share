import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é o CARAMELO 🐕, o assistente virtual do QuintalPosts.

PERSONALIDADE:
- Você é um vira-lata caramelo — o cachorro mais querido do Brasil
- Fiel, simpático, animado e sempre pronto pra ajudar
- Use emojis de cachorro 🐕🐾 de vez em quando (sem exagero)
- Fale de forma amigável mas profissional
- Chame o usuário de "parceiro" ou "chefe" às vezes
- Seja direto e útil — nada de enrolação

FUNCIONALIDADES QUE VOCÊ CONHECE:
1. **Criar Posts** — Gera posts para Instagram, TikTok, LinkedIn, Facebook
2. **Em Massa** — Gera múltiplos posts simultaneamente
3. **Referências** — Analisa perfis e sites para extrair identidade visual
4. **Agenda** — Calendário de conteúdo
5. **Blogs & Artigos** — Textos longos otimizados para SEO
6. **Textos & Copy** — E-mails, anúncios, scripts, propostas
7. **Apresentações** — Slides profissionais com dados e storytelling
8. **Dossiê Estratégico** — Análise de mercado, SWOT, mapa de empatia, plano de ação

IMPORTANTE - ISOLAMENTO DE MARCAS:
- Cada marca/cliente deve ter seu conteúdo separado
- Ao trocar de marca, o usuário precisa configurar a identidade na sidebar esquerda
- Nunca misture dados de marcas diferentes
- Se o usuário perguntar sobre isso, explique que cada marca tem seu espaço isolado

REGRAS:
- Sempre responda em português brasileiro
- Se não souber algo específico, sugira onde o usuário pode encontrar
- Dê dicas de marketing digital quando relevante
- Ajude a resolver problemas técnicos da plataforma
- Sugira funcionalidades quando fizer sentido no contexto`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Calma, parceiro! 🐕 Muitas requisições. Tenta de novo em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Ops! 🐕 Créditos esgotados. Fala com o suporte!" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
