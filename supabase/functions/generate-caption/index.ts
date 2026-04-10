import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, context, currentCaption, brandContext } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    let brandInfo = "";
    if (brandContext) {
      brandInfo = `\nCONTEXTO DA MARCA: ${brandContext.name || ""} - ${brandContext.sector || ""} - Tom: ${brandContext.tone || "Profissional"}`;
    }

    const prompts: Record<string, string> = {
      regenerate: `Reescreva esta legenda de forma diferente e melhor, mantendo a essência: "${currentCaption}"${brandInfo}`,
      hook: `Crie um hook (gancho de abertura) IRRESISTÍVEL para este post. Deve ser uma frase de abertura que prende atenção nos primeiros 2 segundos. Contexto: ${context || currentCaption}${brandInfo}`,
      aida: `Reescreva esta legenda usando a técnica AIDA (Atenção, Interesse, Desejo, Ação). Cada parte deve ser clara e persuasiva. Contexto: ${context || currentCaption}${brandInfo}`,
      pas: `Reescreva esta legenda usando a técnica PAS (Problema, Agitação, Solução). Identifique a dor do público e ofereça a solução. Contexto: ${context || currentCaption}${brandInfo}`,
      hashtags: `Gere 20-30 hashtags ALTAMENTE relevantes e estratégicas para este post. Mix de hashtags populares e de nicho. Contexto: ${context || currentCaption}${brandInfo}. Retorne APENAS as hashtags separadas por espaço.`,
    };

    const userPrompt = prompts[action] || prompts.regenerate;

    const systemPrompt = `Você é o maior especialista em copywriting para redes sociais do Brasil. 
Escreva em português brasileiro.
Use emojis estrategicamente.
Seja criativo, envolvente e persuasivo.
${action === "hashtags" ? "Retorne APENAS hashtags, nada mais." : "Retorne APENAS a legenda/texto, sem explicações adicionais."}`;

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

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Erro na IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-caption error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
