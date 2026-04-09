import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL é obrigatória");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Use AI to analyze the URL/profile
    const systemPrompt = `Você é um especialista em análise de marcas e perfis de redes sociais. Analise a URL fornecida e extraia informações sobre a marca.

IMPORTANTE: Mesmo que você não consiga acessar a URL diretamente, use seu conhecimento para:
1. Se for um @ de Instagram, analise com base no que você sabe sobre esse perfil
2. Se for um site, analise com base no domínio e contexto
3. Se for qualquer rede social, faça sua melhor análise

RESPONDA USANDO A FUNÇÃO FORNECIDA com dados realistas e úteis.`;

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
          { role: "user", content: `Analise este perfil/site e extraia a identidade da marca: ${url}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_brand",
              description: "Retorna análise completa de uma marca/perfil",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Nome da marca/perfil" },
                  description: { type: "string", description: "Descrição curta do negócio" },
                  sector: { type: "string", description: "Setor/nicho de atuação" },
                  tone: { type: "string", description: "Tom de voz predominante" },
                  colors: { type: "array", items: { type: "string" }, description: "Cores hex da marca" },
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
                    description: "Tags descritivas",
                  },
                  postSuggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "5 sugestões de temas de posts",
                  },
                  audienceInsights: { type: "string", description: "Insights sobre o público-alvo" },
                  contentStrategy: { type: "string", description: "Estratégia de conteúdo sugerida" },
                },
                required: ["name", "description", "sector", "tone", "colors", "tags", "postSuggestions"],
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
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
