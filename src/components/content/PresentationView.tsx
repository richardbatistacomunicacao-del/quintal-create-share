import { useState } from "react";
import { Presentation } from "lucide-react";
import { generatePresentation, type PresentationResult } from "@/lib/api";
import type { BrandContext } from "@/types/content";
import { useToast } from "@/hooks/use-toast";

interface PresentationViewProps {
  brand: BrandContext;
}

const PresentationView = ({ brand }: PresentationViewProps) => {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("Comercial");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PresentationResult | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { toast } = useToast();

  const types = ["Comercial", "Pitch de Vendas", "Relatório Mensal", "Onboarding", "Case de Sucesso"];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Descreva a apresentação!", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const data = await generatePresentation(topic, type, brand);
      setResult(data);
      setActiveSlide(0);
      toast({ title: "🎯 Apresentação gerada!", description: `${data.slides?.length || 0} slides` });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro ao gerar", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const layoutColors: Record<string, string> = {
    title: "from-primary/20 to-primary/5",
    content: "from-surface-3 to-surface-2",
    "two-column": "from-[hsl(var(--blue))]/10 to-surface-2",
    stats: "from-[hsl(var(--amber))]/10 to-surface-2",
    quote: "from-[hsl(var(--purple))]/10 to-surface-2",
    cta: "from-primary/15 to-primary/5",
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4">
      <div className="bg-surface-1 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Presentation className="w-5 h-5 text-[hsl(var(--purple))]" />
          <div className="font-heading text-sm font-black">Apresentações</div>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
          Monte apresentações profissionais com dados de mercado, identidade visual do cliente e storytelling estratégico.
        </p>
        <div className="bg-surface-2 border border-border rounded-xl p-3 mb-3">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Descreva a apresentação... Ex: 'Apresentação comercial para prospectar cafeterias, mostrando dados de mercado e nossos serviços'"
            className="w-full bg-transparent border-none text-foreground text-[13px] font-body leading-relaxed resize-none outline-none min-h-[80px] placeholder:text-dim"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-heading font-bold transition-colors cursor-pointer ${
                type === t ? "bg-[hsl(var(--purple))]/15 border-[hsl(var(--purple))]/30 text-[hsl(var(--purple))]" : "bg-surface-3 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[hsl(var(--purple))] text-primary-foreground font-heading font-extrabold text-[11px] cursor-pointer hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <><span className="w-3 h-3 border-2 border-white/25 border-t-white rounded-full animate-spin" /> Gerando...</>
          ) : (
            <><Presentation className="w-3.5 h-3.5" /> Gerar Apresentação</>
          )}
        </button>
      </div>

      {result && result.slides && result.slides.length > 0 && (
        <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-lg">{result.title}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-dim">{result.slides.length} slides</span>
              {result.estimatedDuration && <span className="text-[10px] text-dim">• {result.estimatedDuration}</span>}
            </div>
          </div>

          {/* Slide thumbnails */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {result.slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`flex-shrink-0 w-20 h-12 rounded-md border text-[8px] font-heading font-bold p-1.5 cursor-pointer transition-all truncate ${
                  activeSlide === i ? "border-[hsl(var(--purple))] bg-[hsl(var(--purple))]/10 text-foreground" : "border-border bg-surface-2 text-dim hover:border-border"
                }`}
              >
                <span className="text-[7px] text-dim block">{i + 1}</span>
                {slide.title}
              </button>
            ))}
          </div>

          {/* Active slide */}
          {result.slides[activeSlide] && (
            <div className={`rounded-xl border border-border p-6 bg-gradient-to-br ${layoutColors[result.slides[activeSlide].layout] || layoutColors.content} min-h-[200px]`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-dim font-heading font-bold uppercase">Slide {activeSlide + 1} — {result.slides[activeSlide].layout}</span>
              </div>
              <h3 className="font-heading font-black text-xl mb-1">{result.slides[activeSlide].title}</h3>
              {result.slides[activeSlide].subtitle && (
                <p className="text-sm text-muted-foreground mb-3">{result.slides[activeSlide].subtitle}</p>
              )}
              <ul className="space-y-1.5">
                {result.slides[activeSlide].content.map((point, i) => (
                  <li key={i} className="text-[13px] text-foreground/85 flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
              {result.slides[activeSlide].notes && (
                <div className="mt-4 p-2 rounded-lg bg-surface-1/50 border border-border">
                  <span className="text-[9px] text-dim font-heading font-bold">🎤 Notas:</span>
                  <p className="text-[10px] text-muted-foreground">{result.slides[activeSlide].notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
              disabled={activeSlide === 0}
              className="px-3 py-1 rounded-lg bg-surface-3 border border-border text-[10px] font-heading font-bold text-muted-foreground disabled:opacity-30 cursor-pointer"
            >
              ← Anterior
            </button>
            <span className="text-[10px] text-dim">{activeSlide + 1} / {result.slides.length}</span>
            <button
              onClick={() => setActiveSlide(Math.min(result.slides.length - 1, activeSlide + 1))}
              disabled={activeSlide === result.slides.length - 1}
              className="px-3 py-1 rounded-lg bg-surface-3 border border-border text-[10px] font-heading font-bold text-muted-foreground disabled:opacity-30 cursor-pointer"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationView;
