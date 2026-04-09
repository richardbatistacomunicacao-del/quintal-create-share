import { useState, useRef } from "react";

interface BrandState {
  name: string;
  sector: string;
  tone: string;
  font: string;
  colors: string[];
  logo: string | null;
}

const LeftSidebar = () => {
  const [activeTab, setActiveTab] = useState("marca");
  const [brand, setBrand] = useState<BrandState>({
    name: "",
    sector: "",
    tone: "Profissional",
    font: "Inter",
    colors: ["#22C55E", "#1C1E22", "#E2E5EE"],
    logo: null,
  });
  const [scanUrl, setScanUrl] = useState("");
  const [searchImg, setSearchImg] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

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
        {/* MARCA */}
        {activeTab === "marca" && (
          <div className="flex flex-col">
            <div className="p-2.5 border-b border-border">
              <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">
                Cores
              </div>
              <div className="flex gap-1 items-center flex-wrap">
                {brand.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-[26px] h-[26px] rounded-[5px] cursor-pointer relative border-2 border-transparent hover:border-foreground flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...brand.colors];
                        newColors[i] = e.target.value;
                        setBrand((b) => ({ ...b, colors: newColors }));
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                ))}
                <button
                  onClick={addColor}
                  className="w-[26px] h-[26px] rounded-[5px] border border-dashed border-dim text-dim text-[15px] cursor-pointer flex items-center justify-center transition-colors hover:border-primary hover:text-primary flex-shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-2.5 border-b border-border">
              <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">
                Identidade
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Nome</span>
                <input
                  value={brand.name}
                  onChange={(e) => setBrand((b) => ({ ...b, name: e.target.value }))}
                  placeholder="Sua marca"
                  className="flex-1 bg-surface-3 border border-border rounded text-foreground text-[10px] px-1.5 py-0.5 outline-none focus:border-primary/30"
                />
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Setor</span>
                <input
                  value={brand.sector}
                  onChange={(e) => setBrand((b) => ({ ...b, sector: e.target.value }))}
                  placeholder="Ex: restaurante"
                  className="flex-1 bg-surface-3 border border-border rounded text-foreground text-[10px] px-1.5 py-0.5 outline-none focus:border-primary/30"
                />
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Tom</span>
                <select
                  value={brand.tone}
                  onChange={(e) => setBrand((b) => ({ ...b, tone: e.target.value }))}
                  className="flex-1 bg-surface-3 border border-border rounded text-foreground text-[10px] px-1 py-0.5 outline-none focus:border-primary/30"
                >
                  {["Profissional", "Descontraído", "Inspiracional", "Urgente / Vendas", "Educativo", "Luxo / Premium", "Jovem / Gen Z"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Fonte</span>
                <select
                  value={brand.font}
                  onChange={(e) => setBrand((b) => ({ ...b, font: e.target.value }))}
                  className="flex-1 bg-surface-3 border border-border rounded text-foreground text-[10px] px-1 py-0.5 outline-none focus:border-primary/30"
                >
                  {["Inter", "Syne", "Poppins", "Montserrat", "Oswald", "Playfair Display"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-2.5 border-b border-border">
              <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">
                Logo
              </div>
              <div
                onClick={() => logoInputRef.current?.click()}
                className="bg-surface-3 border border-dashed border-dim rounded-md h-10 flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary"
              >
                {brand.logo ? (
                  <img src={brand.logo} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <span className="text-[10px] text-dim">+ Upload Logo</span>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* SCANNER */}
        {activeTab === "scanner" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">
              Analisar Perfil / Site
            </div>
            <div className="flex gap-1.5 mb-2">
              <input
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                placeholder="Cole uma URL..."
                className="flex-1 bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none focus:border-primary/30 placeholder:text-dim"
              />
              <button className="px-2.5 py-1.5 rounded-[5px] border-none bg-green-700 text-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors hover:bg-primary flex-shrink-0">
                Ir
              </button>
            </div>
            <p className="text-[9.5px] text-muted-foreground leading-relaxed">
              Cole qualquer URL: site, Instagram, Facebook, loja online. A IA lê o conteúdo e extrai identidade visual, tom de voz e sugere posts personalizados.
            </p>
          </div>
        )}

        {/* FOTOS */}
        {activeTab === "fotos" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">
              Buscar Imagem
            </div>
            <div className="flex gap-1.5 mb-3">
              <input
                value={searchImg}
                onChange={(e) => setSearchImg(e.target.value)}
                placeholder="Buscar fotos..."
                className="flex-1 bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none focus:border-primary/30 placeholder:text-dim"
              />
              <button className="px-2.5 py-1.5 rounded-[5px] border-none bg-surface-4 text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors hover:text-foreground flex-shrink-0">
                🔍
              </button>
            </div>
            <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2">
              Suas Fotos
            </div>
            <button className="w-full py-1.5 rounded-[5px] border border-dashed border-dim text-dim text-[10px] cursor-pointer transition-colors hover:border-primary hover:text-primary relative">
              📁 Upload de imagem
              <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" />
            </button>
          </div>
        )}

        {/* BIBLIOTECA */}
        {activeTab === "biblioteca" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.12em] uppercase text-dim mb-2 flex items-center justify-between">
              <span>Salvos</span>
              <button className="font-heading text-[8px] font-bold border-none bg-transparent text-primary cursor-pointer">
                Limpar
              </button>
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
