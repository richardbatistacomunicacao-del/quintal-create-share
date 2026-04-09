import { useState } from "react";
import { PenTool } from "lucide-react";
import { generateText, type TextResult } from "@/lib/api";
import type { BrandContext } from "@/types/content";
import { useToast } from "@/hooks/use-toast";

interface TextViewProps {
  brand: BrandContext;
}

const TextView = ({ brand }: TextViewProps) => {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("E-mail Marketing");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TextResult | null>(null);
  const { toast } = useToast();

  const types = ["E-mail Marketing", "Anúncio", "Página de Venda", "Script de Vídeo", "Bio/Sobre", "Proposta Comercial"];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Descreva o que precisa!", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const data = await generateText(topic, type, brand);
      setResult(data);
      toast({ title: "✍️ Texto gerado!", description: data.title });
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
          <PenTool className="w-5 h-5 text-[hsl(var(--blue))]" />
          <div className="font-heading text-sm font-black">Textos & Copywriting</div>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
          Crie textos persuasivos para e-mails, anúncios, páginas de venda, scripts de vídeo e mais.
        </p>
        <div className="bg-surface-2 border border-border rounded-xl p-3 mb-3">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Descreva o que precisa... Ex: 'E-mail de boas vindas para novo cliente de consultoria'"
            className="w-full bg-transparent border-none text-foreground text-[13px] font-body leading-relaxed resize-none outline-none min-h-[80px] placeholder:text-dim"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-heading font-bold transition-colors cursor-pointer ${
                type === t ? "bg-[hsl(var(--blue))]/15 border-[hsl(var(--blue))]/30 text-[hsl(var(--blue))]" : "bg-surface-3 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[hsl(var(--blue))] text-primary-foreground font-heading font-extrabold text-[11px] cursor-pointer hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <><span className="w-3 h-3 border-2 border-white/25 border-t-white rounded-full animate-spin" /> Gerando...</>
          ) : (
            <><PenTool className="w-3.5 h-3.5" /> Gerar Texto</>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-heading font-black text-lg">{result.title}</h2>
          <span className="text-[10px] text-[hsl(var(--blue))] bg-[hsl(var(--blue))]/10 px-2 py-0.5 rounded-full font-heading font-bold">{result.type}</span>
          <div className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {result.content}
          </div>
          {result.variations && result.variations.length > 0 && (
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <span className="text-[9px] text-dim font-heading font-bold uppercase block mb-1">Variações de headline</span>
              {result.variations.map((v, i) => (
                <p key={i} className="text-[11px] text-muted-foreground">• {v}</p>
              ))}
            </div>
          )}
          {result.tips && result.tips.length > 0 && (
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <span className="text-[9px] text-dim font-heading font-bold uppercase block mb-1">Dicas de uso</span>
              {result.tips.map((t, i) => (
                <p key={i} className="text-[11px] text-muted-foreground">💡 {t}</p>
              ))}
            </div>
          )}
          <button
            onClick={() => navigator.clipboard.writeText(result.content)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-heading font-bold"
          >
            📋 Copiar texto
          </button>
        </div>
      )}
    </div>
  );
};

export default TextView;
