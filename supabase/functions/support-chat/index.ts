import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    if (response.status === 503 && i < maxRetries - 1) {
      console.log(`Gemini 503, retry ${i + 1}/${maxRetries} in ${Math.pow(2, i)}s...`);
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      continue;
    }
    return response;
  }
  throw new Error("Max retries exceeded");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

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

    const response = await fetchWithRetry(GEMINI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
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
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gemini error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
