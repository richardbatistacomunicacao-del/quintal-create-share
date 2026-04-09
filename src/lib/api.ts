import { supabase } from "@/integrations/supabase/client";
import type { Post, BrandContext, ProfileAnalysis } from "@/types/content";

export async function generatePosts(
  prompt: string,
  format: string,
  network: string,
  quantity: string,
  brandContext?: BrandContext
): Promise<Post[]> {
  const { data, error } = await supabase.functions.invoke("generate-post", {
    body: { prompt, format, network, quantity, brandContext },
  });

  if (error) throw new Error(error.message || "Erro ao gerar posts");
  if (data?.error) throw new Error(data.error);
  return data?.posts || [];
}

export async function analyzeProfile(url: string): Promise<ProfileAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-profile", {
    body: { url },
  });

  if (error) throw new Error(error.message || "Erro ao analisar perfil");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function generateCaption(
  action: "regenerate" | "hook" | "aida" | "pas" | "hashtags",
  context: string,
  currentCaption?: string,
  brandContext?: BrandContext
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("generate-caption", {
    body: { action, context, currentCaption, brandContext },
  });

  if (error) throw new Error(error.message || "Erro ao gerar legenda");
  if (data?.error) throw new Error(data.error);
  return data?.result || "";
}

export async function generateImage(
  prompt: string,
  style?: string,
  brandContext?: BrandContext
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: { prompt, style, brandContext },
  });

  if (error) throw new Error(error.message || "Erro ao gerar imagem");
  if (data?.error) throw new Error(data.error);
  return data?.imageUrl || "";
}
