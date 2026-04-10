import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, type, brandContext } = await req.json();

    if (!topic?.trim()) {
      return new Response(JSON.stringify({ error: "Descrição é obrigatória" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const brandInfo = brandContext
      ? `\nMarca: ${brandContext.name || "N/A"}\nSetor: ${brandContext.sector || "N/A"}\nTom: ${brandContext.tone || "Profissional"}\nCores: ${brandContext.colors?.join(", ") || "#22C55E, #1C1E22"}`
      : "";

    const typeMap: Record<string, string> = {
      "Comercial": "apresentação comercial de vendas com proposta de valor, benefícios e case studies",
      "Pitch de Vendas": "pitch deck de vendas com problema, solução, diferencial e próximos passos",
      "Relatório Mensal": "relatório mensal com KPIs, resultados, análises e recomendações",
      "Onboarding": "apresentação de onboarding para novo cliente com timeline, processos e expectativas",
      "Case de Sucesso": "case de sucesso com desafio, solução, resultados e depoimento",
    };

    const typeInstruction = typeMap[type] || typeMap["Comercial"];

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um designer de apresentações e consultor de negócios expert.
Crie apresentações profissionais e impactantes.
Escreva em português brasileiro.${brandInfo}`,
          },
          {
            role: "user",
            content: `Crie ${typeInstruction} sobre: "${topic}"

Gere os slides em JSON com esta estrutura:
{
  "title": "título da apresentação",
  "slides": [
    {
      "slideNumber": 1,
      "title": "título do slide",
      "subtitle": "subtítulo (opcional)",
      "content": ["ponto 1", "ponto 2", "ponto 3"],
      "notes": "notas do apresentador",
      "layout": "title|content|two-column|stats|quote|cta"
    }
  ],
  "totalSlides": 10,
  "estimatedDuration": "15 minutos"
}

Gere entre 8-12 slides completos e profissionais.`,
          },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite excedido. Tente novamente." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      await response.text();
      throw new Error("Erro no serviço de IA");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: "Apresentação", slides: [] };
    } catch {
      result = { title: "Apresentação Gerada", slides: [], rawContent: raw };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-presentation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
