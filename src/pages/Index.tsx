import { useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import LeftSidebar from "@/components/LeftSidebar";
import CenterCanvas from "@/components/CenterCanvas";
import RightSidebar from "@/components/RightSidebar";
import type { Post, BrandContext, ProfileAnalysis } from "@/types/content";

const Index = () => {
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

  return (
    <div className="grid grid-rows-[48px_1fr] h-screen overflow-hidden">
      <TopBar activeView={activeView} onViewChange={setActiveView} />
      <div className="grid grid-cols-[250px_1fr_300px] h-[calc(100vh-48px)] overflow-hidden">
        <LeftSidebar
          brand={brand}
          setBrand={setBrand}
          profileAnalysis={profileAnalysis}
          onProfileAnalyzed={handleProfileAnalyzed}
        />
        <CenterCanvas
          activeView={activeView}
          brand={brand}
          posts={posts}
          selectedPostIndex={selectedPostIndex}
          onSelectPost={setSelectedPostIndex}
          onPostsGenerated={handlePostsGenerated}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          onUpdatePost={handleUpdatePost}
        />
        <RightSidebar
          selectedPost={selectedPost}
          selectedPostIndex={selectedPostIndex}
          brand={brand}
          onUpdatePost={handleUpdatePost}
          posts={posts}
        />
      </div>
    </div>
  );
};

export default Index;
