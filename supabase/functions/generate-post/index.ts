import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, format, network, quantity, brandContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const formatMap: Record<string, string> = {
      "4:5": "Feed vertical 4:5 (1080x1350px)",
      "1:1": "Quadrado 1:1 (1080x1080px)",
      "story": "Story 9:16 (1080x1920px)",
      "carousel": "Carrossel (múltiplos slides)",
    };

    const networkMap: Record<string, string> = {
      "IG": "Instagram",
      "TK": "TikTok",
      "LI": "LinkedIn",
      "FB": "Facebook",
    };

    const qty = parseInt(quantity) || 1;
    const formatDesc = formatMap[format] || format;
    const networkDesc = networkMap[network] || network;

    let brandInfo = "";
    if (brandContext) {
      const { name, sector, tone, font, colors } = brandContext;
      brandInfo = `
CONTEXTO DA MARCA:
- Nome: ${name || "Não definido"}
- Setor: ${sector || "Não definido"}
- Tom de voz: ${tone || "Profissional"}
- Fonte preferida: ${font || "Inter"}
- Cores da marca: ${colors?.join(", ") || "Verde, preto, branco"}`;
    }

    const systemPrompt = `Você é o melhor especialista em marketing digital e criação de conteúdo para redes sociais do mundo. Você cria posts virais, engajadores e profissionais.

REGRAS:
- Sempre responda em português brasileiro
- Crie conteúdo original, criativo e que gere engajamento
- Use emojis de forma estratégica
- Adapte o tom e estilo para a rede social especificada
- Para carrossel, crie conteúdo slide por slide
- Inclua CTAs (chamadas para ação) poderosas
- Use técnicas de copywriting (AIDA, PAS, storytelling)
${brandInfo}

FORMATO DE RESPOSTA (JSON):
Retorne um array JSON com ${qty} post(s). Cada post deve ter:
{
  "posts": [
    {
      "title": "título curto do post",
      "caption": "legenda completa com emojis e formatação",
      "hashtags": "#hashtag1 #hashtag2 ...",
      "slides": ["texto do slide 1", "texto do slide 2"] (apenas para carrossel),
      "hook": "gancho de abertura impactante",
      "cta": "chamada para ação",
      "bgColor": "cor hex sugerida para o fundo",
      "textColor": "cor hex sugerida para o texto",
      "type": "${format}"
    }
  ]
}`;

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
          { role: "user", content: `Crie ${qty} post(s) para ${networkDesc} no formato ${formatDesc}. Tema: ${prompt}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_posts",
              description: "Gera posts para redes sociais",
              parameters: {
                type: "object",
                properties: {
                  posts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        caption: { type: "string" },
                        hashtags: { type: "string" },
                        slides: { type: "array", items: { type: "string" } },
                        hook: { type: "string" },
                        cta: { type: "string" },
                        bgColor: { type: "string" },
                        textColor: { type: "string" },
                        type: { type: "string" },
                      },
                      required: ["title", "caption", "hashtags", "hook", "cta", "bgColor", "textColor", "type"],
                    },
                  },
                },
                required: ["posts"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_posts" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Erro na geração de IA");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let posts;
    if (toolCall?.function?.arguments) {
      posts = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse content as JSON
      const content = data.choices?.[0]?.message?.content || "{}";
      posts = JSON.parse(content);
    }

    return new Response(JSON.stringify(posts), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
