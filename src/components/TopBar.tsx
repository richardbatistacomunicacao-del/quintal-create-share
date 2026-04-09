import { useState } from "react";

interface TopBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const TopBar = ({ activeView, onViewChange }: TopBarProps) => {
  return (
    <header className="h-12 bg-surface-1 border-b border-border flex items-center px-3.5 gap-2 z-50">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-gradient-to-br from-primary to-green-700 rounded-lg flex items-center justify-center text-sm">
          🌿
        </div>
        <span className="font-heading font-black text-sm tracking-tight">
          Quintal<span className="text-primary">Posts</span>
        </span>
      </div>

      <div className="w-px h-5 bg-border flex-shrink-0" />

      <div className="flex bg-surface-2 border border-border rounded-lg p-0.5">
        {[
          { id: "criar", label: "✨ Criar" },
          { id: "massa", label: "⚡ Em Massa" },
          { id: "referencias", label: "📌 Referências" },
          { id: "agenda", label: "📅 Agenda" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`px-3 py-1 rounded-[5px] border-none font-heading font-bold text-[10px] tracking-wider cursor-pointer transition-all whitespace-nowrap ${
              activeView === tab.id
                ? "bg-surface-4 text-foreground"
                : "text-dim hover:text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border/50 text-muted-foreground font-heading font-bold text-[9.5px] tracking-wider cursor-pointer transition-colors hover:border-border hover:text-foreground whitespace-nowrap">
          ☰ Marca
        </button>
        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border/50 text-muted-foreground font-heading font-bold text-[9.5px] tracking-wider cursor-pointer transition-colors hover:border-border hover:text-foreground whitespace-nowrap">
          ⚙️ Editar
        </button>
        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-primary/35 bg-primary/10 text-primary font-heading font-bold text-[9.5px] tracking-wider cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground whitespace-nowrap">
          ⬇️ ZIP
        </button>
      </div>
    </header>
  );
};

export default TopBar;
