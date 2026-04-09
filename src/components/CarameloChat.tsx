import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Minimize2 } from "lucide-react";
import carameloAvatar from "@/assets/caramelo-avatar.png";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

type Msg = { role: "user" | "assistant"; content: string };

const CarameloChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Oi! 🐕 Eu sou o **Caramelo**, seu assistente aqui no QuintalPosts! Todo quintal tem um no Brasil, né?\n\nPosso te ajudar com:\n• Criar posts incríveis\n• Analisar perfis\n• Montar dossiês estratégicos\n• Tirar qualquer dúvida\n\nÉ só falar! 🐾" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Erro na resposta");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > newMessages.length) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Ops! 🐕 Tive um probleminha. Tenta de novo?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-[9999] w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform group"
          title="Falar com o Caramelo 🐕"
        >
          <img src={carameloAvatar} alt="Caramelo" className="w-10 h-10 rounded-full object-cover" />
          {/* Notification dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-[9999] w-[360px] h-[520px] max-h-[80vh] bg-surface-1 border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-border flex-shrink-0">
            <div className="relative">
              <img src={carameloAvatar} alt="Caramelo" className="w-9 h-9 rounded-full object-cover border-2 border-primary/30" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface-1" />
            </div>
            <div className="flex-1">
              <div className="font-heading font-black text-sm flex items-center gap-1.5">
                🐕 Caramelo
              </div>
              <div className="text-[9px] text-primary font-heading font-bold">
                Online 24h • Seu assistente fiel
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-surface-3 border border-border flex items-center justify-center cursor-pointer hover:bg-surface-4 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "assistant" && (
                  <img src={carameloAvatar} alt="Caramelo" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1" />
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed font-body ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-surface-3 text-foreground rounded-bl-sm"
                }`}>
                  {msg.content.split("\n").map((line, li) => (
                    <span key={li}>
                      {line.split(/(\*\*.*?\*\*)/).map((part, pi) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return <strong key={pi} className="font-bold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                      {li < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-2">
                <img src={carameloAvatar} alt="Caramelo" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1" />
                <div className="bg-surface-3 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          <div className="flex gap-1 px-3 py-1.5 border-t border-border/50 flex-shrink-0 overflow-x-auto scrollbar-thin">
            {["Como criar posts?", "Analisar perfil", "Dossiê estratégico", "Dicas de IG"].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="px-2 py-1 rounded-full bg-surface-3 border border-border text-[9px] text-muted-foreground font-heading font-bold whitespace-nowrap cursor-pointer hover:text-foreground hover:border-primary/30 transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Fala comigo, parceiro! 🐾"
                className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-[12px] text-foreground outline-none focus:border-primary/30 placeholder:text-dim font-body"
              />
              <button
                onClick={send}
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 rounded-xl bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarameloChat;
