import React, { useState } from "react";
import { useOverlayDataStore } from "@/stores";
import { Link as LinkIcon, Youtube, Globe, Palette } from "lucide-react";
import { SonnerSuccess, SonnerError } from "@/components/ui/SonnerToast";
import { getCaptionStyle } from "@/helpers/styleHelpers";

export default function CustomLinkTool({ onClose }) {
  const addCustomCaption = useOverlayDataStore((s) => s.addCustomCaption);

  const [config, setConfig] = useState({
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up",
    type: "link", // "link" or "music"
    colortop: "#FF0000",
    colorbottom: "#282828",
    text_color: "#FFFFFF",
  });

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getIconData = () => {
    const ytId = extractYoutubeId(config.url);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    return "https://cdn-icons-png.flaticon.com/512/2875/2875246.png"; // generic link icon
  };

  const handleSave = () => {
    if (!config.url.trim() || !config.title.trim()) {
      SonnerError("Thiếu thông tin", "Vui lòng nhập Link và Tiêu đề!");
      return;
    }

    const iconData = getIconData();
    const isYoutube = !!extractYoutubeId(config.url);

    addCustomCaption({
      overlay_id: `custom_link_${Date.now()}`,
      type: config.type,
      text: config.title,
      text_color: config.text_color,
      background: { colors: [config.colortop, config.colorbottom] },
      icon: { type: "image", data: iconData, source: "url" },
      payload: config.type === "music" ? {
        platform: isYoutube ? "youtube" : "website",
        url: config.url,
        title: config.title,
        image: iconData
      } : {
        url: config.url,
        title: config.title
      },
      active: true,
      is_editable: true
    });

    SonnerSuccess("Thành công", "Đã thêm mẫu Link mới!");
    if (onClose) onClose();
  };

  const previewIcon = getIconData();

  return (
    <div className="flex flex-col w-full pb-10 font-sans">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-base-100 py-3 px-4 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <LinkIcon className="text-primary w-5 h-5" />
          Custom Link / YouTube
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
          <div className="relative z-10 flex items-center bg-white/50 backdrop-blur-2xl py-2 pl-4 pr-4 rounded-4xl max-w-[85%] shadow-lg transition-all duration-300"
               style={getCaptionStyle([config.colortop, config.colorbottom], config.text_color)}>
            <img src={previewIcon} alt="Icon" className="w-6 h-6 object-cover rounded-sm shrink-0 mr-2" />
            <span className="truncate font-semibold">{config.title}</span>
            {config.type === "music" && extractYoutubeId(config.url) && (
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="border-l border-white h-5"></div>
                <Youtube className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Nội dung Section */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm space-y-4">
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium text-sm">Link URL (YouTube hoặc Web)</span></label>
            <input 
              type="text" 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" 
              value={config.url}
              placeholder="https://..."
              onChange={(e) => handleChange("url", e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium text-sm">Tên hiển thị</span></label>
            <input 
              type="text" 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" 
              value={config.title}
              placeholder="Nhập tiêu đề..."
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium text-sm">Định dạng Payload (Bá đạo)</span></label>
            <div className="flex gap-2">
              <button 
                className={`flex-1 btn btn-sm ${config.type === 'link' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleChange("type", "link")}
              >
                <Globe size={16} /> Link Widget
              </button>
              <button 
                className={`flex-1 btn btn-sm ${config.type === 'music' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleChange("type", "music")}
              >
                <Youtube size={16} /> Music Widget
              </button>
            </div>
            <span className="text-[10px] opacity-70 mt-1 pl-1">Link Widget thường ổn định hơn trên Locket. Music Widget có thể hiển thị thanh nhạc.</span>
          </div>
        </div>

        {/* Màu sắc */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-base-content/70 flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
            <Palette size={14} /> Màu sắc
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
            Lưu Widget Link
          </button>
        </div>
      </div>
    </div>
  );
}
