import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Zap, Pin, Calendar, BookOpen, PenTool, Presentation, FileText, ChevronDown } from "lucide-react";

interface TopBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  mobilePanel: "left" | "center" | "right";
  setMobilePanel: (p: "left" | "center" | "right") => void;
}

const mainTabs = [
  { id: "criar", label: "Criar", icon: Sparkles },
  { id: "massa", label: "Em Massa", icon: Zap },
  { id: "referencias", label: "Ref", icon: Pin },
  { id: "agenda", label: "Agenda", icon: Calendar },
];

const contentTabs = [
  { id: "blogs", label: "Blogs & Artigos", icon: BookOpen },
  { id: "textos", label: "Textos & Copy", icon: PenTool },
  { id: "apresentacoes", label: "Apresentações", icon: Presentation },
  { id: "dossie", label: "Dossiê Estratégico", icon: FileText },
];

const TopBar = ({ activeView, onViewChange, mobilePanel, setMobilePanel }: TopBarProps) => {
  const { user, signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const activeContentTab = contentTabs.find(t => t.id === activeView);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-12 bg-surface-1 border-b border-border flex items-center px-2 md:px-3.5 gap-2 z-50">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-gradient-to-br from-primary to-green-700 rounded-lg flex items-center justify-center text-sm">
          🌿
        </div>
        <span className="font-heading font-black text-sm tracking-tight hidden sm:inline">
          Quintal<span className="text-primary">Posts</span>
        </span>
      </div>

      <div className="w-px h-5 bg-border flex-shrink-0 hidden sm:block" />

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        <div className="flex bg-surface-2 border border-border rounded-lg p-0.5">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] border-none font-heading font-bold text-[10px] tracking-wider cursor-pointer transition-all whitespace-nowrap ${
                activeView === tab.id ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content dropdown */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-heading font-bold text-[10px] tracking-wider cursor-pointer transition-all whitespace-nowrap ${
              activeContentTab
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-surface-2 border-border text-dim hover:text-muted-foreground"
            }`}
          >
            {activeContentTab ? (
              <>
                <activeContentTab.icon className="w-3 h-3" />
                {activeContentTab.label}
              </>
            ) : (
              <>
                <FileText className="w-3 h-3" />
                Conteúdo
              </>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
          </button>
          {moreOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-surface-1 border border-border rounded-xl shadow-xl p-1.5 z-50">
              {contentTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { onViewChange(tab.id); setMoreOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left font-heading font-bold text-[11px] cursor-pointer transition-colors ${
                    activeView === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile panel switcher */}
      <div className="flex md:hidden bg-surface-2 border border-border rounded-lg p-0.5">
        {[
          { id: "left" as const, label: "☰" },
          { id: "center" as const, label: "✨" },
          { id: "right" as const, label: "🎨" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobilePanel(tab.id)}
            className={`px-3 py-1 rounded-[5px] border-none font-heading font-bold text-sm cursor-pointer transition-all ${
              mobilePanel === tab.id ? "bg-surface-4 text-foreground" : "text-dim"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile view switcher (when on center) */}
      {mobilePanel === "center" && (
        <div className="flex md:hidden bg-surface-2 border border-border rounded-lg p-0.5 ml-1">
          {[
            { id: "criar", label: "✨" },
            { id: "massa", label: "⚡" },
            { id: "referencias", label: "📌" },
            { id: "blogs", label: "📝" },
            { id: "dossie", label: "📋" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`px-2 py-1 rounded-[5px] border-none text-xs cursor-pointer ${
                activeView === tab.id ? "bg-surface-4 text-foreground" : "text-dim"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        {user && (
          <>
            <span className="text-[9px] text-dim hidden lg:inline truncate max-w-[120px]">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/50 text-muted-foreground font-heading font-bold text-[9px] cursor-pointer transition-colors hover:text-foreground whitespace-nowrap"
            >
              Sair
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
