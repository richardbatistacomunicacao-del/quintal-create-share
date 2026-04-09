import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Zap, Pin, Calendar, BookOpen, PenTool, Presentation, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TopBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  mobilePanel: "left" | "center" | "right";
  setMobilePanel: (p: "left" | "center" | "right") => void;
}

const mainTabs = [
  { id: "criar", label: "Criar", icon: Sparkles, tip: "Criar posts individuais com IA" },
  { id: "massa", label: "Em Massa", icon: Zap, tip: "Gerar vários posts de uma vez" },
  { id: "referencias", label: "Ref", icon: Pin, tip: "Analisar referências de conteúdo" },
  { id: "agenda", label: "Agenda", icon: Calendar, tip: "Calendário de publicações" },
];

const contentTabs = [
  { id: "blogs", label: "Blog", icon: BookOpen, tip: "Gerar blogs e artigos otimizados para SEO" },
  { id: "textos", label: "Textos", icon: PenTool, tip: "Copywriting: e-mails, anúncios, scripts" },
  { id: "apresentacoes", label: "Slides", icon: Presentation, tip: "Criar apresentações profissionais" },
  { id: "dossie", label: "Dossiê", icon: FileText, tip: "Dossiê estratégico com SWOT e plano de ação" },
];

const TopBar = ({ activeView, onViewChange, mobilePanel, setMobilePanel }: TopBarProps) => {
  const { user, signOut } = useAuth();

  const renderTab = (tab: typeof mainTabs[0]) => (
    <TooltipProvider key={tab.id} delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onViewChange(tab.id)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[5px] border-none font-heading font-bold text-[9px] tracking-wider cursor-pointer transition-all whitespace-nowrap ${
              activeView === tab.id ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[10px]">
          {tab.tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

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
      <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-thin">
        <div className="flex bg-surface-2 border border-border rounded-lg p-0.5">
          {mainTabs.map(renderTab)}
        </div>
        <div className="w-px h-4 bg-border flex-shrink-0" />
        <div className="flex bg-surface-2 border border-border rounded-lg p-0.5">
          {contentTabs.map(renderTab)}
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

      {/* Mobile view switcher */}
      {mobilePanel === "center" && (
        <div className="flex md:hidden bg-surface-2 border border-border rounded-lg p-0.5 ml-1 overflow-x-auto">
          {[...mainTabs, ...contentTabs].slice(0, 6).map((tab) => (
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
