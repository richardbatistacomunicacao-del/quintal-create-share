import { useState } from "react";
import type { Post, BrandContext } from "@/types/content";
import { generateCaption } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface RightSidebarProps {
  selectedPost: Post | null;
  selectedPostIndex: number | null;
  brand: BrandContext;
  onUpdatePost: (index: number, updated: Post) => void;
  posts: Post[];
}

const RightSidebar = ({ selectedPost, selectedPostIndex, brand, onUpdatePost, posts }: RightSidebarProps) => {
  const [activeTab, setActiveTab] = useState("editar");
  const [isLoadingCaption, setIsLoadingCaption] = useState(false);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  const { toast } = useToast();

  const tabs = [
    { id: "editar", label: "EDITAR" },
    { id: "legenda", label: "LEGENDA" },
    { id: "agendar", label: "AGENDAR" },
    { id: "exportar", label: "EXPORTAR" },
  ];

  const handleCaptionAction = async (action: "regenerate" | "hook" | "aida" | "pas") => {
    if (!selectedPost || selectedPostIndex === null) return;
    setIsLoadingCaption(true);
    try {
      const result = await generateCaption(action, selectedPost.title, selectedPost.caption, brand);
      onUpdatePost(selectedPostIndex, { ...selectedPost, caption: result });
      toast({ title: "✅ Legenda atualizada!" });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro", variant: "destructive" });
    } finally {
      setIsLoadingCaption(false);
    }
  };

  const handleRegenerateHashtags = async () => {
    if (!selectedPost || selectedPostIndex === null) return;
    setIsLoadingHashtags(true);
    try {
      const result = await generateCaption("hashtags", selectedPost.title + " " + selectedPost.caption, undefined, brand);
      onUpdatePost(selectedPostIndex, { ...selectedPost, hashtags: result });
      toast({ title: "✅ Hashtags atualizadas!" });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro", variant: "destructive" });
    } finally {
      setIsLoadingHashtags(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "📋 Copiado!" });
  };

  return (
    <aside className="bg-surface-1 border-l border-border flex flex-col overflow-hidden">
      <div className="flex border-b border-border flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-1 border-none font-heading font-bold text-[8.5px] tracking-[0.06em] cursor-pointer transition-colors text-center ${
              activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-dim hover:text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === "editar" && (
          <>
            {selectedPost ? (
              <div className="p-2.5">
                <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">Preview</div>
                {/* Preview thumbnail */}
                <div className="w-full aspect-[4/5] rounded-lg mb-3 flex flex-col items-center justify-center p-4 text-center" style={{ backgroundColor: selectedPost.bgColor || "#1C1E22" }}>
                  <div className="font-heading font-extrabold text-base leading-tight mb-2" style={{ color: selectedPost.textColor || "#fff" }}>{selectedPost.title}</div>
                  <div className="text-[10px] opacity-80" style={{ color: selectedPost.textColor || "#fff" }}>{selectedPost.hook}</div>
                </div>

                <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">Conteúdo</div>
                <input
                  value={selectedPost.title}
                  onChange={(e) => selectedPostIndex !== null && onUpdatePost(selectedPostIndex, { ...selectedPost, title: e.target.value })}
                  className="w-full bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none font-body mb-1.5 focus:border-primary/30"
                  placeholder="Título"
                />
                <input
                  value={selectedPost.hook}
                  onChange={(e) => selectedPostIndex !== null && onUpdatePost(selectedPostIndex, { ...selectedPost, hook: e.target.value })}
                  className="w-full bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none font-body mb-1.5 focus:border-primary/30"
                  placeholder="Hook"
                />
                <input
                  value={selectedPost.cta}
                  onChange={(e) => selectedPostIndex !== null && onUpdatePost(selectedPostIndex, { ...selectedPost, cta: e.target.value })}
                  className="w-full bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none font-body mb-1.5 focus:border-primary/30"
                  placeholder="CTA"
                />

                <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2 mt-3">Estilo</div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">Fundo</span>
                  <input type="color" value={selectedPost.bgColor || "#1C1E22"} onChange={(e) => selectedPostIndex !== null && onUpdatePost(selectedPostIndex, { ...selectedPost, bgColor: e.target.value })} className="w-7 h-6 rounded border border-border cursor-pointer p-0" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">Texto</span>
                  <input type="color" value={selectedPost.textColor || "#FFFFFF"} onChange={(e) => selectedPostIndex !== null && onUpdatePost(selectedPostIndex, { ...selectedPost, textColor: e.target.value })} className="w-7 h-6 rounded border border-border cursor-pointer p-0" />
                </div>

                {selectedPost.slides && selectedPost.slides.length > 0 && (
                  <>
                    <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2 mt-3">Slides ({selectedPost.slides.length})</div>
                    <div className="flex flex-col gap-1.5">
                      {selectedPost.slides.map((slide, i) => (
                        <div key={i} className="bg-surface-2 border border-border rounded-[5px] p-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-heading text-[8px] font-extrabold text-dim">{i + 1}</span>
                          </div>
                          <textarea
                            value={slide}
                            onChange={(e) => {
                              if (selectedPostIndex !== null && selectedPost.slides) {
                                const newSlides = [...selectedPost.slides];
                                newSlides[i] = e.target.value;
                                onUpdatePost(selectedPostIndex, { ...selectedPost, slides: newSlides });
                              }
                            }}
                            className="w-full bg-transparent border-none text-foreground text-[10px] outline-none font-body resize-none min-h-[40px]"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-5 text-center gap-2 min-h-[300px]">
                <div className="text-3xl opacity-30">🎨</div>
                <p className="text-[11px] text-dim leading-relaxed">Clique em um post gerado para editar aqui</p>
              </div>
            )}
          </>
        )}

        {activeTab === "legenda" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">Legenda</div>
            <textarea
              value={selectedPost?.caption || ""}
              onChange={(e) => {
                if (selectedPost && selectedPostIndex !== null) {
                  onUpdatePost(selectedPostIndex, { ...selectedPost, caption: e.target.value });
                }
              }}
              placeholder="Gere um post primeiro..."
              className="w-full bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none font-body resize-y min-h-[100px] leading-relaxed focus:border-primary/30 placeholder:text-dim"
            />
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {[
                { id: "regenerate" as const, label: "⟳ Regerar" },
                { id: "hook" as const, label: "🪝 Hook" },
                { id: "aida" as const, label: "AIDA" },
                { id: "pas" as const, label: "PAS" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleCaptionAction(btn.id)}
                  disabled={isLoadingCaption || !selectedPost}
                  className="flex-1 py-1.5 rounded-[5px] border border-border text-muted-foreground font-heading font-bold text-[8.5px] cursor-pointer transition-colors text-center hover:border-border hover:text-foreground whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {isLoadingCaption && (
              <div className="flex items-center gap-2 mt-2 text-[10px] text-primary">
                <span className="w-3 h-3 border-2 border-primary/25 border-t-primary rounded-full animate-spin" />
                Gerando legenda com IA...
              </div>
            )}

            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2 mt-4">Hashtags</div>
            <textarea
              value={selectedPost?.hashtags || ""}
              onChange={(e) => {
                if (selectedPost && selectedPostIndex !== null) {
                  onUpdatePost(selectedPostIndex, { ...selectedPost, hashtags: e.target.value });
                }
              }}
              placeholder="#hashtags"
              className="w-full bg-surface-2 border border-border rounded-[5px] text-primary text-[10px] px-2 py-1.5 outline-none font-body resize-y min-h-[38px] focus:border-primary/30 placeholder:text-dim"
            />
            <div className="flex gap-1 mt-1.5">
              <button onClick={handleRegenerateHashtags} disabled={isLoadingHashtags || !selectedPost} className="flex-1 py-1.5 rounded-[5px] border border-border text-muted-foreground font-heading font-bold text-[8.5px] cursor-pointer transition-colors text-center hover:text-foreground disabled:opacity-40">
                {isLoadingHashtags ? "..." : "⟳ Regerar"}
              </button>
              <button onClick={() => selectedPost && copyToClipboard(selectedPost.hashtags)} disabled={!selectedPost} className="flex-1 py-1.5 rounded-[5px] border border-border text-muted-foreground font-heading font-bold text-[8.5px] cursor-pointer transition-colors text-center hover:text-foreground disabled:opacity-40">
                📋 Copiar tudo
              </button>
            </div>
          </div>
        )}

        {activeTab === "agendar" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">Agendar Post</div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0">Data</span>
              <input type="date" className="flex-1 bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-1.5 py-1 outline-none focus:border-primary/30" />
            </div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0">Hora</span>
              <input type="time" className="flex-1 bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-1.5 py-1 outline-none focus:border-primary/30" />
            </div>
            <div className="text-[10px] text-muted-foreground mb-2">Redes:</div>
            <div className="flex gap-1 flex-wrap mb-3">
              {["📸 Instagram", "👍 Facebook", "🎵 TikTok", "💼 LinkedIn"].map((net) => (
                <button key={net} className="px-2 py-0.5 rounded-full border border-border text-dim text-[9.5px] cursor-pointer transition-colors hover:bg-primary/10 hover:border-primary/30 hover:text-primary">{net}</button>
              ))}
            </div>
            <button className="w-full py-2 rounded-md border border-amber/30 bg-amber/10 text-amber font-heading font-extrabold text-[10px] cursor-pointer transition-colors hover:bg-amber hover:text-amber-foreground">
              📅 Agendar Este Post
            </button>

            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2 mt-4">Melhores Horários</div>
            <div className="text-[10px] text-muted-foreground leading-relaxed space-y-1">
              <p>📸 Instagram: 18h–21h</p>
              <p>🎵 TikTok: 19h–23h</p>
              <p>💼 LinkedIn: 8h–10h, 17h–18h</p>
              <p>👍 Facebook: 13h–16h</p>
            </div>
          </div>
        )}

        {activeTab === "exportar" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">Post Atual</div>
            <div className="grid grid-cols-2 gap-1 mb-4">
              <button onClick={() => selectedPost && copyToClipboard(selectedPost.caption + "\n\n" + selectedPost.hashtags)} className="py-2 rounded-md border border-border text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors text-center hover:text-foreground">📋 Copiar Texto</button>
              <button onClick={() => {
                if (!posts.length) return;
                const allText = posts.map((p, i) => `--- Post ${i + 1} ---\n${p.title}\n\n${p.caption}\n\n${p.hashtags}\n\nCTA: ${p.cta}`).join("\n\n");
                copyToClipboard(allText);
              }} className="py-2 rounded-md border border-border text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors text-center hover:text-foreground">📄 Copiar Todos</button>
            </div>

            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">Formato de Saída</div>
            <div className="text-[10px] text-muted-foreground leading-relaxed space-y-1">
              <p>Feed 4:5 → 1080×1350px</p>
              <p>Quadrado → 1080×1080px</p>
              <p>Story 9:16 → 1080×1920px</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
