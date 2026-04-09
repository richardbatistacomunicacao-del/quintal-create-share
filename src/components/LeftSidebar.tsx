import { useState, useRef } from "react";
import type { BrandContext, ProfileAnalysis } from "@/types/content";
import { analyzeProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
      toast({ title: "✅ Perfil analisado!", description: `${analysis.name} - ${analysis.sector}` });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Erro ao analisar", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const tagColorMap: Record<string, string> = {
    green: "bg-primary/10 text-primary",
    amber: "bg-amber/10 text-amber",
    blue: "bg-blue/10 text-blue",
    purple: "bg-purple/10 text-purple",
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
                  {["Inter", "Syne", "Poppins", "Montserrat", "Oswald", "Playfair Display"].map((f) => (<option key={f}>{f}</option>))}
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
              <input value={scanUrl} onChange={(e) => setScanUrl(e.target.value)} placeholder="Cole uma URL..." className="flex-1 bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none focus:border-primary/30 placeholder:text-dim" onKeyDown={(e) => e.key === "Enter" && handleScan()} />
              <button onClick={handleScan} disabled={isScanning || !scanUrl.trim()} className="px-2.5 py-1.5 rounded-[5px] border-none bg-green-700 text-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors hover:bg-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                {isScanning ? "..." : "Ir"}
              </button>
            </div>
            <p className="text-[9.5px] text-muted-foreground leading-relaxed mb-3">
              Cole qualquer URL: site, Instagram, Facebook, loja online. A IA lê o conteúdo e extrai identidade visual, tom de voz e sugere posts personalizados.
            </p>

            {/* Analysis result */}
            {profileAnalysis && (
              <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
                <div className="p-2.5">
                  <div className="font-heading text-xs font-extrabold mb-1">{profileAnalysis.name}</div>
                  <p className="text-[9.5px] text-muted-foreground leading-relaxed mb-2">{profileAnalysis.description}</p>
                  <div className="flex gap-1 flex-wrap mb-2">
                    {profileAnalysis.tags?.map((tag, i) => (
                      <span key={i} className={`text-[8.5px] px-1.5 py-0.5 rounded-full ${tagColorMap[tag.category] || tagColorMap.green}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
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
                  <button
                    onClick={() => {
                      setBrand(prev => ({
                        ...prev,
                        name: profileAnalysis.name || prev.name,
                        sector: profileAnalysis.sector || prev.sector,
                        tone: profileAnalysis.tone || prev.tone,
                        colors: profileAnalysis.colors?.length ? profileAnalysis.colors : prev.colors,
                      }));
                      toast({ title: "✅ Marca atualizada!", description: "Dados do perfil aplicados à marca." });
                    }}
                    className="w-full mt-2 py-1.5 rounded-[5px] border border-primary/30 bg-primary/10 text-primary font-heading font-bold text-[9.5px] cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    ✓ Aplicar + Gerar Posts
                  </button>
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
