import { useState } from "react";

interface CenterCanvasProps {
  activeView: string;
}

const CenterCanvas = ({ activeView }: CenterCanvasProps) => {
  const [format, setFormat] = useState("4:5");
  const [qty, setQty] = useState("1");
  const [network, setNetwork] = useState("IG");
  const [prompt, setPrompt] = useState("");
  const [calMonth, setCalMonth] = useState(new Date());

  const formats = [
    { id: "4:5", label: "Feed 4:5" },
    { id: "1:1", label: "1:1" },
    { id: "story", label: "Story" },
    { id: "carousel", label: "🎠 Carrossel" },
  ];

  const quantities = ["1", "3", "5", "10"];
  const networks = ["IG", "TK", "LI", "FB"];
  const chips = ["Promoção", "Dica", "Depoimento", "Lançamento", "Antes/depois", "Bastidores", "Engajamento", "Tutorial"];

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

  return (
    <div className="flex flex-col overflow-hidden bg-background">
      {/* Format bar */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-border bg-surface-1 flex-shrink-0">
        <div className="flex bg-surface-2 border border-border rounded-md overflow-hidden">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`px-2.5 py-1 border-none font-heading font-bold text-[9px] cursor-pointer transition-colors ${
                format === f.id ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex bg-surface-2 border border-border rounded-md overflow-hidden">
          {quantities.map((q) => (
            <button
              key={q}
              onClick={() => setQty(q)}
              className={`px-2 py-1 border-none font-heading font-bold text-[9px] cursor-pointer transition-colors ${
                qty === q ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex bg-surface-2 border border-border rounded-md overflow-hidden">
          {networks.map((n) => (
            <button
              key={n}
              onClick={() => setNetwork(n)}
              className={`px-2 py-1 border-none font-heading font-bold text-[9px] cursor-pointer transition-colors ${
                network === n ? "bg-surface-4 text-foreground" : "text-dim hover:text-muted-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

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
              />
              <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                <div className="flex gap-1 flex-wrap">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setPrompt((p) => (p ? p + " " + chip : chip))}
                      className="px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted-foreground text-[9.5px] cursor-pointer transition-colors hover:border-border hover:text-foreground whitespace-nowrap"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-none bg-green-700 text-foreground font-heading font-extrabold text-[11px] cursor-pointer transition-colors hover:bg-primary flex-shrink-0">
                  <span>✨</span> Gerar
                </button>
              </div>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-2.5 py-8">
              <div className="text-[42px] opacity-40">✨</div>
              <div className="font-heading text-[17px] font-black text-muted-foreground">
                IA pronta para criar
              </div>
              <p className="text-[11px] text-dim leading-relaxed max-w-xs">
                Escreva o que você quer — promoção, dica, lançamento, carrossel. Quanto mais detalhe, melhor. Você também pode escanear seu perfil para criar posts totalmente personalizados.
              </p>
            </div>
          </>
        )}

        {activeView === "massa" && (
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-surface-1 border border-border rounded-xl p-3">
              <div className="font-heading text-sm font-black mb-2">⚡ Geração em Massa</div>
              <textarea
                placeholder="Descreva o tema geral dos posts..."
                className="w-full bg-surface-2 border border-border rounded-md text-foreground text-xs p-2 outline-none font-body leading-relaxed resize-y min-h-[80px] mb-2 focus:border-primary/30 placeholder:text-dim"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Quantidade:</span>
                <input
                  type="number"
                  defaultValue={5}
                  min={1}
                  max={50}
                  className="w-12 bg-surface-2 border border-border rounded-[5px] text-foreground text-xs px-1.5 py-1 text-center outline-none"
                />
                <span className="text-[10px] text-muted-foreground">posts</span>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border-none bg-green-700 text-foreground font-heading font-bold text-[9.5px] cursor-pointer transition-colors hover:bg-primary">
                  ⚡ Gerar Tudo
                </button>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 text-primary font-heading font-bold text-[9.5px] cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground">
                  ⬇️ ZIP
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center justify-center py-8 text-center gap-2">
              <p className="text-[11px] text-dim">Configure a estratégia e clique em Gerar Tudo</p>
            </div>
          </div>
        )}

        {activeView === "agenda" && (
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-surface-1 border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))}
                  className="bg-transparent border border-border rounded-[5px] text-muted-foreground px-2 py-0.5 cursor-pointer text-[13px] transition-colors hover:border-border hover:text-foreground"
                >
                  ‹
                </button>
                <span className="font-heading text-sm font-black flex-1">
                  {monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}
                </span>
                <button
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))}
                  className="bg-transparent border border-border rounded-[5px] text-muted-foreground px-2 py-0.5 cursor-pointer text-[13px] transition-colors hover:border-border hover:text-foreground"
                >
                  ›
                </button>
                <button className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-amber/30 bg-amber/10 text-amber font-heading font-bold text-[9.5px] cursor-pointer transition-colors hover:bg-amber hover:text-amber-foreground">
                  + Agendar
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {dayNames.map((d) => (
                  <div key={d} className="text-center font-heading text-[7.5px] font-extrabold tracking-[0.1em] uppercase text-dim py-1">
                    {d}
                  </div>
                ))}
                {getDaysInMonth(calMonth).map((d, i) => (
                  <div
                    key={i}
                    className={`bg-surface-2 border border-border rounded-[5px] min-h-[60px] p-1 cursor-pointer transition-colors hover:border-border ${
                      d.today ? "border-primary/40" : ""
                    }`}
                  >
                    <div className={`text-[10px] font-semibold mb-0.5 ${d.off ? "opacity-25" : ""}`}>
                      {d.day}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterCanvas;
