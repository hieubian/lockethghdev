import React, { useState, useEffect } from "react";
import { useOverlayDataStore } from "@/stores";
import { getCaptionStyle } from "@/helpers/styleHelpers";
import IconRenderer from "@/components/Overlay/icons/IconRenderer";
import { SonnerSuccess } from "@/components/ui/SonnerToast";
import { Palette, Image as ImageIcon, Type, Baseline, Link as LinkIcon } from "lucide-react";

const PRESET_PALETTES = [
  { name: "Locket Gold", top: "#FFD500", bottom: "#FFB000", text: "#000000" },
  { name: "Peach Milk", top: "#ffecd2", bottom: "#fcb69f", text: "#d94862" },
  { name: "Matcha", top: "#d4fc79", bottom: "#96e6a1", text: "#1a4d2e" },
  { name: "Baby Blue", top: "#e0c3fc", bottom: "#8ec5fc", text: "#1e3a8a" },
  { name: "Pinky", top: "#fbc2eb", bottom: "#a6c1ee", text: "#831843" },
  { name: "Lemonade", top: "#f6d365", bottom: "#fda085", text: "#7c2d12" },
  { name: "Lavender", top: "#e2d1c3", bottom: "#fdfcfb", text: "#4c1d95" },
  { name: "Cotton Candy", top: "#ff9a9e", bottom: "#fecfef", text: "#831843" },
  { name: "Mint", top: "#a1c4fd", bottom: "#c2e9fb", text: "#0c4a6e" },
  { name: "Warm Hug", top: "#ff9a9e", bottom: "#fecfef", text: "#831843" },
  { name: "Ocean", top: "#0ea5e9", bottom: "#2563eb", text: "#ffffff" },
  { name: "Neon Violet", top: "#8b5cf6", bottom: "#6d28d9", text: "#ffffff" },
  { name: "Dark Mode", top: "#3f3f46", bottom: "#18181b", text: "#ffffff" },
];

export default function CustomCrushTool({ onClose, hideHeader }) {
  const updateCrushConfig = useOverlayDataStore((s) => s.updateCrushConfig);
  const sectionOverlays = useOverlayDataStore((s) => s.sectionOverlays);

  const crushConfig = useOverlayDataStore((s) => s.crushConfig);

  const [config, setConfig] = useState({
    colortop: crushConfig?.colortop || "#D4FC79",
    colorbottom: crushConfig?.colorbottom || "#96E6A1",
    text: crushConfig?.text || "vụ án trái tym",
    text_color: crushConfig?.text_color || "#1A4D2E",
    icon_url: crushConfig?.icon?.url || crushConfig?.icon?.data || "https://files.catbox.moe/rt893c.gif"
  });

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyPalette = (palette) => {
    setConfig(prev => ({
      ...prev,
      colortop: palette.top,
      colorbottom: palette.bottom,
      text_color: palette.text
    }));
  };

  const handleSave = () => {
    updateCrushConfig({
      ...(crushConfig || {}),
      colortop: config.colortop,
      colorbottom: config.colorbottom,
      background: { colors: [config.colortop, config.colorbottom] },
      text: config.text,
      text_color: config.text_color,
      icon: { type: "image", data: config.icon_url, source: "url" }
    });
    SonnerSuccess("Đã lưu cấu hình", "Cấu hình Crush đã được lưu thành công!");
    if (onClose) onClose();
  };

  const previewData = {
    background: { colors: [config.colortop, config.colorbottom] },
    text_color: config.text_color,
    icon: { type: "image", url: config.icon_url, data: config.icon_url },
    text: config.text
  };

  return (
    <div className={`flex flex-col w-full pb-10 font-sans`}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between sticky top-0 z-20 bg-base-100 py-3 px-4 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Palette className="text-primary w-5 h-5" />
            Tùy chỉnh Crush
          </h2>
          {onClose && (
            <button onClick={onClose} className="btn btn-ghost btn-sm gap-1 text-primary font-medium px-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Quay lại
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto w-full">

      <p className="text-[11px] text-base-content/80 px-1 leading-relaxed">
        Cách đổi icon: Truy cập <a href="https://catbox.moe" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">catbox.moe</a>, tải ảnh hoặc GIF của bạn lên. Copy link kết quả (phải có đuôi .png, .jpg, hoặc .gif) và dán vào ô bên dưới.
      </p>

      {/* Live Preview */}
      <div className="bg-base-200 p-4 rounded-3xl flex items-center justify-center border-2 border-base-300 relative overflow-hidden h-28 shadow-inner">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558636508-e0db3814bd1d')] bg-cover bg-center opacity-40 blur-[2px]"></div>
        <div className="relative z-10 flex items-center bg-white/50 backdrop-blur-2xl py-2 pl-4 pr-4 rounded-4xl max-w-full shadow-lg transition-all duration-300"
             style={getCaptionStyle(previewData.background, previewData.text_color)}>
          <IconRenderer icon={previewData.icon} />
          <span className="font-semibold px-2 truncate" style={{ color: config.text_color }}>
            {config.text}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Nội dung Section */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-base-content/70 flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
            <Type size={14} /> Nội dung
          </h3>
          
          <div className="space-y-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-medium text-sm">Chữ hiển thị</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors" 
                value={config.text}
                onChange={(e) => handleChange("text", e.target.value)}
              />
            </div>
            
            <div className="form-control">
              <label className="label py-1 flex items-center justify-between">
                <span className="label-text font-medium text-sm flex items-center gap-1"><LinkIcon size={14} /> Link Ảnh / GIF</span>
                <a href="https://catbox.moe" target="_blank" rel="noreferrer" className="text-xs text-primary font-medium hover:underline">catbox.moe ↗</a>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors" 
                value={config.icon_url}
                onChange={(e) => handleChange("icon_url", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Màu sắc Section */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-base-content/70 flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
            <Palette size={14} /> Màu sắc
          </h3>

          {/* Quick Palettes */}
          <div className="mb-6">
            <label className="label py-1"><span className="label-text font-medium text-sm text-base-content/80">Bảng màu gợi ý</span></label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {PRESET_PALETTES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleApplyPalette(p)}
                  className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-base-100 shadow ring-1 ring-base-300 transition-transform active:scale-95"
                  style={{ background: `linear-gradient(to bottom right, ${p.top}, ${p.bottom})` }}
                  title={p.name}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Nền trên", field: "colortop" },
              { label: "Nền dưới", field: "colorbottom" },
              { label: "Màu chữ", field: "text_color" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 bg-base-200/50 p-2 rounded-xl border border-base-200">
                <span className="text-[10px] font-medium text-base-content/70 text-center">{item.label}</span>
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-base-300">
                  <input 
                    type="color" 
                    className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer"
                    value={config[item.field]}
                    onChange={(e) => handleChange(item.field, e.target.value)}
                  />
                </div>
                <span className="text-[10px] font-mono text-base-content/50 uppercase">{config[item.field]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 pb-4">
        <button 
          onClick={handleSave}
          className="btn w-full h-12 rounded-full text-base font-bold shadow-[0_4px_12px_rgba(0,195,255,0.4)] text-white hover:scale-105 transition-all bg-[#00c3ff] hover:bg-[#00c3ff]/90 border-none"
        >
          Lưu mẫu
        </button>
      </div>
      </div>
    </div>
  );
}
