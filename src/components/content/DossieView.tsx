import { useState } from "react";
import { FileText, BarChart3, Target, Users, TrendingUp, Download } from "lucide-react";
import { generateDossie, type DossieResult } from "@/lib/api";
import { downloadDossieAsPdf } from "@/lib/downloadPdf";
import type { BrandContext } from "@/types/content";
import { useToast } from "@/hooks/use-toast";

interface DossieViewProps {
  brand: BrandContext;
}

const DossieView = ({ brand }: DossieViewProps) => {
  const [prospect, setProspect] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<DossieResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prospect.trim()) {
      toast({ title: "Descreva o prospecto!", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const data = await generateDossie(prospect, brand);
      setResult(data);
      toast({ title: "📋 Dossiê gerado!", description: data.companyName });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro ao gerar", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4">
      <div className="bg-surface-1 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-[hsl(var(--amber))]" />
          <div className="font-heading text-sm font-black">Dossiê Estratégico</div>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
          Gere dossiês completos para prospecção: dados de mercado, análise competitiva, SWOT, mapa de empatia e plano de ação.
        </p>
        <div className="bg-surface-2 border border-border rounded-xl p-3 mb-3">
          <textarea
            value={prospect}
            onChange={(e) => setProspect(e.target.value)}
            placeholder="Descreva o prospecto... Ex: 'Cafeteria Aroma, cafeteria artesanal em São Paulo, 2 unidades, público jovem profissional'"
            className="w-full bg-transparent border-none text-foreground text-[13px] font-body leading-relaxed resize-none outline-none min-h-[80px] placeholder:text-dim"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            { icon: BarChart3, label: "Dados de Mercado", color: "text-primary" },
            { icon: Target, label: "Análise SWOT", color: "text-[hsl(var(--blue))]" },
            { icon: Users, label: "Mapa de Empatia", color: "text-[hsl(var(--purple))]" },
            { icon: TrendingUp, label: "Plano de Ação", color: "text-[hsl(var(--amber))]" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-3 border border-border">
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-[9px] font-heading font-bold text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[hsl(var(--amber))] text-amber-foreground font-heading font-extrabold text-[11px] cursor-pointer hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <><span className="w-3 h-3 border-2 border-white/25 border-t-white rounded-full animate-spin" /> Gerando dossiê...</>
          ) : (
            <><FileText className="w-3.5 h-3.5" /> Gerar Dossiê</>
          )}
        </button>
      </div>

      {result && (
        <>
          {/* Header */}
          <div className="bg-surface-1 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading font-black text-lg">{result.companyName}</h2>
              <div className="flex items-center gap-2">
                {result.sector && <span className="text-[10px] text-[hsl(var(--amber))] bg-[hsl(var(--amber))]/10 px-2 py-0.5 rounded-full font-heading font-bold">{result.sector}</span>}
                <button
                  onClick={() => downloadDossieAsPdf(result)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--amber))]/10 border border-[hsl(var(--amber))]/20 text-[hsl(var(--amber))] text-[10px] font-heading font-bold cursor-pointer hover:bg-[hsl(var(--amber))]/20 transition-colors"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
            <p className="text-[12px] text-foreground/80 leading-relaxed">{result.executiveSummary}</p>
          </div>

          {/* Market Data */}
          {result.marketData && (
            <div className="bg-surface-1 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="font-heading font-black text-sm">Dados de Mercado</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-3 rounded-lg bg-surface-2 border border-border">
                  <p className="text-[9px] text-dim font-heading font-bold uppercase tracking-wider">Tamanho do Mercado</p>
                  <p className="font-heading font-black text-lg text-primary">{result.marketData.marketSize}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-2 border border-border">
                  <p className="text-[9px] text-dim font-heading font-bold uppercase tracking-wider">Crescimento</p>
                  <p className="font-heading font-black text-lg text-primary">{result.marketData.growth}</p>
                </div>
              </div>
              {result.marketData.trends && (
                <div className="mb-3">
                  <p className="text-[10px] text-dim font-heading font-bold uppercase mb-1">Tendências</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.marketData.trends.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.marketData.competitors && (
                <div>
                  <p className="text-[10px] text-dim font-heading font-bold uppercase mb-1">Concorrentes</p>
                  <div className="space-y-1.5">
                    {result.marketData.competitors.map((c, i) => (
                      <div key={i} className="p-2 rounded-lg bg-surface-2 border border-border flex items-start gap-2">
                        <span className="font-heading font-bold text-[11px] text-foreground shrink-0">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground">✅ {c.strength} | ⚠️ {c.weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SWOT */}
          {result.swot && (
            <div className="bg-surface-1 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-[hsl(var(--blue))]" />
                <span className="font-heading font-black text-sm">Análise SWOT</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Forças", items: result.swot.strengths, color: "text-primary", bg: "bg-primary/5" },
                  { label: "Fraquezas", items: result.swot.weaknesses, color: "text-destructive", bg: "bg-destructive/5" },
                  { label: "Oportunidades", items: result.swot.opportunities, color: "text-[hsl(var(--blue))]", bg: "bg-[hsl(var(--blue))]/5" },
                  { label: "Ameaças", items: result.swot.threats, color: "text-[hsl(var(--amber))]", bg: "bg-[hsl(var(--amber))]/5" },
                ].map((q) => (
                  <div key={q.label} className={`p-3 rounded-lg ${q.bg} border border-border`}>
                    <p className={`text-[10px] font-heading font-black uppercase mb-1.5 ${q.color}`}>{q.label}</p>
                    {q.items.map((item, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground mb-0.5">• {item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          {result.actionPlan && (
            <div className="bg-surface-1 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[hsl(var(--amber))]" />
                <span className="font-heading font-black text-sm">Plano de Ação</span>
              </div>
              <div className="space-y-2">
                {result.actionPlan.map((phase, i) => (
                  <div key={i} className="p-3 rounded-lg bg-surface-2 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-bold text-[11px]">{phase.phase}</span>
                      <span className="text-[9px] text-dim bg-surface-3 px-2 py-0.5 rounded-full">{phase.duration}</span>
                    </div>
                    {phase.actions.map((a, j) => (
                      <p key={j} className="text-[11px] text-muted-foreground">→ {a}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investment */}
          {result.investment && (
            <div className="bg-surface-1 border border-[hsl(var(--amber))]/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-heading font-black text-sm">💰 Investimento Recomendado</span>
              </div>
              <p className="font-heading font-black text-2xl text-[hsl(var(--amber))] mb-1">{result.investment.recommended}</p>
              <p className="text-[11px] text-muted-foreground mb-1">📈 {result.investment.roi}</p>
              <p className="text-[11px] text-foreground/80">{result.investment.justification}</p>
            </div>
          )}

          {/* Conclusion */}
          {result.conclusion && (
            <div className="bg-surface-1 border border-border rounded-xl p-4">
              <span className="font-heading font-black text-sm mb-2 block">Conclusão</span>
              <p className="text-[12px] text-foreground/80 leading-relaxed">{result.conclusion}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DossieView;
