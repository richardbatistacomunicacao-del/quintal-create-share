import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Zap, Pin, Calendar, BookOpen, PenTool, Presentation, FileText, MessageCircle } from "lucide-react";

interface TopBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  mobilePanel: "left" | "center" | "right";
  setMobilePanel: (p: "left" | "center" | "right") => void;
}

const allTabs = [
  { id: "criar", label: "Criar", icon: Sparkles },
  { id: "massa", label: "Em Massa", icon: Zap },
  { id: "referencias", label: "Ref", icon: Pin },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "blogs", label: "Blog", icon: BookOpen },
  { id: "textos", label: "Textos", icon: PenTool },
  { id: "apresentacoes", label: "Slides", icon: Presentation },
  { id: "dossie", label: "Dossiê", icon: FileText },
  { id: "suporte", label: "Suporte", icon: MessageCircle },
];

const TopBar = ({ activeView, onViewChange, mobilePanel, setMobilePanel }: TopBarProps) => {
  const { user, signOut } = useAuth();

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

      {/* Desktop nav - all tabs visible */}
      <div className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-thin">
        <div className="flex bg-surface-2 border border-border rounded-lg p-0.5">
          {allTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-[5px] border-none font-heading font-bold text-[9px] tracking-wider cursor-pointer transition-all whitespace-nowrap ${
                activeView === tab.id ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
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
        <div className="flex md:hidden bg-surface-2 border border-border rounded-lg p-0.5 ml-1 overflow-x-auto">
          {allTabs.slice(0, 6).map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`px-2 py-1 rounded-[5px] border-none text-xs cursor-pointer whitespace-nowrap ${
                activeView === tab.id ? "bg-surface-4 text-foreground" : "text-dim"
              }`}
            >
              <tab.icon className="w-3 h-3" />
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
