import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, style, brandContext } = await req.json();
    if (!prompt) throw new Error("Prompt é obrigatório");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let brandInfo = "";
    if (brandContext) {
      brandInfo = ` Brand colors: ${brandContext.colors?.join(", ") || ""}. Style: ${brandContext.tone || "professional"}.`;
    }

    const imagePrompt = `Create a professional social media post image. ${prompt}. Style: ${style || "modern, clean, professional"}.${brandInfo} High quality, visually striking.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { role: "user", content: imagePrompt },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
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
      throw new Error("Erro na geração de imagem");
    }

    const data = await response.json();
    console.log("AI response keys:", JSON.stringify(Object.keys(data)));
    
    const message = data.choices?.[0]?.message;
    console.log("Message keys:", message ? JSON.stringify(Object.keys(message)) : "no message");

    // Try multiple paths to find the image
    let imageUrl: string | null = null;

    // Path 1: message.images array
    if (message?.images?.length > 0) {
      imageUrl = message.images[0]?.image_url?.url || message.images[0]?.url;
      console.log("Found image via message.images");
    }

    // Path 2: message.content as array with image parts
    if (!imageUrl && Array.isArray(message?.content)) {
      const imagePart = message.content.find((p: any) => p.type === "image_url" || p.type === "image");
      if (imagePart) {
        imageUrl = imagePart.image_url?.url || imagePart.url;
        console.log("Found image via content array");
      }
    }

    // Path 3: inline_data in parts
    if (!imageUrl && message?.content) {
      const contentStr = typeof message.content === "string" ? message.content : JSON.stringify(message.content);
      console.log("Content preview:", contentStr.substring(0, 200));
    }

    if (!imageUrl) {
      console.error("Full response structure:", JSON.stringify(data).substring(0, 500));
      return new Response(JSON.stringify({ error: "Não foi possível gerar a imagem. Tente novamente.", fallback: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido", fallback: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
