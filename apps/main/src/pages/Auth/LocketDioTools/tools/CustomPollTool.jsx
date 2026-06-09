import React, { useState } from "react";
import { useOverlayDataStore } from "@/stores";
import { ListTodo, Palette } from "lucide-react";
import { SonnerSuccess, SonnerError } from "@/components/ui/SonnerToast";
import { getCaptionStyle } from "@/helpers/styleHelpers";

export default function CustomPollTool({ onClose }) {
  const addCustomCaption = useOverlayDataStore((s) => s.addCustomCaption);

  const [config, setConfig] = useState({
    question: "Bạn chọn gì?",
    leftEmoji: "🐶",
    rightEmoji: "🐱",
    colortop: "#8B5CF6",
    colorbottom: "#3B82F6",
    text_color: "#FFFFFF",
  });

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!config.question.trim()) {
      SonnerError("Thiếu thông tin", "Vui lòng nhập câu hỏi bình chọn!");
      return;
    }

    addCustomCaption({
      overlay_id: `custom_poll_${Date.now()}`,
      type: "poll",
      text: config.question,
      caption: { text: config.question },
      text_color: config.text_color,
      background: { colors: [config.colortop, config.colorbottom] },
      payload: {
        left_emoji: config.leftEmoji || "👍",
        right_emoji: config.rightEmoji || "👎",
      },
      active: true,
      is_editable: true
    });

    SonnerSuccess("Thành công", "Đã tạo widget Bình chọn bá đạo!");
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col w-full pb-10 font-sans">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-base-100 py-3 px-4 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ListTodo className="text-primary w-5 h-5" />
          Custom Poll
        </h2>
        {onClose && (
          <button onClick={onClose} className="btn btn-ghost btn-sm gap-1 text-primary font-medium px-2">
            Quay lại
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto w-full">
        {/* Live Preview */}
        <div className="bg-base-200 p-4 rounded-3xl flex items-center justify-center border-2 border-base-300 relative overflow-hidden h-36 shadow-inner">
          <div className="relative z-10 flex flex-col items-center p-3 rounded-3xl shadow-lg transition-all duration-300 gap-2 min-w-[200px]"
               style={getCaptionStyle([config.colortop, config.colorbottom], config.text_color)}>
            <span className="font-semibold text-center mb-1">{config.question}</span>
            <div className="flex gap-4 w-full px-2 mt-2">
              <div className="flex-1 bg-white/20 rounded-2xl py-2 flex justify-center text-2xl shadow-sm">{config.leftEmoji}</div>
              <div className="flex-1 bg-white/20 rounded-2xl py-2 flex justify-center text-2xl shadow-sm">{config.rightEmoji}</div>
            </div>
          </div>
        </div>

        {/* Nội dung Section */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm space-y-4">
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium text-sm">Câu hỏi</span></label>
            <input 
              type="text" 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" 
              value={config.question}
              placeholder="Bạn chọn gì?..."
              onChange={(e) => handleChange("question", e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="form-control flex-1">
              <label className="label py-1"><span className="label-text font-medium text-sm text-center w-full">Emoji Trái</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 text-xl text-center" 
                value={config.leftEmoji}
                onChange={(e) => handleChange("leftEmoji", e.target.value)}
              />
            </div>
            <div className="form-control flex-1">
              <label className="label py-1"><span className="label-text font-medium text-sm text-center w-full">Emoji Phải</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 text-xl text-center" 
                value={config.rightEmoji}
                onChange={(e) => handleChange("rightEmoji", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Màu sắc */}
        <div className="bg-base-100 border border-base-300 p-3 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-base-content/70 flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
            <Palette size={14} /> Màu sắc Poll
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
            Tạo Widget Bình Chọn
          </button>
        </div>
      </div>
    </div>
  );
}
