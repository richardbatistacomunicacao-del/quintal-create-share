import type { Post } from "@/types/content";

interface PostCardProps {
  post: Post;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  format: string;
}

const PostCard = ({ post, index, isSelected, onSelect, format }: PostCardProps) => {
  const aspectClass = format === "1:1" ? "aspect-square" : format === "story" ? "aspect-[9/16]" : "aspect-[4/5]";

  return (
    <div
      onClick={onSelect}
      className={`bg-surface-1 border rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 ${
        isSelected ? "border-primary shadow-[0_0_0_2px] shadow-primary/20" : "border-border hover:border-border"
      }`}
    >
      {/* Visual preview */}
      <div className={`${aspectClass} relative overflow-hidden`} style={{ backgroundColor: post.bgColor || "#1C1E22" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="font-heading font-extrabold text-sm leading-tight mb-2" style={{ color: post.textColor || "#FFFFFF" }}>
            {post.title}
          </div>
          {post.hook && (
            <div className="text-[10px] opacity-80 leading-relaxed" style={{ color: post.textColor || "#FFFFFF" }}>
              {post.hook}
            </div>
          )}
          {post.slides && post.slides.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[8px] px-1.5 py-0.5 rounded font-heading font-bold">
              {post.slides.length} slides
            </div>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="p-2">
        <div className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{post.caption.slice(0, 100)}...</div>
        <div className="text-[9px] text-primary mt-1 truncate">{post.hashtags}</div>
      </div>
    </div>
  );
};

export default PostCard;
