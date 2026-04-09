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
}

export interface BrandContext {
  name: string;
  sector: string;
  tone: string;
  font: string;
  colors: string[];
  logo: string | null;
}

export interface ProfileAnalysis {
  name: string;
  description: string;
  sector: string;
  tone: string;
  colors: string[];
  tags: { label: string; category: string }[];
  postSuggestions: string[];
  audienceInsights?: string;
  contentStrategy?: string;
}
