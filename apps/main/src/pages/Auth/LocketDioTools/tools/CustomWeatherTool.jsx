import React, { useState } from "react";
import { useOverlayDataStore } from "@/stores";
import { CloudRain, Palette, Type, Smile } from "lucide-react";
import { SonnerSuccess, SonnerError } from "@/components/ui/SonnerToast";
import { getCaptionStyle } from "@/helpers/styleHelpers";

export default function CustomWeatherTool({ onClose }) {
  const addCustomCaption = useOverlayDataStore((s) => s.addCustomCaption);

  const [config, setConfig] = useState({
    text: "Mưa siêu to khổng lồ",
    temperature: "99°C",
    colortop: "#1E3A8A",
    colorbottom: "#3B82F6",
    text_color: "#FFFFFF",
    icon_data: "🌧️",
  });

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!config.text.trim() && !config.temperature.trim()) {
      SonnerError("Thiếu thông tin", "Vui lòng nhập nhiệt độ hoặc thời tiết!");
      return;
    }

    const displayText = [config.temperature, config.text].filter(Boolean).join(" ");

    addCustomCaption({
      overlay_id: "weather",
      type: "weather",
      text: displayText,
      caption: displayText,
      text_color: config.text_color,
      background: { colors: [config.colortop, config.colorbottom] },
      icon: { type: "emoji", data: config.icon_data },
      payload: {
        condition: "custom",
        temperature: config.temperature,
        precipitation: 100,
        cloud_cover: 0.9,
        uv_index: 10,
        feels_like: 100,
      },
      active: true,
      is_editable: true
    });

    SonnerSuccess("Thành công", "Đã lưu widget thời tiết Bá đạo!");
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col w-full pb-10 font-sans">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-base-100 py-3 px-4 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <CloudRain className="text-primary w-5 h-5" />
          Custom Weather
        </h2>
        {onClose && (
          <button onClick={onClose} className="btn btn-ghost btn-sm gap-1 text-primary font-medium px-2">
            Quay lại
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto w-full">
        {/* Live Preview */}
        <div className="bg-base-200 p-4 rounded-3xl flex items-center justify-center border-2 border-base-300 relative overflow-hidden h-28 shadow-inner">
          <div className="relative z-10 flex items-center bg-white/50 backdrop-blur-2xl py-2 px-4 rounded-4xl shadow-lg transition-all duration-300 gap-2"
               style={getCaptionStyle([config.colortop, config.colorbottom], config.text_color)}>
            <span className="text-xl shrink-0">{config.icon_data}</span>
            <span className="truncate font-semibold">{[config.temperature, config.text].filter(Boolean).join(" ")}</span>
          </div>
        </div>

        {/* Nội dung Section */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm space-y-4">
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium text-sm">Nhiệt độ (Ví dụ: -99°C, 1000°F)</span></label>
            <input 
              type="text" 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" 
              value={config.temperature}
              onChange={(e) => handleChange("temperature", e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium text-sm">Chữ mô tả thời tiết</span></label>
            <input 
              type="text" 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" 
              value={config.text}
              placeholder="Sắp bão, nóng chảy mỡ..."
              onChange={(e) => handleChange("text", e.target.value)}
            />
          </div>
          
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium text-sm">Icon thời tiết (Emoji)</span></label>
            <input 
              type="text" 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 text-lg" 
              value={config.icon_data}
              onChange={(e) => handleChange("icon_data", e.target.value)}
            />
          </div>
        </div>

        {/* Màu sắc */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-base-content/70 flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
            <Palette size={14} /> Màu sắc Gradient
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Nền trên", field: "colortop" },
              { label: "Nền dưới", field: "colorbottom" },
              { label: "Màu chữ", field: "text_color" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 bg-base-200/50 p-2 rounded-xl border border-base-200">
                <span className="text-[10px] font-medium text-base-content/70">{item.label}</span>
                <input 
                  type="color" 
                  className="w-8 h-8 rounded-lg cursor-pointer"
                  value={config[item.field]}
                  onChange={(e) => handleChange(item.field, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 pb-4">
          <button 
            onClick={handleSave}
            className="btn w-full h-12 rounded-full text-base font-bold shadow-lg text-white hover:scale-105 transition-all bg-[#00c3ff] hover:bg-[#00c3ff]/90 border-none"
          >
            Tạo Widget Thời tiết
          </button>
        </div>
      </div>
    </div>
  );
}
