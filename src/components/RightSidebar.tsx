import { useState } from "react";

const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState("editar");

  const tabs = [
    { id: "editar", label: "EDITAR" },
    { id: "legenda", label: "LEGENDA" },
    { id: "agendar", label: "AGENDAR" },
    { id: "exportar", label: "EXPORTAR" },
  ];

  return (
    <aside className="bg-surface-1 border-l border-border flex flex-col overflow-hidden">
      <div className="flex border-b border-border flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-1 border-none font-heading font-bold text-[8.5px] tracking-[0.06em] cursor-pointer transition-colors text-center ${
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
        {activeTab === "editar" && (
          <div className="flex flex-col items-center justify-center flex-1 p-5 text-center gap-2 min-h-[300px]">
            <div className="text-3xl opacity-30">🎨</div>
            <p className="text-[11px] text-dim leading-relaxed">
              Clique em um post gerado para editar aqui
            </p>
          </div>
        )}

        {activeTab === "legenda" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">
              Legenda
            </div>
            <textarea
              placeholder="Legenda aparecerá aqui após gerar..."
              className="w-full bg-surface-2 border border-border rounded-[5px] text-foreground text-[11px] px-2 py-1.5 outline-none font-body resize-y min-h-[80px] leading-relaxed focus:border-primary/30 placeholder:text-dim"
            />
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {["⟳ Regerar", "🪝 Hook", "AIDA", "PAS"].map((btn) => (
                <button
                  key={btn}
                  className="flex-1 py-1.5 rounded-[5px] border border-border text-muted-foreground font-heading font-bold text-[8.5px] cursor-pointer transition-colors text-center hover:border-border hover:text-foreground whitespace-nowrap"
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2 mt-4">
              Hashtags
            </div>
            <textarea
              placeholder="#hashtags"
              className="w-full bg-surface-2 border border-border rounded-[5px] text-primary text-[10px] px-2 py-1.5 outline-none font-body resize-y min-h-[38px] focus:border-primary/30 placeholder:text-dim"
            />
            <div className="flex gap-1 mt-1.5">
              <button className="flex-1 py-1.5 rounded-[5px] border border-border text-muted-foreground font-heading font-bold text-[8.5px] cursor-pointer transition-colors text-center hover:text-foreground">
                ⟳ Regerar
              </button>
              <button className="flex-1 py-1.5 rounded-[5px] border border-border text-muted-foreground font-heading font-bold text-[8.5px] cursor-pointer transition-colors text-center hover:text-foreground">
                📋 Copiar tudo
              </button>
            </div>

            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2 mt-4">
              Slides (Carrossel)
            </div>
            <button className="w-full py-1.5 rounded-[5px] border border-dashed border-dim text-dim font-heading font-bold text-[9px] cursor-pointer transition-colors hover:border-primary hover:text-primary">
              + Adicionar Slide
            </button>
          </div>
        )}

        {activeTab === "agendar" && (
          <div className="p-2.5">
            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">
              Agendar Post
            </div>
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
                <button
                  key={net}
                  className="px-2 py-0.5 rounded-full border border-border text-dim text-[9.5px] cursor-pointer transition-colors hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                >
                  {net}
                </button>
              ))}
            </div>
            <button className="w-full py-2 rounded-md border-none bg-amber/10 border border-amber/30 text-amber font-heading font-extrabold text-[10px] cursor-pointer transition-colors hover:bg-amber hover:text-amber-foreground">
              📅 Agendar Este Post
            </button>

            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2 mt-4">
              Melhores Horários
            </div>
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
            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">
              Post Atual
            </div>
            <div className="grid grid-cols-2 gap-1 mb-4">
              <button className="py-2 rounded-md border border-border text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors text-center hover:border-border hover:text-foreground">
                ⬇️ PNG HD
              </button>
              <button className="py-2 rounded-md border border-border text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors text-center hover:border-border hover:text-foreground">
                📋 Copiar Texto
              </button>
            </div>

            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">
              Todos os Posts
            </div>
            <div className="grid grid-cols-2 gap-1 mb-4">
              <button className="py-2 rounded-md border border-border text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors text-center hover:border-border hover:text-foreground">
                📦 ZIP (PNG)
              </button>
              <button className="py-2 rounded-md border border-border text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors text-center hover:border-border hover:text-foreground">
                📄 TXT (legendas)
              </button>
            </div>

            <div className="font-heading text-[8px] font-extrabold tracking-[0.1em] uppercase text-dim mb-2">
              Formato de Saída
            </div>
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
