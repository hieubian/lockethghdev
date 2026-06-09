import React from "react";
import { Palette, Smile, ChevronLeft, Crown } from "lucide-react";
import CustomCrushTool from "./tools/CustomCrushTool";
import CustomEmojiTool from "./tools/CustomEmojiTool";
import GoldUnlockTool from "./tools/GoldUnlockTool";
import { useAuthStore } from "@/stores";
import { useApp } from "@/context/AppContext";

export default function ToolsLocket() {
  const user = useAuthStore((s) => s.user);
  const { navigation } = useApp();
  const { isToolsOpen, setIsToolsOpen, toolsActiveTab, setToolsActiveTab } = navigation;

  const toolsList = [
    {
      key: "gold-unlock",
      label: "Mở Khóa Gold",
      icon: <Crown />,
      content: <GoldUnlockTool hideHeader={true} onClose={() => setIsToolsOpen(false)} />,
    },
    {
      key: "custom-crush",
      label: "Tùy chỉnh Crush",
      icon: <Palette />,
      content: <CustomCrushTool hideHeader={true} onClose={() => setIsToolsOpen(false)} />,
    },
    {
      key: "custom-emoji",
      label: "Tùy Chỉnh Emoji",
      icon: <Smile />,
      content: <CustomEmojiTool hideHeader={true} onClose={() => setIsToolsOpen(false)} />,
    },
  ];

  // If toolsActiveTab is invalid, default to first
  const activeTabKey = toolsList.find((t) => t.key === toolsActiveTab) ? toolsActiveTab : toolsList[0].key;

  const handleTabChange = (key) => {
    setToolsActiveTab(key);
  };

  const visibleTools = toolsList.filter((tool) => tool.visible !== false);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-transform duration-500 bg-base-100 text-base-content font-sans overflow-hidden pb-safe pt-safe ${
        isToolsOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-0 md:p-3">
        {/* Header & Mobile Tabs */}
        <div className="flex flex-col gap-2 p-3 md:p-0 mb-2 md:mb-4 border-b border-base-200 md:border-none shadow-sm md:shadow-none">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsToolsOpen(false)} 
              className="btn btn-circle btn-ghost"
            >
              <ChevronLeft size={28} />
            </button>
            <h1 className="text-2xl font-bold">Công cụ</h1>
          </div>

          {/* Mobile Top Tabs */}
          <div className="md:hidden w-full py-2">
            <div className="flex w-full gap-2 px-2">
              {visibleTools.map((tool) => (
                <button
                  key={tool.key}
                  onClick={() => handleTabChange(tool.key)}
                  className={`flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-full text-[13px] sm:text-sm font-bold transition-all whitespace-nowrap shadow-sm border
                    ${
                      activeTabKey === tool.key
                        ? "bg-[#00c3ff] text-white border-[#00c3ff]"
                        : "bg-base-200 text-base-content/70 border-base-300 hover:bg-base-300"
                    }`}
                >
                  {React.cloneElement(tool.icon, { size: 16 })}
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="relative flex flex-col md:flex-row w-full flex-1 overflow-hidden mx-auto md:gap-6 py-0 md:py-3">
          {/* Sidebar Desktop */}
          <div className="hidden md:block w-1/4">
            <div className="flex flex-col gap-2 bg-base-100 p-4 rounded-2xl shadow-sm border border-base-200">
              {visibleTools.map((tool) => (
                <button
                  key={tool.key}
                  onClick={() => handleTabChange(tool.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all
                    ${
                      activeTabKey === tool.key
                        ? "bg-[#00c3ff] text-white shadow-md border-none"
                        : "hover:bg-base-200/50 text-base-content/80 hover:text-base-content"
                    }`}
                >
                  {React.cloneElement(tool.icon, { size: 20 })}
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-base-100 w-full h-full pb-6 md:pb-0">
            {visibleTools.find((t) => t.key === activeTabKey)?.content || (
              <div className="p-4 text-center text-base-content/60 font-medium mt-10">🔍 Không tìm thấy nội dung</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
