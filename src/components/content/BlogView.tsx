import { useState } from "react";
import { BookOpen, Download } from "lucide-react";
import { generateBlog, type BlogResult } from "@/lib/api";
import { downloadBlogAsPdf } from "@/lib/downloadPdf";
import type { BrandContext } from "@/types/content";
import { useToast } from "@/hooks/use-toast";

interface BlogViewProps {
  brand: BrandContext;
}

const BlogView = ({ brand }: BlogViewProps) => {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("Post de Blog");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BlogResult | null>(null);
  const { toast } = useToast();

  const types = ["Post de Blog", "Artigo LinkedIn", "Newsletter", "Guia Completo", "Listicle"];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Escreva o tema!", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const data = await generateBlog(topic, type, brand);
      setResult(data);
      toast({ title: "📝 Artigo gerado!", description: data.title });
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
          <BookOpen className="w-5 h-5 text-primary" />
          <div className="font-heading text-sm font-black">Blogs & Artigos</div>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
          Gere blogs e artigos completos, otimizados para SEO, com o tom de voz e identidade da sua marca.
        </p>
        <div className="bg-surface-2 border border-border rounded-xl p-3 mb-3">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Descreva o tema do blog ou artigo... Ex: '5 tendências de marketing digital para cafeterias em 2025'"
            className="w-full bg-transparent border-none text-foreground text-[13px] font-body leading-relaxed resize-none outline-none min-h-[80px] placeholder:text-dim"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-heading font-bold transition-colors cursor-pointer ${
                type === t ? "bg-primary/15 border-primary/30 text-primary" : "bg-surface-3 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-heading font-extrabold text-[11px] cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <><span className="w-3 h-3 border-2 border-white/25 border-t-white rounded-full animate-spin" /> Gerando...</>
          ) : (
            <><BookOpen className="w-3.5 h-3.5" /> Gerar Artigo</>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-lg">{result.title}</h2>
            <div className="flex items-center gap-2">
              {result.readingTime && <span className="text-[10px] text-dim bg-surface-3 px-2 py-0.5 rounded-full">{result.readingTime}</span>}
              <button
                onClick={() => downloadBlogAsPdf(result.title, result.content, result.metaDescription, result.tags)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-heading font-bold cursor-pointer hover:bg-primary/20 transition-colors"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          </div>
          {result.subtitle && <p className="text-sm text-muted-foreground">{result.subtitle}</p>}
          {result.metaDescription && (
            <div className="p-2 rounded-lg bg-surface-2 border border-border">
              <span className="text-[9px] text-dim font-heading font-bold uppercase">SEO Meta:</span>
              <p className="text-[11px] text-muted-foreground">{result.metaDescription}</p>
            </div>
          )}
          <div className="prose prose-invert prose-sm max-w-none text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {result.content}
          </div>
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-heading font-bold">#{tag}</span>
              ))}
            </div>
          )}
          <button
            onClick={() => navigator.clipboard.writeText(`# ${result.title}\n\n${result.content}`)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-heading font-bold"
          >
            📋 Copiar conteúdo
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogView;
