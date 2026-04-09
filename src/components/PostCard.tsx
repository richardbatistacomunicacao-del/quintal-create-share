import type { Post } from "@/types/content";

interface PostCardProps {
  post: Post;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  format: string;
  onGenerateImage?: () => void;
  isGeneratingImage?: boolean;
}

const PostCard = ({ post, index, isSelected, onSelect, format, onGenerateImage, isGeneratingImage }: PostCardProps) => {
  const aspectClass = format === "1:1" ? "aspect-square" : format === "story" ? "aspect-[9/16]" : "aspect-[4/5]";

  // Branded color palette for variety
  const brandColors = [
    "from-[#0D1117] to-[#161B22]",
    "from-[#E84D1A] to-[#C43D12]",
    "from-[#1A1A2E] to-[#16213E]",
    "from-[#0F0F0F] to-[#1C1C1C]",
    "from-[#F5F0E8] to-[#E8E0D0]",
  ];
  const bgGradient = brandColors[index % brandColors.length];
  const isLightBg = index % 5 === 4;

  return (
    <div
      onClick={onSelect}
      className={`bg-surface-1 border rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group ${
        isSelected ? "border-primary shadow-[0_0_0_2px] shadow-primary/20" : "border-border hover:border-border"
      }`}
    >
      <div className={`${aspectClass} relative overflow-hidden bg-gradient-to-br ${bgGradient}`}>
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        {post.imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />}
        
        {/* Header bar like brandsdecoded */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 z-20">
          <span className={`text-[7px] font-heading font-bold tracking-[0.15em] uppercase ${isLightBg && !post.imageUrl ? "text-black/50" : "text-white/40"}`}>
            Powered by QuintalPosts
          </span>
          <span className={`text-[7px] font-heading font-bold ${isLightBg && !post.imageUrl ? "text-black/50" : "text-white/40"}`}>
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Main content - editorial typography */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
          <h3 
            className="font-heading font-black text-lg md:text-xl leading-[1.1] tracking-tight drop-shadow-lg"
            style={{ color: post.textColor || (isLightBg && !post.imageUrl ? "#0D0D0D" : "#FFFFFF") }}
          >
            {post.title.split(" ").map((word, wi) => {
              // Highlight key words in accent color like brandsdecoded
              const highlights = ["como", "por que", "novo", "morreu", "segredo", "estratégia", "grátis", "agora"];
              const isHighlight = highlights.some(h => word.toLowerCase().includes(h));
              return isHighlight ? (
                <span key={wi} className="text-[hsl(var(--destructive))]">{word} </span>
              ) : (
                <span key={wi}>{word} </span>
              );
            })}
          </h3>
          {post.hook && (
            <p className="text-[10px] mt-2 leading-relaxed opacity-80 drop-shadow font-body" style={{ color: post.textColor || (isLightBg && !post.imageUrl ? "#333" : "#FFFFFF") }}>
              {post.hook}
            </p>
          )}
          {post.cta && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-[hsl(var(--destructive))] text-[9px] font-heading font-black">→</span>
              <span className="text-[9px] font-heading font-black uppercase tracking-wider" style={{ color: post.textColor || (isLightBg && !post.imageUrl ? "#0D0D0D" : "#FFFFFF") }}>
                {post.cta}
              </span>
            </div>
          )}
          {post.slides && post.slides.length > 1 && (
            <div className="flex gap-1 mt-2">
              {post.slides.map((_, si) => (
                <div key={si} className={`w-1.5 h-1.5 rounded-full ${si === 0 ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Image generation buttons */}
        {!post.imageUrl && onGenerateImage && (
          <button onClick={(e) => { e.stopPropagation(); onGenerateImage(); }} disabled={isGeneratingImage} className="absolute bottom-2 right-2 z-20 px-2 py-1 rounded-md bg-purple-600/80 text-white text-[8px] font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 backdrop-blur-sm">
            {isGeneratingImage ? "Gerando..." : "🖼️ Imagem IA"}
          </button>
        )}
        {post.imageUrl && onGenerateImage && (
          <button onClick={(e) => { e.stopPropagation(); onGenerateImage(); }} disabled={isGeneratingImage} className="absolute top-2 right-2 z-20 px-2 py-1 rounded-md bg-black/60 text-white text-[8px] font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 backdrop-blur-sm">
            {isGeneratingImage ? "..." : "⟳ Nova"}
          </button>
        )}
      </div>
      <div className="p-2.5">
        <div className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-body">{post.caption.slice(0, 120)}...</div>
        <div className="text-[9px] text-primary mt-1 truncate font-heading font-bold">{post.hashtags}</div>
      </div>
    </div>
  );
};

export default PostCard;
