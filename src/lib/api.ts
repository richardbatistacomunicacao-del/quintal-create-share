import { supabase } from "@/integrations/supabase/client";
import type { Post, BrandContext, ProfileAnalysis } from "@/types/content";

function getFriendlyError(error: any, data: any, defaultMsg: string): string {
  const msg = data?.error || error?.message || "";
  if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("Max retries")) {
    return "🐕 O serviço de IA está sobrecarregado no momento. Tente novamente em 1-2 minutos!";
  }
  if (msg.includes("429") || msg.includes("Limite")) {
    return "⏳ Muitas requisições! Aguarde alguns segundos e tente novamente.";
  }
  if (msg.includes("timeout") || msg.includes("context canceled") || msg.includes("DEADLINE")) {
    return "⏱️ A resposta demorou demais. Tente novamente — às vezes a IA precisa de mais tempo!";
  }
  return msg || defaultMsg;
}

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

export interface BlogResult {
  title: string;
  subtitle?: string;
  content: string;
  metaDescription?: string;
  tags?: string[];
  readingTime?: string;
}

export async function generateBlog(
  topic: string,
  type: string,
  brandContext?: BrandContext
): Promise<BlogResult> {
  const { data, error } = await supabase.functions.invoke("generate-blog", {
    body: { topic, type, brandContext },
  });
  if (error) throw new Error(error.message || "Erro ao gerar blog");
  if (data?.error) throw new Error(data.error);
  return data;
}

export interface TextResult {
  title: string;
  type: string;
  content: string;
  variations?: string[];
  tips?: string[];
}

export async function generateText(
  topic: string,
  type: string,
  brandContext?: BrandContext
): Promise<TextResult> {
  const { data, error } = await supabase.functions.invoke("generate-text", {
    body: { topic, type, brandContext },
  });
  if (error) throw new Error(error.message || "Erro ao gerar texto");
  if (data?.error) throw new Error(data.error);
  return data;
}

export interface DossieResult {
  companyName: string;
  sector?: string;
  executiveSummary: string;
  marketData?: {
    marketSize: string;
    growth: string;
    trends: string[];
    competitors: { name: string; strength: string; weakness: string }[];
  };
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  empathyMap?: {
    thinks: string[];
    feels: string[];
    says: string[];
    does: string[];
    pains: string[];
    gains: string[];
  };
  actionPlan?: { phase: string; duration: string; actions: string[] }[];
  investment?: { recommended: string; roi: string; justification: string };
  conclusion?: string;
}

export async function generateDossie(
  prospect: string,
  brandContext?: BrandContext
): Promise<DossieResult> {
  const { data, error } = await supabase.functions.invoke("generate-dossie", {
    body: { prospect, brandContext },
  });
  if (error) throw new Error(error.message || "Erro ao gerar dossiê");
  if (data?.error) throw new Error(data.error);
  return data;
}

export interface PresentationSlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  content: string[];
  notes?: string;
  layout: string;
}

export interface PresentationResult {
  title: string;
  slides: PresentationSlide[];
  totalSlides?: number;
  estimatedDuration?: string;
}

export async function generatePresentation(
  topic: string,
  type: string,
  brandContext?: BrandContext
): Promise<PresentationResult> {
  const { data, error } = await supabase.functions.invoke("generate-presentation", {
    body: { topic, type, brandContext },
  });
  if (error) throw new Error(error.message || "Erro ao gerar apresentação");
  if (data?.error) throw new Error(data.error);
  return data;
}
