import { useState, useRef } from "react";
import type { BrandContext, ProfileAnalysis } from "@/types/content";
import { analyzeProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { downloadAnalysisAsText } from "@/lib/downloadAnalysis";
import { supabase } from "@/integrations/supabase/client";

interface LeftSidebarProps {
  brand: BrandContext;
  setBrand: React.Dispatch<React.SetStateAction<BrandContext>>;
  profileAnalysis: ProfileAnalysis | null;
  onProfileAnalyzed: (analysis: ProfileAnalysis) => void;
}

const LeftSidebar = ({ brand, setBrand, profileAnalysis, onProfileAnalyzed }: LeftSidebarProps) => {
  const [activeTab, setActiveTab] = useState("marca");
  const [scanUrl, setScanUrl] = useState("");
  const [searchImg, setSearchImg] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [analysisTab, setAnalysisTab] = useState<"geral" | "swot" | "empatia" | "story">("geral");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const tabs = [
    { id: "marca", label: "MARCA" },
    { id: "scanner", label: "SCANNER" },
    { id: "fotos", label: "FOTOS" },
    { id: "biblioteca", label: "BIBLIOTECA" },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBrand((b) => ({ ...b, logo: url }));
    }
  };

  const addColor = () => {
    setBrand((b) => ({ ...b, colors: [...b.colors, "#888888"] }));
  };

  const handleScan = async () => {
    if (!scanUrl.trim()) return;
    setIsScanning(true);
    try {
      const analysis = await analyzeProfile(scanUrl);
      onProfileAnalyzed(analysis);
      setAnalysisTab("geral");
      toast({ title: "✅ Perfil analisado!", description: `${analysis.name} - ${analysis.sector}` });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro ao analisar", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const tagColorMap: Record<string, string> = {
    green: "bg-green-500/10 text-green-400",
    amber: "bg-amber-500/10 text-amber-400",
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <aside className="bg-surface-1 border-r border-border flex flex-col overflow-hidden">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-1 border-none font-heading font-bold text-[9px] tracking-[0.06em] cursor-pointer transition-colors text-center ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-dim hover:text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === "marca" && (
          <div className="flex flex-col">
            <div className="p-2.5 border-b border-border">
              <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">Cores</div>
              <div className="flex gap-1 items-center flex-wrap">
                {brand.colors.map((color, i) => (
                  <div key={i} className="w-[26px] h-[26px] rounded-[5px] cursor-pointer relative border-2 border-transparent hover:border-foreground flex-shrink-0" style={{ backgroundColor: color }}>
                    <input type="color" value={color} onChange={(e) => {
                      const newColors = [...brand.colors];
                      newColors[i] = e.target.value;
                      setBrand((b) => ({ ...b, colors: newColors }));
                    }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                ))}
                <button onClick={addColor} className="w-[26px] h-[26px] rounded-[5px] border border-dashed border-dim text-dim text-[15px] cursor-pointer flex items-center justify-center transition-colors hover:border-primary hover:text-primary flex-shrink-0">+</button>
              </div>
            </div>

            <div className="p-2.5 border-b border-border">
              <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">Identidade</div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Nome</span>
                <input value={brand.name} onChange={(e) => setBrand((b) => ({ ...b, name: e.target.value }))} placeholder="Sua marca" className="flex-1 bg-surface-3 border border-border rounded text-foreground text-[10px] px-1.5 py-0.5 outline-none focus:border-primary/30" />
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Setor</span>
                <input value={brand.sector} onChange={(e) => setBrand((b) => ({ ...b, sector: e.target.value }))} placeholder="Ex: restaurante" className="flex-1 bg-surface-3 border border-border rounded text-foreground text-[10px] px-1.5 py-0.5 outline-none focus:border-primary/30" />
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Tom</span>
                <select value={brand.tone} onChange={(e) => setBrand((b) => ({ ...b, tone: e.target.value }))} className="flex-1 bg-surface-3 border border-border rounded text-foreground text-[10px] px-1 py-0.5 outline-none focus:border-primary/30">
                  {["Profissional", "Descontraído", "Inspiracional", "Urgente / Vendas", "Educativo", "Luxo / Premium", "Jovem / Gen Z"].map((t) => (<option key={t}>{t}</option>))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Fonte</span>
                <select value={brand.font} onChange={(e) => setBrand((b) => ({ ...b, font: e.target.value }))} className="flex-1 bg-surface-3 border border-border rounded text-foreground text-[10px] px-1 py-0.5 outline-none focus:border-primary/30">
                {[
                    "Inter", "Syne", "Poppins", "Montserrat", "Oswald", "Playfair Display",
                    "Roboto", "Open Sans", "Lato", "Raleway", "Nunito", "Ubuntu", "Merriweather",
                    "PT Sans", "Rubik", "Work Sans", "Fira Sans", "Quicksand", "Karla", "Cabin",
                    "Source Sans Pro", "Mulish", "Barlow", "Manrope", "DM Sans", "Space Grotesk",
                    "Outfit", "Plus Jakarta Sans", "Lexend", "Urbanist", "Satoshi", "General Sans",
                    "Clash Display", "Cabinet Grotesk", "Switzer", "Archivo", "Bricolage Grotesque",
                    "Geist", "Supreme", "Onest", "Red Hat Display", "Figtree", "Albert Sans",
                    "Be Vietnam Pro", "Instrument Sans", "Wix Madefor Display", "Noto Sans",
                    "IBM Plex Sans", "Libre Franklin", "Titillium Web", "Exo 2", "Prompt",
                    "Josefin Sans", "Comfortaa", "Righteous", "Fredoka", "Baloo 2",
                    "Bebas Neue", "Anton", "Russo One", "Teko", "Rajdhani", "Orbitron",
                    "Press Start 2P", "Silkscreen", "VT323", "Major Mono Display",
                    "Playfair Display SC", "Cormorant Garamond", "Libre Baskerville", "Lora",
                    "EB Garamond", "Crimson Text", "Spectral", "Noto Serif", "Bitter",
                    "Vollkorn", "Cardo", "Georgia", "Times New Roman", "Garamond",
                    "Dancing Script", "Pacifico", "Great Vibes", "Sacramento", "Satisfy",
                    "Caveat", "Kalam", "Patrick Hand", "Indie Flower", "Shadows Into Light",
                    "Permanent Marker", "Rock Salt", "Gloria Hallelujah",
                    "JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono", "Space Mono",
                    "Courier Prime", "Anonymous Pro", "Inconsolata",
                    "Abril Fatface", "Alfa Slab One", "Passion One", "Black Ops One",
                    "Bungee", "Monoton", "Audiowide", "Faster One"
                  ].map((f) => (<option key={f}>{f}</option>))}
                </select>
              </div>
            </div>

            <div className="p-2.5 border-b border-border">
              <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">Logo</div>
              <div onClick={() => logoInputRef.current?.click()} className="bg-surface-3 border border-dashed border-dim rounded-md h-10 flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary">
                {brand.logo ? (<img src={brand.logo} className="w-full h-full object-contain" alt="Logo" />) : (<span className="text-[10px] text-dim">+ Upload Logo</span>)}
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "scanner" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">Analisar Perfil / Site</div>
            <div className="flex gap-1.5 mb-2">
              <input value={scanUrl} onChange={(e) => setScanUrl(e.target.value)} placeholder="Cole uma URL ou @perfil..." className="flex-1 bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none focus:border-primary/30 placeholder:text-dim" onKeyDown={(e) => e.key === "Enter" && handleScan()} />
              <button onClick={handleScan} disabled={isScanning || !scanUrl.trim()} className="px-2.5 py-1.5 rounded-[5px] border-none bg-green-700 text-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors hover:bg-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                {isScanning ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                  </span>
                ) : "Analisar"}
              </button>
            </div>
            <p className="text-[9.5px] text-muted-foreground leading-relaxed mb-3">
              A IA extrai identidade visual completa: cores, fontes, temas, tom de voz, + análise SWOT, mapa de empatia e storytelling.
            </p>

            {profileAnalysis && (
              <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
                {/* Analysis tabs */}
                <div className="flex border-b border-border">
                  {([
                    { id: "geral" as const, label: "Geral" },
                    { id: "swot" as const, label: "SWOT" },
                    { id: "empatia" as const, label: "Empatia" },
                    { id: "story" as const, label: "Story" },
                  ]).map((t) => (
                    <button key={t.id} onClick={() => setAnalysisTab(t.id)} className={`flex-1 py-1.5 border-none font-heading font-bold text-[8px] cursor-pointer transition-colors text-center ${analysisTab === t.id ? "text-primary bg-primary/5" : "text-dim hover:text-muted-foreground"}`}>{t.label}</button>
                  ))}
                </div>

                <div className="p-2.5">
                  {analysisTab === "geral" && (
                    <>
                      <div className="font-heading text-xs font-extrabold mb-1">{profileAnalysis.name}</div>
                      <p className="text-[9.5px] text-muted-foreground leading-relaxed mb-2">{profileAnalysis.description}</p>
                      
                      {/* Colors */}
                      <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-1">Cores</div>
                      <div className="flex gap-1 flex-wrap mb-2">
                        {profileAnalysis.colors?.map((c, i) => (
                          <div key={i} className="w-6 h-6 rounded border border-border cursor-pointer" style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>

                      {/* Fonts */}
                      {profileAnalysis.fonts?.length > 0 && (
                        <>
                          <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-1">Fontes</div>
                          <div className="flex gap-1 flex-wrap mb-2">
                            {profileAnalysis.fonts.map((f, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[8.5px] text-muted-foreground">{f}</span>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Themes */}
                      {profileAnalysis.themes?.length > 0 && (
                        <>
                          <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-1">Temas</div>
                          <div className="flex gap-1 flex-wrap mb-2">
                            {profileAnalysis.themes.map((t, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[8px]">{t}</span>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Topics */}
                      {profileAnalysis.topics?.length > 0 && (
                        <>
                          <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-1">Assuntos</div>
                          <div className="flex gap-1 flex-wrap mb-2">
                            {profileAnalysis.topics.map((t, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[8px]">{t}</span>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Tags */}
                      <div className="flex gap-1 flex-wrap mb-2">
                        {profileAnalysis.tags?.map((tag, i) => (
                          <span key={i} className={`text-[8.5px] px-1.5 py-0.5 rounded-full ${tagColorMap[tag.category] || tagColorMap.green}`}>
                            {tag.label}
                          </span>
                        ))}
                      </div>

                      {/* Post suggestions */}
                      {profileAnalysis.postSuggestions && (
                        <div className="mt-2">
                          <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-1">Sugestões de Posts</div>
                          {profileAnalysis.postSuggestions.map((s, i) => (
                            <div key={i} className="text-[9.5px] text-muted-foreground py-0.5">• {s}</div>
                          ))}
                        </div>
                      )}

                      {profileAnalysis.contentStrategy && (
                        <div className="mt-2">
                          <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-1">Estratégia</div>
                          <p className="text-[9.5px] text-muted-foreground leading-relaxed">{profileAnalysis.contentStrategy}</p>
                        </div>
                      )}

                      {profileAnalysis.audienceInsights && (
                        <div className="mt-2">
                          <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-1">Público-Alvo</div>
                          <p className="text-[9.5px] text-muted-foreground leading-relaxed">{profileAnalysis.audienceInsights}</p>
                        </div>
                      )}
                    </>
                  )}

                  {analysisTab === "swot" && profileAnalysis.swot && (
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: "strengths" as const, label: "💪 Forças", color: "text-green-400 bg-green-500/10" },
                        { key: "weaknesses" as const, label: "⚠️ Fraquezas", color: "text-red-400 bg-red-500/10" },
                        { key: "opportunities" as const, label: "🚀 Oportunidades", color: "text-blue-400 bg-blue-500/10" },
                        { key: "threats" as const, label: "🔥 Ameaças", color: "text-amber-400 bg-amber-500/10" },
                      ]).map(({ key, label, color }) => (
                        <div key={key} className={`rounded-lg p-2 ${color.split(" ")[1]}`}>
                          <div className={`font-heading text-[8px] font-extrabold mb-1.5 ${color.split(" ")[0]}`}>{label}</div>
                          {profileAnalysis.swot![key].map((item, i) => (
                            <div key={i} className="text-[9px] text-muted-foreground py-0.5 leading-snug">• {item}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {analysisTab === "empatia" && profileAnalysis.empathyMap && (
                    <div className="space-y-2">
                      {([
                        { key: "thinks" as const, label: "🧠 Pensa", emoji: "💭" },
                        { key: "feels" as const, label: "❤️ Sente", emoji: "💗" },
                        { key: "says" as const, label: "💬 Diz", emoji: "🗣️" },
                        { key: "does" as const, label: "🏃 Faz", emoji: "⚡" },
                        { key: "pains" as const, label: "😣 Dores", emoji: "🔴" },
                        { key: "gains" as const, label: "🎯 Ganhos", emoji: "🟢" },
                      ]).map(({ key, label }) => (
                        <div key={key}>
                          <div className="font-heading text-[8px] font-extrabold text-dim mb-1">{label}</div>
                          <div className="flex flex-col gap-0.5">
                            {profileAnalysis.empathyMap![key].map((item, i) => (
                              <div key={i} className="text-[9px] text-muted-foreground leading-snug">• {item}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {analysisTab === "story" && profileAnalysis.storytelling && (
                    <div className="space-y-2">
                      {([
                        { key: "hero" as const, label: "🦸 Herói (Cliente)", color: "border-blue-500/30" },
                        { key: "problem" as const, label: "😰 Problema", color: "border-red-500/30" },
                        { key: "guide" as const, label: "🧭 Guia (Marca)", color: "border-green-500/30" },
                        { key: "plan" as const, label: "📋 Plano", color: "border-amber-500/30" },
                        { key: "callToAction" as const, label: "📢 Chamada para Ação", color: "border-purple-500/30" },
                        { key: "success" as const, label: "🏆 Sucesso", color: "border-green-500/30" },
                        { key: "failure" as const, label: "💀 Fracasso Evitado", color: "border-red-500/30" },
                      ]).map(({ key, label, color }) => (
                        <div key={key} className={`border-l-2 ${color} pl-2`}>
                          <div className="font-heading text-[8px] font-extrabold text-dim mb-0.5">{label}</div>
                          <p className="text-[9.5px] text-muted-foreground leading-relaxed">{profileAnalysis.storytelling![key]}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setBrand(prev => ({
                        ...prev,
                        name: profileAnalysis.name || prev.name,
                        sector: profileAnalysis.sector || prev.sector,
                        tone: profileAnalysis.tone || prev.tone,
                        colors: profileAnalysis.colors?.length ? profileAnalysis.colors : prev.colors,
                        font: profileAnalysis.fonts?.[0] || prev.font,
                      }));
                      toast({ title: "✅ Marca atualizada!", description: "Dados do perfil aplicados à marca." });
                    }}
                    className="w-full mt-3 py-1.5 rounded-[5px] border border-primary/30 bg-primary/10 text-primary font-heading font-bold text-[9.5px] cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    ✓ Aplicar à Marca
                  </button>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => downloadAnalysisAsText(profileAnalysis, scanUrl)}
                      className="flex-1 py-1.5 rounded-[5px] border border-border text-muted-foreground font-heading font-bold text-[8.5px] cursor-pointer transition-colors hover:text-foreground text-center"
                    >
                      ⬇️ Download
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) return;
                          await supabase.from("saved_analyses").insert({
                            user_id: user.id,
                            url: scanUrl,
                            analysis_data: profileAnalysis as any,
                          });
                          toast({ title: "💾 Análise salva!" });
                        } catch {
                          toast({ title: "Erro ao salvar", variant: "destructive" });
                        }
                      }}
                      className="flex-1 py-1.5 rounded-[5px] border border-border text-muted-foreground font-heading font-bold text-[8.5px] cursor-pointer transition-colors hover:text-foreground text-center"
                    >
                      💾 Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "fotos" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">Buscar Imagem</div>
            <div className="flex gap-1.5 mb-3">
              <input value={searchImg} onChange={(e) => setSearchImg(e.target.value)} placeholder="Buscar fotos..." className="flex-1 bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none focus:border-primary/30 placeholder:text-dim" />
              <button className="px-2.5 py-1.5 rounded-[5px] border-none bg-surface-4 text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors hover:text-foreground flex-shrink-0">🔍</button>
            </div>
            <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">Suas Fotos</div>
            <button className="w-full py-1.5 rounded-[5px] border border-dashed border-dim text-dim text-[10px] cursor-pointer transition-colors hover:border-primary hover:text-primary relative">
              📁 Upload de imagem
              <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" />
            </button>
          </div>
        )}

        {activeTab === "biblioteca" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2 flex items-center justify-between">
              <span>Salvos</span>
              <button className="font-heading text-[8px] font-bold border-none bg-transparent text-primary cursor-pointer">Limpar</button>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <p className="text-[11px] text-dim">Posts salvos aparecem aqui</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;
