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
    const { topic, type, brandContext } = await req.json();

    if (!topic?.trim()) {
      return new Response(JSON.stringify({ error: "Descrição é obrigatória" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const brandInfo = brandContext
      ? `\nMarca: ${brandContext.name || "N/A"}\nSetor: ${brandContext.sector || "N/A"}\nTom: ${brandContext.tone || "Profissional"}`
      : "";

    const typeMap: Record<string, string> = {
      "E-mail Marketing": "um e-mail marketing persuasivo com assunto, preview text, corpo com hook + benefícios + CTA",
      "Anúncio": "textos para anúncios (headline, descrição curta, descrição longa, CTA) para Meta Ads e Google Ads",
      "Página de Venda": "copy completa de página de venda com headline, subheadline, benefícios, prova social, FAQ e CTA",
      "Script de Vídeo": "roteiro de vídeo com hook (3s), desenvolvimento e CTA final, com marcações de tempo",
      "Bio/Sobre": "bio profissional para redes sociais e página Sobre com tom autêntico",
      "Proposta Comercial": "estrutura de proposta comercial com contexto, diagnóstico, solução, investimento e próximos passos",
    };

    const typeInstruction = typeMap[type] || typeMap["E-mail Marketing"];

    const response = await fetchWithRetry(GEMINI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: `Você é um copywriter expert em marketing e persuasão. Escreva em português brasileiro.
Use técnicas de copywriting (AIDA, PAS, storytelling).${brandInfo}`,
          },
          {
            role: "user",
            content: `Crie ${typeInstruction} sobre: "${topic}"

Responda em JSON:
{
  "title": "título do texto",
  "type": "${type || "E-mail Marketing"}",
  "content": "conteúdo completo em markdown",
  "variations": ["variação 1 do headline", "variação 2"],
  "tips": ["dica de uso 1", "dica 2"]
}`,
          },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite excedido. Tente novamente em breve." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: "Texto", content: raw };
    } catch {
      result = { title: "Texto Gerado", content: raw };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-text error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
