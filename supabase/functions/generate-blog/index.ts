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
      return new Response(JSON.stringify({ error: "Tema é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const brandInfo = brandContext
      ? `\nMarca: ${brandContext.name || "N/A"}\nSetor: ${brandContext.sector || "N/A"}\nTom: ${brandContext.tone || "Profissional"}`
      : "";

    const typeMap: Record<string, string> = {
      "Post de Blog": "um post de blog completo com introdução, 3-5 seções com subtítulos, e conclusão com CTA",
      "Artigo LinkedIn": "um artigo profissional para LinkedIn com hook forte, insights de mercado e call-to-action",
      "Newsletter": "uma newsletter por email com assunto atraente, corpo envolvente e CTA claro",
      "Guia Completo": "um guia completo e detalhado com índice, seções numeradas, exemplos práticos e conclusão",
      "Listicle": "um listicle engajador com título numerado, itens bem desenvolvidos e conclusão",
    };

    const typeInstruction = typeMap[type] || typeMap["Post de Blog"];

    const systemPrompt = `Você é um redator de conteúdo expert em marketing digital e SEO. Escreva sempre em português brasileiro.
Gere conteúdo original, engajador e otimizado para SEO.
Use markdown para formatação (## para subtítulos, **negrito** para destaques, - para listas).
${brandInfo}`;

    const userPrompt = `Crie ${typeInstruction} sobre o seguinte tema:

"${topic}"

Responda em JSON com esta estrutura:
{
  "title": "título do artigo otimizado para SEO",
  "subtitle": "subtítulo complementar",
  "content": "conteúdo completo em markdown",
  "metaDescription": "meta description para SEO (máx 160 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": "X min de leitura"
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
      return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini error:", response.status, t);
      throw new Error("Erro no serviço de IA");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: "Artigo", content: raw };
    } catch {
      result = { title: "Artigo Gerado", content: raw };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
