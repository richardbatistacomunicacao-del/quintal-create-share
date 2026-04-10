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
    const { url } = await req.json();
    if (!url) throw new Error("URL é obrigatória");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemPrompt = `Você é o maior especialista do mundo em análise de marcas, branding e estratégia de conteúdo digital.

Analise a URL/perfil fornecido e extraia a identidade visual COMPLETA e estratégias avançadas.

IMPORTANTE: Use seu conhecimento profundo para:
1. Se for um @ de Instagram/TikTok, analise com base no que você sabe sobre esse perfil
2. Se for um site, analise com base no domínio e contexto
3. Extraia TUDO: cores, fontes, temas, assuntos, tom de voz
4. Crie análise SWOT completa do posicionamento digital
5. Crie mapa de empatia do público-alvo
6. Crie framework de storytelling da marca

Seja EXTREMAMENTE detalhado e preciso. Use dados realistas e úteis.
RESPONDA USANDO A FUNÇÃO FORNECIDA.`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analise PROFUNDAMENTE este perfil/site e extraia identidade visual completa, SWOT, mapa de empatia e storytelling: ${url}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_brand",
              description: "Retorna análise completa e profunda de uma marca/perfil",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Nome da marca/perfil" },
                  description: { type: "string", description: "Descrição detalhada do negócio" },
                  sector: { type: "string", description: "Setor/nicho de atuação" },
                  tone: { type: "string", description: "Tom de voz predominante" },
                  colors: { type: "array", items: { type: "string" }, description: "Cores hex da marca (mínimo 5)" },
                  fonts: { type: "array", items: { type: "string" }, description: "Fontes usadas ou sugeridas para a marca" },
                  themes: { type: "array", items: { type: "string" }, description: "Temas principais do conteúdo (mínimo 5)" },
                  topics: { type: "array", items: { type: "string" }, description: "Assuntos/tópicos frequentes (mínimo 8)" },
                  tags: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        category: { type: "string", enum: ["green", "amber", "blue", "purple"] },
                      },
                      required: ["label", "category"],
                    },
                    description: "Tags descritivas da marca",
                  },
                  postSuggestions: { type: "array", items: { type: "string" }, description: "10 sugestões detalhadas de posts" },
                  audienceInsights: { type: "string", description: "Insights profundos sobre o público-alvo" },
                  contentStrategy: { type: "string", description: "Estratégia de conteúdo detalhada" },
                  swot: {
                    type: "object",
                    properties: {
                      strengths: { type: "array", items: { type: "string" }, description: "Forças (mínimo 4)" },
                      weaknesses: { type: "array", items: { type: "string" }, description: "Fraquezas (mínimo 4)" },
                      opportunities: { type: "array", items: { type: "string" }, description: "Oportunidades (mínimo 4)" },
                      threats: { type: "array", items: { type: "string" }, description: "Ameaças (mínimo 4)" },
                    },
                    required: ["strengths", "weaknesses", "opportunities", "threats"],
                  },
                  empathyMap: {
                    type: "object",
                    properties: {
                      thinks: { type: "array", items: { type: "string" }, description: "O que o público pensa" },
                      feels: { type: "array", items: { type: "string" }, description: "O que o público sente" },
                      says: { type: "array", items: { type: "string" }, description: "O que o público diz" },
                      does: { type: "array", items: { type: "string" }, description: "O que o público faz" },
                      pains: { type: "array", items: { type: "string" }, description: "Dores do público" },
                      gains: { type: "array", items: { type: "string" }, description: "Ganhos desejados" },
                    },
                    required: ["thinks", "feels", "says", "does", "pains", "gains"],
                  },
                  storytelling: {
                    type: "object",
                    properties: {
                      hero: { type: "string", description: "O herói (cliente)" },
                      problem: { type: "string", description: "O problema" },
                      guide: { type: "string", description: "O guia (marca)" },
                      plan: { type: "string", description: "O plano" },
                      callToAction: { type: "string", description: "A chamada para ação" },
                      success: { type: "string", description: "O sucesso" },
                      failure: { type: "string", description: "O fracasso evitado" },
                    },
                    required: ["hero", "problem", "guide", "plan", "callToAction", "success", "failure"],
                  },
                },
                required: ["name", "description", "sector", "tone", "colors", "fonts", "themes", "topics", "tags", "postSuggestions", "swot", "empathyMap", "storytelling"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_brand" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Erro na análise de IA");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      const content = data.choices?.[0]?.message?.content || "{}";
      analysis = JSON.parse(content);
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-profile error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
