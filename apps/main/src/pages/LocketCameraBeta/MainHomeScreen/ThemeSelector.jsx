import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CAMERA_THEMES, useThemeStore } from "@/stores";

// Tiền tính toán màu nền mockup một lần duy nhất để tối ưu hiệu suất lướt (tiết kiệm CPU)
const themeItemBgCache = CAMERA_THEMES.reduce((acc, theme) => {
  let hex = theme.background.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
  hex = hex ? hex[1] : "ffffff";
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const isLight = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
  acc[theme.id] = isLight ? "bg-black/15" : "bg-white/25";
  return acc;
}, {});

const ThemeSelector = ({ isOpen, onClose, embedded = false }) => {
  const { currentThemeId, setCurrentThemeId } = useThemeStore();
  
  // Find initial slide index
  const initialSlide = CAMERA_THEMES.findIndex((t) => t.id === currentThemeId);
  
  // Track preview for dynamic background
  const [previewIndex, setPreviewIndex] = useState(initialSlide !== -1 ? initialSlide : 0);

  const handleSelect = (theme) => {
    setCurrentThemeId(theme.id);
    if (!embedded && onClose) onClose();
  };

  if (!isOpen && !embedded) return null;

  const currentTheme = CAMERA_THEMES[previewIndex] || CAMERA_THEMES[0];
  const bgGradient = embedded ? "none" : `linear-gradient(to bottom, #1c1c1e 40%, ${currentTheme?.primaryColor || '#000'} 150%)`;

  return (
    <div 
      className={embedded ? "w-full h-full flex flex-col bg-base-100" : "fixed inset-0 z-[100] flex flex-col transition-opacity duration-500 animate-in fade-in"}
      style={{ background: bgGradient }}
    >
      {/* Header - Only show if not embedded */}
      {!embedded && (
        <div className="relative pt-12 pb-2 px-6 text-center flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-12 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-1 text-white tracking-wide">Camera Theme</h2>
          <p className="text-sm font-medium text-white/70">
            Decorate your camera<br/>by picking a theme
          </p>
        </div>
      )}

      {/* Intro text for embedded */}
      {embedded && (
        <div className="text-center pt-4 pb-2 px-6">
          <p className="text-sm font-medium text-base-content/70">
            Vuốt để xem các giao diện, chạm vào để áp dụng!
          </p>
        </div>
      )}

      {/* Swiper Content */}
      <div className="flex-1 w-full flex items-center justify-center pb-12 pt-6 overflow-hidden transform-gpu">
        <Swiper
          modules={[EffectCoverflow]}
          effect="coverflow"
          slidesPerView="auto"
          centeredSlides={true}
          initialSlide={initialSlide !== -1 ? initialSlide : 0}
          spaceBetween={0}
          grabCursor={true}
          coverflowEffect={{
            rotate: 0,
            stretch: 20,
            depth: 100,
            modifier: 1.5,
            slideShadows: false,
          }}
          onSlideChange={(swiper) => setPreviewIndex(swiper.activeIndex)}
          className="w-full !py-8"
        >
          {CAMERA_THEMES.map((theme) => {
            const itemBg = themeItemBgCache[theme.id];

            return (
            <SwiperSlide
              key={theme.id}
              className="!shrink-0 w-[55vw] max-w-[240px]"
              style={{ aspectRatio: "9/20" }}
              onClick={() => handleSelect(theme)}
            >
              {({ isActive }) => {
                const isCurrentlyUsed = theme.id === currentThemeId;
                return (
                <div 
                  className={`w-full h-full rounded-[45px] py-4 flex flex-col relative overflow-hidden cursor-pointer origin-center transition-all ${
                    isCurrentlyUsed ? "ring-4 ring-primary ring-offset-2 ring-offset-base-100" : ""
                  }`}
                  style={{ background: theme.background }}
                >
                  {isCurrentlyUsed && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm z-10 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-primary" />
                      Đang dùng
                    </div>
                  )}
                  {/* Mockup Header (Avatar, Pill, Chat) */}
                  <div className="w-full flex justify-between items-center px-5 pt-1">
                    <div className={`w-6 h-6 rounded-full ${itemBg}`}></div>
                    <div className={`w-16 h-5 rounded-full ${itemBg}`}></div>
                    <div className={`w-6 h-6 rounded-full ${itemBg}`}></div>
                  </div>

                  {/* Mockup Camera Preview Area - Edge to Edge */}
                  <div className="w-full aspect-square bg-[#111111] rounded-[48px] my-auto"></div>

                  {/* Mockup Bottom Controls */}
                  <div className="w-full flex justify-between items-center px-6">
                    <div className={`w-6 h-6 rounded-lg ${itemBg}`}></div>
                    
                    {/* Camera Button Mockup */}
                    <div 
                      className="relative flex items-center justify-center w-14 h-14 rounded-full border-[3px]"
                      style={{ borderColor: theme.primaryColor || '#fff' }}
                    >
                      <div className="absolute w-10 h-10 bg-white rounded-full shadow-sm"></div>
                    </div>

                    <div className={`w-6 h-6 rounded-full ${itemBg}`}></div>
                  </div>

                  {/* Mockup Lịch sử */}
                  <div className="w-full flex flex-col items-center mt-4 pb-2 gap-1.5 px-5">
                    <div className={`w-10 h-1.5 rounded-full ${itemBg}`}></div>
                    <div className={`w-4 h-1 rounded-full ${itemBg}`}></div>
                  </div>
                </div>
                );
              }}
            </SwiperSlide>
          )})}
        </Swiper>
      </div>
    </div>
  );
};

export default ThemeSelector;
