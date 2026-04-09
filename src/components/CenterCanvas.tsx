import { useState } from "react";
import type { Post, BrandContext } from "@/types/content";
import BlogView from "@/components/content/BlogView";
import TextView from "@/components/content/TextView";
import DossieView from "@/components/content/DossieView";
import PresentationView from "@/components/content/PresentationView";
import SupportChat from "@/components/content/SupportChat";
import { generatePosts, generateImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/PostCard";

interface CenterCanvasProps {
  activeView: string;
  brand: BrandContext;
  posts: Post[];
  selectedPostIndex: number | null;
  onSelectPost: (index: number) => void;
  onPostsGenerated: (posts: Post[]) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  onUpdatePost: (index: number, updated: Post) => void;
}

const CenterCanvas = ({
  activeView,
  brand,
  posts,
  selectedPostIndex,
  onSelectPost,
  onPostsGenerated,
  isGenerating,
  setIsGenerating,
  onUpdatePost,
}: CenterCanvasProps) => {
  const [format, setFormat] = useState("4:5");
  const [qty, setQty] = useState("1");
  const [network, setNetwork] = useState("IG");
  const [prompt, setPrompt] = useState("");
  const [withImage, setWithImage] = useState(false);
  const [imageStyle, setImageStyle] = useState("moderno");
  const [bulkPrompt, setBulkPrompt] = useState("");
  const [bulkQty, setBulkQty] = useState(5);
  const [calMonth, setCalMonth] = useState(new Date());
  const [generatingImageIdx, setGeneratingImageIdx] = useState<number | null>(null);
  const { toast } = useToast();

  const formats = [
    { id: "4:5", label: "Feed 4:5" },
    { id: "1:1", label: "1:1" },
    { id: "story", label: "Story" },
    { id: "carousel", label: "🎠 Carrossel" },
  ];
  const quantities = ["1", "3", "5", "10"];
  const networks = ["IG", "TK", "LI", "FB"];
  const chips = ["Promoção", "Dica", "Depoimento", "Lançamento", "Antes/depois", "Bastidores", "Engajamento", "Tutorial"];
  const imageStyles = ["moderno", "minimalista", "vibrante", "editorial", "fotográfico", "ilustração", "3D", "flat design"];

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { day: number; off: boolean; today: boolean }[] = [];
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevDays - i, off: true, today: false });
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, off: false, today: i === today.getDate() && month === today.getMonth() && year === today.getFullYear() });
    }
    while (days.length < 35) days.push({ day: days.length - daysInMonth - firstDay + 1, off: true, today: false });
    return days;
  };

  const handleGenerateImageForPost = async (index: number) => {
    const post = posts[index];
    if (!post) return;
    setGeneratingImageIdx(index);
    try {
      const imgPrompt = `${post.title}. ${post.hook}. Para post de ${post.type === "story" ? "story" : "feed"} de rede social.`;
      const imageUrl = await generateImage(imgPrompt, imageStyle, brand);
      onUpdatePost(index, { ...post, imageUrl, imagePrompt: imgPrompt });
      toast({ title: "🖼️ Imagem gerada!", description: "Imagem criada com IA." });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro ao gerar imagem", variant: "destructive" });
    } finally {
      setGeneratingImageIdx(null);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Escreva algo!", description: "Descreva o post que você quer criar.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generatePosts(prompt, format, network, qty, brand);
      
      if (withImage && result.length > 0) {
        toast({ title: "✨ Posts gerados!", description: `Gerando imagens para ${result.length} post(s)...` });
        onPostsGenerated(result);
        // Generate images for each post
        for (let i = 0; i < result.length; i++) {
          try {
            const imgPrompt = `${result[i].title}. ${result[i].hook}`;
            const imageUrl = await generateImage(imgPrompt, imageStyle, brand);
            result[i] = { ...result[i], imageUrl, imagePrompt: imgPrompt };
            onPostsGenerated([...result]);
          } catch {
            // Continue even if one image fails
          }
        }
        toast({ title: "🖼️ Tudo pronto!", description: `${result.length} post(s) com imagens!` });
      } else {
        onPostsGenerated(result);
        toast({ title: "✨ Posts gerados!", description: `${result.length} post(s) criado(s) com sucesso.` });
      }
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro ao gerar", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!bulkPrompt.trim()) {
      toast({ title: "Escreva algo!", description: "Descreva o tema geral dos posts.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generatePosts(bulkPrompt, format, network, String(bulkQty), brand);
      onPostsGenerated(result);
      toast({ title: "⚡ Geração em massa!", description: `${result.length} posts gerados!` });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro ao gerar", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden bg-background">
      {/* Format bar */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-border bg-surface-1 flex-shrink-0 flex-wrap">
        <div className="flex bg-surface-2 border border-border rounded-md overflow-hidden">
          {formats.map((f) => (
            <button key={f.id} onClick={() => setFormat(f.id)} className={`px-2.5 py-1 border-none font-heading font-bold text-[9px] cursor-pointer transition-colors ${format === f.id ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"}`}>{f.label}</button>
          ))}
        </div>
        <div className="flex bg-surface-2 border border-border rounded-md overflow-hidden">
          {quantities.map((q) => (
            <button key={q} onClick={() => setQty(q)} className={`px-2 py-1 border-none font-heading font-bold text-[9px] cursor-pointer transition-colors ${qty === q ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"}`}>{q}</button>
          ))}
        </div>
        <div className="flex bg-surface-2 border border-border rounded-md overflow-hidden">
          {networks.map((n) => (
            <button key={n} onClick={() => setNetwork(n)} className={`px-2 py-1 border-none font-heading font-bold text-[9px] cursor-pointer transition-colors ${network === n ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"}`}>{n}</button>
          ))}
        </div>
        {/* Image toggle */}
        <button
          onClick={() => setWithImage(!withImage)}
          className={`px-2.5 py-1 rounded-md border font-heading font-bold text-[9px] cursor-pointer transition-colors ${withImage ? "border-purple-500/50 bg-purple-500/15 text-purple-400" : "border-border text-dim hover:text-muted-foreground"}`}
        >
          🖼️ Com Imagem IA
        </button>
      </div>

      {/* Image style selector */}
      {withImage && (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 border-b border-border bg-surface-1/50 flex-shrink-0">
          <span className="text-[9px] text-dim font-heading font-bold">Estilo:</span>
          <div className="flex gap-1 flex-wrap">
            {imageStyles.map((s) => (
              <button key={s} onClick={() => setImageStyle(s)} className={`px-2 py-0.5 rounded-full text-[8.5px] cursor-pointer transition-colors ${imageStyle === s ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-surface-2 border border-border text-dim hover:text-muted-foreground"}`}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3.5 scrollbar-thin">
        {activeView === "criar" && (
          <>
            {/* Prompt */}
            <div className="bg-surface-1 border border-border rounded-xl p-3 transition-colors focus-within:border-primary/30">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva o post que você quer criar..."
                className="w-full bg-transparent border-none text-foreground text-[13px] font-body leading-relaxed resize-none outline-none min-h-[64px] max-h-[160px] placeholder:text-dim"
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              />
              <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                <div className="flex gap-1 flex-wrap">
                  {chips.map((chip) => (
                    <button key={chip} onClick={() => setPrompt((p) => (p ? p + " " + chip : chip))} className="px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted-foreground text-[9.5px] cursor-pointer transition-colors hover:border-border hover:text-foreground whitespace-nowrap">{chip}</button>
                  ))}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-none bg-green-700 text-foreground font-heading font-extrabold text-[11px] cursor-pointer transition-colors hover:bg-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <><span className="w-3 h-3 border-2 border-white/25 border-t-white rounded-full animate-spin" /> Gerando...</>
                  ) : (
                    <><span>✨</span> Gerar {withImage ? "+ Imagem" : ""}</>
                  )}
                </button>
              </div>
            </div>

            {/* Results or empty state */}
            {posts.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
                {posts.map((post, i) => (
                  <PostCard
                    key={i}
                    post={post}
                    index={i}
                    isSelected={selectedPostIndex === i}
                    onSelect={() => onSelectPost(i)}
                    format={format}
                    onGenerateImage={() => handleGenerateImageForPost(i)}
                    isGeneratingImage={generatingImageIdx === i}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-2.5 py-8">
                <div className="text-[42px] opacity-40">✨</div>
                <div className="font-heading text-[17px] font-black text-muted-foreground">IA pronta para criar</div>
                <p className="text-[11px] text-dim leading-relaxed max-w-xs">
                  Escreva o que você quer — promoção, dica, lançamento, carrossel. Ative "Com Imagem IA" para gerar visuais automáticos.
                </p>
              </div>
            )}
          </>
        )}

        {activeView === "massa" && (
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-surface-1 border border-border rounded-xl p-3">
              <div className="font-heading text-sm font-black mb-2">⚡ Geração em Massa</div>
              <textarea
                value={bulkPrompt}
                onChange={(e) => setBulkPrompt(e.target.value)}
                placeholder="Descreva o tema geral dos posts..."
                className="w-full bg-surface-2 border border-border rounded-md text-foreground text-xs p-2 outline-none font-body leading-relaxed resize-y min-h-[80px] mb-2 focus:border-primary/30 placeholder:text-dim"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Quantidade:</span>
                <input type="number" value={bulkQty} onChange={(e) => setBulkQty(Number(e.target.value))} min={1} max={10} className="w-12 bg-surface-2 border border-border rounded-[5px] text-foreground text-xs px-1.5 py-1 text-center outline-none" />
                <span className="text-[10px] text-muted-foreground">posts</span>
                <button onClick={handleBulkGenerate} disabled={isGenerating} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border-none bg-green-700 text-foreground font-heading font-bold text-[9.5px] cursor-pointer transition-colors hover:bg-primary disabled:opacity-50">
                  {isGenerating ? "Gerando..." : "⚡ Gerar Tudo"}
                </button>
              </div>
            </div>
            {posts.length > 0 ? (
              <div className="mt-4 flex flex-col gap-2">
                {posts.map((post, i) => (
                  <div key={i} onClick={() => onSelectPost(i)} className={`bg-surface-1 border rounded-lg p-3 cursor-pointer transition-colors ${selectedPostIndex === i ? "border-primary" : "border-border hover:border-border"}`}>
                    <div className="flex items-start gap-2">
                      <span className="font-heading text-[9px] font-extrabold text-dim bg-surface-2 border border-border rounded px-1.5 py-0.5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold mb-1">{post.title}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-2">{post.caption}</div>
                        <div className="text-[9.5px] text-primary mt-1 truncate">{post.hashtags}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center py-8 text-center gap-2">
                <p className="text-[11px] text-dim">Configure a estratégia e clique em Gerar Tudo</p>
              </div>
            )}
          </div>
        )}

        {activeView === "agenda" && (
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-surface-1 border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))} className="bg-transparent border border-border rounded-[5px] text-muted-foreground px-2 py-0.5 cursor-pointer text-[13px] transition-colors hover:text-foreground">‹</button>
                <span className="font-heading text-sm font-black flex-1">{monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))} className="bg-transparent border border-border rounded-[5px] text-muted-foreground px-2 py-0.5 cursor-pointer text-[13px] transition-colors hover:text-foreground">›</button>
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {dayNames.map((d) => (
                  <div key={d} className="text-center font-heading text-[7.5px] font-extrabold tracking-[0.1em] uppercase text-dim py-1">{d}</div>
                ))}
                {getDaysInMonth(calMonth).map((d, i) => (
                  <div key={i} className={`bg-surface-2 border border-border rounded-[5px] min-h-[60px] p-1 cursor-pointer transition-colors hover:border-border ${d.today ? "border-primary/40" : ""}`}>
                    <div className={`text-[10px] font-semibold mb-0.5 ${d.off ? "opacity-25" : ""}`}>{d.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "referencias" && (
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-surface-1 border border-border rounded-xl p-4">
              <div className="font-heading text-sm font-black mb-3">📌 Referências de Conteúdo</div>
              <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                Cole URLs de posts, perfis ou sites que você admira. A IA vai analisar o estilo, tom e estratégias para inspirar seu conteúdo.
              </p>
              <ReferenceInput brand={brand} />
            </div>
          </div>
        )}

        {activeView === "blogs" && <BlogView brand={brand} />}
        {activeView === "textos" && <TextView brand={brand} />}
        {activeView === "apresentacoes" && <PresentationView brand={brand} />}
        {activeView === "dossie" && <DossieView brand={brand} />}
        {activeView === "suporte" && <SupportChat />}
      </div>
    </div>
  );
};

// References sub-component
import { analyzeProfile } from "@/lib/api";

const ReferenceInput = ({ brand }: { brand: BrandContext }) => {
  const [urls, setUrls] = useState<string[]>([""]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const addUrl = () => setUrls((prev) => [...prev, ""]);
  const updateUrl = (i: number, val: string) => setUrls((prev) => prev.map((u, idx) => (idx === i ? val : u)));
  const removeUrl = (i: number) => setUrls((prev) => prev.filter((_, idx) => idx !== i));

  const analyzeAll = async () => {
    const validUrls = urls.filter((u) => u.trim());
    if (!validUrls.length) return;
    setIsAnalyzing(true);
    const results: any[] = [];
    for (const url of validUrls) {
      try {
        const analysis = await analyzeProfile(url);
        results.push({ url, ...analysis });
      } catch {
        results.push({ url, error: true });
      }
    }
    setAnalyses(results);
    setIsAnalyzing(false);
    toast({ title: "📌 Referências analisadas!", description: `${results.filter((r) => !r.error).length} perfis analisados.` });
  };

  return (
    <div>
      {urls.map((url, i) => (
        <div key={i} className="flex gap-1.5 mb-1.5">
          <input
            value={url}
            onChange={(e) => updateUrl(i, e.target.value)}
            placeholder="https://instagram.com/perfil"
            className="flex-1 bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none focus:border-primary/30 placeholder:text-dim"
          />
          {urls.length > 1 && (
            <button onClick={() => removeUrl(i)} className="px-2 text-dim hover:text-red-400 text-xs cursor-pointer">✕</button>
          )}
        </div>
      ))}
      <div className="flex gap-1.5 mt-2">
        <button onClick={addUrl} className="px-3 py-1.5 rounded-[5px] border border-dashed border-dim text-dim text-[9.5px] cursor-pointer hover:border-primary hover:text-primary">+ Adicionar URL</button>
        <button onClick={analyzeAll} disabled={isAnalyzing} className="px-3 py-1.5 rounded-[5px] border-none bg-green-700 text-foreground font-heading font-bold text-[9.5px] cursor-pointer hover:bg-primary disabled:opacity-50">
          {isAnalyzing ? "Analisando..." : "🔍 Analisar Referências"}
        </button>
      </div>

      {analyses.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {analyses.map((a, i) => (
            <div key={i} className="bg-surface-2 border border-border rounded-lg p-3">
              {a.error ? (
                <div className="text-[10px] text-red-400">Erro ao analisar: {a.url}</div>
              ) : (
                <>
                  <div className="font-heading text-xs font-extrabold mb-1">{a.name}</div>
                  <p className="text-[9.5px] text-muted-foreground mb-2">{a.description}</p>
                  <div className="flex gap-1 flex-wrap mb-2">
                    {a.colors?.map((c: string, ci: number) => (
                      <div key={ci} className="w-5 h-5 rounded border border-border" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                  {a.themes?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-1">
                      {a.themes.map((t: string, ti: number) => (
                        <span key={ti} className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[8px]">{t}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-[9px] text-dim mt-1">Tom: {a.tone} | Setor: {a.sector}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CenterCanvas;
