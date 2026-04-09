import { useState } from "react";
import TopBar from "@/components/TopBar";
import LeftSidebar from "@/components/LeftSidebar";
import CenterCanvas from "@/components/CenterCanvas";
import RightSidebar from "@/components/RightSidebar";

const Index = () => {
  const [activeView, setActiveView] = useState("criar");

  return (
    <div className="grid grid-rows-[48px_1fr] h-screen overflow-hidden">
      <TopBar activeView={activeView} onViewChange={setActiveView} />
      <div className="grid grid-cols-[250px_1fr_300px] h-[calc(100vh-48px)] overflow-hidden">
        <LeftSidebar />
        <CenterCanvas activeView={activeView} />
        <RightSidebar />
      </div>
    </div>
  );
};

export default Index;
