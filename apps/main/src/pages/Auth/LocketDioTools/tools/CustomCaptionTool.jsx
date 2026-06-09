import React, { useState, useRef } from "react";
import { useOverlayDataStore } from "@/stores";
import { getCaptionStyle } from "@/helpers/styleHelpers";
import { Palette, Type, Image as ImageIcon, Smile, Upload, Link as LinkIcon } from "lucide-react";
import { SonnerSuccess, SonnerError } from "@/components/ui/SonnerToast";

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
  { name: "Ocean", top: "#0ea5e9", bottom: "#2563eb", text: "#ffffff" },
  { name: "Neon Violet", top: "#8b5cf6", bottom: "#6d28d9", text: "#ffffff" },
  { name: "Dark Mode", top: "#3f3f46", bottom: "#18181b", text: "#ffffff" },
  { name: "Sakura", top: "#ffd1dc", bottom: "#ffdfd3", text: "#831843" },
  { name: "Miku Teal", top: "#86cecb", bottom: "#b5e8e6", text: "#008080" },
  { name: "Rem Blue", top: "#b2c2e8", bottom: "#e6f0fa", text: "#2a52be" },
  { name: "Nezuko Pink", top: "#ffc0cb", bottom: "#ffb6b9", text: "#dc143c" },
  { name: "Klee Red", top: "#fcf4dd", bottom: "#ffe699", text: "#e63946" },
  { name: "Sailor Moon", top: "#ffdde1", bottom: "#ffffba", text: "#ff00ff" },
  { name: "Blueberry", top: "#ccccff", bottom: "#b0e0e6", text: "#000080" },
  { name: "Rose Gold", top: "#f4c2c2", bottom: "#ffd700", text: "#b76e79" },
];

export default function CustomCaptionTool({ onClose, hideHeader }) {
  const addCustomCaption = useOverlayDataStore((s) => s.addCustomCaption);
  const fileInputRef = useRef(null);

  const [config, setConfig] = useState({
    colortop: "#FFB6C1",
    colorbottom: "#ADD8E6",
    text: "",
    text_color: "#FFFFFF",
    icon_type: "emoji",
    icon_data: "✨",
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
    if (!config.text.trim()) {
      SonnerError("Thiếu nội dung", "Vui lòng nhập chữ hiển thị!");
      return;
    }
    addCustomCaption({
      overlay_id: "custom_caption_" + Date.now(),
      colortop: config.colortop,
      colorbottom: config.colorbottom,
      background: { colors: [config.colortop, config.colorbottom] },
      text: config.text,
      text_color: config.text_color,
      type: "image_icon",
      icon: { 
        type: config.icon_type === "url" ? "image" : config.icon_type, 
        data: config.icon_data,
        source: config.icon_type === "url" ? "url" : undefined
      },
      is_editable: true,
      active: true,
    });
    SonnerSuccess("Thành công", "Đã thêm mẫu caption mới!");
    if (onClose) onClose();
  };

  const previewData = {
    background: { colors: [config.colortop, config.colorbottom] },
    text_color: config.text_color,
    icon: { type: config.icon_type === "url" ? "image" : config.icon_type, data: config.icon_data },
    text: config.text
  };

  return (
    <div className={`flex flex-col w-full pb-10 font-sans`}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between sticky top-0 z-20 bg-base-100 py-3 px-4 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Palette className="text-primary w-5 h-5" />
            Custom Caption
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
        Cách đổi icon bằng Ảnh/GIF: Truy cập <a href="https://catbox.moe" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">catbox.moe</a>, tải ảnh của bạn lên. Copy link kết quả và dán vào mục Link URL bên dưới.
      </p>

      {/* Live Preview */}
      <div className="bg-base-200 p-4 rounded-3xl flex items-center justify-center border-2 border-base-300 relative overflow-hidden h-28 shadow-inner">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558636508-e0db3814bd1d')] bg-cover bg-center opacity-40 blur-[2px]"></div>
        <div className="relative z-10 flex items-center bg-white/50 backdrop-blur-2xl py-2 pl-4 pr-4 rounded-4xl max-w-full shadow-lg transition-all duration-300"
             style={getCaptionStyle(previewData.background.colors, previewData.text_color)}>
          <span className="text-base flex flex-row items-center gap-1 font-semibold truncate">
            {previewData.icon.type === "emoji" ? (
              <span className="mr-1 text-lg flex-shrink-0">{previewData.icon.data}</span>
            ) : (
              <img src={previewData.icon.data} className="w-5 h-5 rounded-full object-cover mr-1 shadow-sm border border-white/20" />
            )}
            <span className="truncate">{previewData.text}</span>
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
                placeholder="Nhập nội dung..."
                onChange={(e) => handleChange("text", e.target.value)}
              />
            </div>
            
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium text-sm flex items-center gap-1">Biểu tượng (Icon)</span>
              </label>
              <div className="flex gap-2">
                <button 
                  className={`flex-1 btn btn-sm ${config.icon_type === 'emoji' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    handleChange("icon_type", "emoji");
                    if (config.icon_data.length > 5) handleChange("icon_data", "✨"); // reset if it was base64
                  }}
                >
                  <Smile size={16} /> Emoji
                </button>
                <button 
                  className={`flex-1 btn btn-sm ${config.icon_type === 'url' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    handleChange("icon_type", "url");
                    if (config.icon_data.length < 5) handleChange("icon_data", "");
                  }}
                >
                  <LinkIcon size={16} /> Link URL
                </button>
              </div>

              {config.icon_type === "emoji" ? (
                <input 
                  type="text" 
                  className="input input-bordered w-full mt-2 bg-base-200/50 focus:bg-base-100 transition-colors text-lg" 
                  value={config.icon_data}
                  placeholder="✨"
                  onChange={(e) => handleChange("icon_data", e.target.value)}
                />
              ) : (
                <div className="mt-2 space-y-2">
                  <input 
                    type="text" 
                    className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors" 
                    value={config.icon_data}
                    placeholder="Dán link ảnh (https://...)"
                    onChange={(e) => handleChange("icon_data", e.target.value)}
                  />
                  {config.icon_data.startsWith("http") && (
                    <div className="w-12 h-12 rounded-full border-2 border-base-300 flex items-center justify-center overflow-hidden bg-base-200">
                      <img src={config.icon_data} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Màu sắc Section */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-base-content/70 flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
            <Palette size={14} /> Màu sắc (20 Bộ)
          </h3>

          {/* Quick Palettes */}
          <div className="mb-6">
            <label className="label py-1"><span className="label-text font-medium text-sm text-base-content/80">Bảng màu gợi ý</span></label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {PRESET_PALETTES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleApplyPalette(p)}
                  className="flex-shrink-0 w-10 h-10 rounded-full border border-base-100 shadow ring-1 ring-base-300 transition-transform active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${p.top}, ${p.bottom})` }}
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
