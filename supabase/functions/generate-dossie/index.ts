import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prospect, brandContext } = await req.json();

    if (!prospect?.trim()) {
      return new Response(JSON.stringify({ error: "Descrição do prospecto é obrigatória" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const brandInfo = brandContext
      ? `\nSua marca/consultoria: ${brandContext.name || "N/A"}\nSetor: ${brandContext.sector || "N/A"}`
      : "";

    const systemPrompt = `Você é um consultor estratégico de negócios expert em análise de mercado, marketing e estratégia.
Gere dossiês profissionais completos para prospecção de clientes.
Todos os dados devem ser realistas e baseados em tendências reais do mercado brasileiro.
Escreva em português brasileiro.${brandInfo}`;

    const userPrompt = `Gere um dossiê estratégico completo para prospectar o seguinte cliente/negócio:

"${prospect}"

Responda em JSON com esta estrutura EXATA:
{
  "companyName": "nome da empresa/prospect",
  "sector": "setor de atuação",
  "executiveSummary": "resumo executivo em 2-3 parágrafos",
  "marketData": {
    "marketSize": "tamanho estimado do mercado (em R$)",
    "growth": "taxa de crescimento anual",
    "trends": ["tendência 1", "tendência 2", "tendência 3"],
    "competitors": [
      { "name": "concorrente 1", "strength": "ponto forte", "weakness": "ponto fraco" },
      { "name": "concorrente 2", "strength": "ponto forte", "weakness": "ponto fraco" },
      { "name": "concorrente 3", "strength": "ponto forte", "weakness": "ponto fraco" }
    ]
  },
  "swot": {
    "strengths": ["força 1", "força 2", "força 3"],
    "weaknesses": ["fraqueza 1", "fraqueza 2", "fraqueza 3"],
    "opportunities": ["oportunidade 1", "oportunidade 2", "oportunidade 3"],
    "threats": ["ameaça 1", "ameaça 2", "ameaça 3"]
  },
  "empathyMap": {
    "thinks": ["o que o cliente pensa"],
    "feels": ["o que sente"],
    "says": ["o que diz"],
    "does": ["o que faz"],
    "pains": ["dores"],
    "gains": ["ganhos desejados"]
  },
  "actionPlan": [
    { "phase": "Fase 1 - Diagnóstico", "duration": "2 semanas", "actions": ["ação 1", "ação 2"] },
    { "phase": "Fase 2 - Implementação", "duration": "4 semanas", "actions": ["ação 1", "ação 2"] },
    { "phase": "Fase 3 - Otimização", "duration": "contínuo", "actions": ["ação 1", "ação 2"] }
  ],
  "investment": {
    "recommended": "R$ X.XXX",
    "roi": "ROI estimado em X meses",
    "justification": "justificativa do investimento"
  },
  "conclusion": "conclusão e próximos passos recomendados"
}`;

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
          { role: "user", content: userPrompt },
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
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Formato inválido" };
    } catch {
      result = { companyName: "Dossiê", executiveSummary: raw };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-dossie error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
