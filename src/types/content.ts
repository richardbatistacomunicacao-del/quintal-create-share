export interface Post {
  title: string;
  caption: string;
  hashtags: string;
  slides?: string[];
  hook: string;
  cta: string;
  bgColor: string;
  textColor: string;
  type: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface BrandContext {
  name: string;
  sector: string;
  tone: string;
  font: string;
  colors: string[];
  logo: string | null;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface EmpathyMap {
  thinks: string[];
  feels: string[];
  says: string[];
  does: string[];
  pains: string[];
  gains: string[];
}

export interface StorytellingFramework {
  hero: string;
  problem: string;
  guide: string;
  plan: string;
  callToAction: string;
  success: string;
  failure: string;
}

export interface ProfileAnalysis {
  name: string;
  description: string;
  sector: string;
  tone: string;
  colors: string[];
  fonts: string[];
  themes: string[];
  topics: string[];
  tags: { label: string; category: string }[];
  postSuggestions: string[];
  audienceInsights?: string;
  contentStrategy?: string;
  swot?: SwotAnalysis;
  empathyMap?: EmpathyMap;
  storytelling?: StorytellingFramework;
}
