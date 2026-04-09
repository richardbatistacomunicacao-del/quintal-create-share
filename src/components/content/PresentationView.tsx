import { useState } from "react";
import { Presentation, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { generatePresentation, type PresentationResult } from "@/lib/api";
import { downloadPresentationAsText } from "@/lib/downloadPdf";
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

  const layoutIcons: Record<string, string> = {
    title: "🎯",
    content: "📝",
    "two-column": "📊",
    stats: "📈",
    quote: "💬",
    cta: "🚀",
  };

  const layoutGradients: Record<string, string> = {
    title: "from-[hsl(var(--purple))]/15 via-primary/5 to-transparent",
    content: "from-surface-3 to-surface-2",
    "two-column": "from-[hsl(var(--blue))]/10 to-surface-2",
    stats: "from-[hsl(var(--amber))]/10 to-surface-2",
    quote: "from-[hsl(var(--purple))]/10 to-surface-2",
    cta: "from-primary/15 to-primary/5",
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-4">
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
        <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Presentation className="w-4 h-4 text-[hsl(var(--purple))]" />
              <h2 className="font-heading font-black text-sm">{result.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-dim">{result.slides.length} slides</span>
              {result.estimatedDuration && <span className="text-[10px] text-dim">• {result.estimatedDuration}</span>}
              <button
                onClick={() => downloadPresentationAsText(result)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--purple))]/10 border border-[hsl(var(--purple))]/20 text-[hsl(var(--purple))] text-[10px] font-heading font-bold cursor-pointer hover:bg-[hsl(var(--purple))]/20 transition-colors"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          </div>

          <div className="flex">
            {/* Slide thumbnails sidebar */}
            <div className="w-28 border-r border-border bg-surface-2/50 overflow-y-auto max-h-[500px] scrollbar-thin flex-shrink-0">
              {result.slides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`w-full text-left p-2 border-b border-border/50 cursor-pointer transition-all ${
                    activeSlide === i ? "bg-[hsl(var(--purple))]/10 border-l-2 border-l-[hsl(var(--purple))]" : "hover:bg-surface-3"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[8px] text-dim font-heading font-bold">{i + 1}</span>
                    <span className="text-[10px]">{layoutIcons[slide.layout] || "📄"}</span>
                  </div>
                  <p className="text-[9px] font-heading font-bold text-foreground/80 line-clamp-2 leading-tight">{slide.title}</p>
                </button>
              ))}
            </div>

            {/* Main slide preview */}
            <div className="flex-1 p-4">
              {result.slides[activeSlide] && (
                <>
                  {/* Slide canvas - 16:9 aspect ratio */}
                  <div className={`w-full aspect-video rounded-xl border border-border bg-gradient-to-br ${layoutGradients[result.slides[activeSlide].layout] || layoutGradients.content} p-8 flex flex-col justify-center relative overflow-hidden`}>
                    {/* Slide number badge */}
                    <div className="absolute top-3 right-3 text-[9px] text-dim font-heading font-bold bg-surface-1/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {activeSlide + 1}/{result.slides.length}
                    </div>
                    
                    {/* Layout type badge */}
                    <div className="absolute top-3 left-3 text-[9px] text-dim font-heading font-bold uppercase tracking-wider bg-surface-1/50 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{layoutIcons[result.slides[activeSlide].layout] || "📄"}</span>
                      {result.slides[activeSlide].layout}
                    </div>

                    <div className="mt-4">
                      <h3 className="font-heading font-black text-2xl mb-2 leading-tight">{result.slides[activeSlide].title}</h3>
                      {result.slides[activeSlide].subtitle && (
                        <p className="text-sm text-muted-foreground mb-4 font-body">{result.slides[activeSlide].subtitle}</p>
                      )}
                      
                      {result.slides[activeSlide].layout === "two-column" ? (
                        <div className="grid grid-cols-2 gap-4">
                          {result.slides[activeSlide].content.map((point, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface-1/30">
                              <span className="text-primary font-heading font-bold text-sm mt-0.5">{i + 1}.</span>
                              <p className="text-[12px] text-foreground/85 font-body leading-relaxed">{point}</p>
                            </div>
                          ))}
                        </div>
                      ) : result.slides[activeSlide].layout === "stats" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {result.slides[activeSlide].content.map((point, i) => (
                            <div key={i} className="p-3 rounded-lg bg-surface-1/30 border border-border/50 text-center">
                              <p className="text-[12px] text-foreground/85 font-heading font-bold">{point}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {result.slides[activeSlide].content.map((point, i) => (
                            <li key={i} className="text-[13px] text-foreground/85 flex items-start gap-2.5 font-body">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {result.slides[activeSlide].notes && (
                    <div className="mt-3 p-3 rounded-lg bg-surface-2 border border-border">
                      <span className="text-[9px] text-dim font-heading font-bold uppercase tracking-wider">🎤 Notas do apresentador</span>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{result.slides[activeSlide].notes}</p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                      disabled={activeSlide === 0}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-[10px] font-heading font-bold text-muted-foreground disabled:opacity-30 cursor-pointer hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" /> Anterior
                    </button>
                    <div className="flex gap-1">
                      {result.slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all ${activeSlide === i ? "bg-[hsl(var(--purple))] scale-125" : "bg-surface-4 hover:bg-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveSlide(Math.min(result.slides.length - 1, activeSlide + 1))}
                      disabled={activeSlide === result.slides.length - 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-[10px] font-heading font-bold text-muted-foreground disabled:opacity-30 cursor-pointer hover:text-foreground transition-colors"
                    >
                      Próximo <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationView;
