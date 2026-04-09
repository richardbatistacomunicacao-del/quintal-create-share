import { useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TopBar from "@/components/TopBar";
import LeftSidebar from "@/components/LeftSidebar";
import CenterCanvas from "@/components/CenterCanvas";
import RightSidebar from "@/components/RightSidebar";
import type { Post, BrandContext, ProfileAnalysis } from "@/types/content";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState("criar");
  const [brand, setBrand] = useState<BrandContext>({
    name: "",
    sector: "",
    tone: "Profissional",
    font: "Inter",
    colors: ["#22C55E", "#1C1E22", "#E2E5EE"],
    logo: null,
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"left" | "center" | "right">("center");

  const selectedPost = selectedPostIndex !== null ? posts[selectedPostIndex] : null;

  const handlePostsGenerated = useCallback((newPosts: Post[]) => {
    setPosts(newPosts);
    if (newPosts.length > 0 && selectedPostIndex === null) setSelectedPostIndex(0);
  }, [selectedPostIndex]);

  const handleUpdatePost = useCallback((index: number, updated: Post) => {
    setPosts(prev => prev.map((p, i) => i === index ? updated : p));
  }, []);

  const handleProfileAnalyzed = useCallback((analysis: ProfileAnalysis) => {
    setProfileAnalysis(analysis);
    setBrand(prev => ({
      ...prev,
      name: analysis.name || prev.name,
      sector: analysis.sector || prev.sector,
      tone: analysis.tone || prev.tone,
      colors: analysis.colors?.length ? analysis.colors : prev.colors,
      font: analysis.fonts?.[0] || prev.font,
    }));
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary/25 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-heading">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="grid grid-rows-[48px_1fr] h-screen overflow-hidden">
      <TopBar activeView={activeView} onViewChange={setActiveView} mobilePanel={mobilePanel} setMobilePanel={setMobilePanel} />
      <div className="h-[calc(100vh-48px)] overflow-hidden">
        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-[250px_1fr_300px] h-full">
          <LeftSidebar brand={brand} setBrand={setBrand} profileAnalysis={profileAnalysis} onProfileAnalyzed={handleProfileAnalyzed} />
          <CenterCanvas activeView={activeView} brand={brand} posts={posts} selectedPostIndex={selectedPostIndex} onSelectPost={setSelectedPostIndex} onPostsGenerated={handlePostsGenerated} isGenerating={isGenerating} setIsGenerating={setIsGenerating} onUpdatePost={handleUpdatePost} />
          <RightSidebar selectedPost={selectedPost} selectedPostIndex={selectedPostIndex} brand={brand} onUpdatePost={handleUpdatePost} posts={posts} />
        </div>
        {/* Mobile layout */}
        <div className="md:hidden h-full">
          {mobilePanel === "left" && <LeftSidebar brand={brand} setBrand={setBrand} profileAnalysis={profileAnalysis} onProfileAnalyzed={handleProfileAnalyzed} />}
          {mobilePanel === "center" && <CenterCanvas activeView={activeView} brand={brand} posts={posts} selectedPostIndex={selectedPostIndex} onSelectPost={(i) => { setSelectedPostIndex(i); setMobilePanel("right"); }} onPostsGenerated={handlePostsGenerated} isGenerating={isGenerating} setIsGenerating={setIsGenerating} onUpdatePost={handleUpdatePost} />}
          {mobilePanel === "right" && <RightSidebar selectedPost={selectedPost} selectedPostIndex={selectedPostIndex} brand={brand} onUpdatePost={handleUpdatePost} posts={posts} />}
        </div>
      </div>
    </div>
  );
};

export default Index;
