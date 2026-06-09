import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowDownToLine, Star } from "lucide-react";
import { detectAppEnvironment } from "@/utils/logic/checkIfRunningAsPWA";

const InstallAppPrompt = () => {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra môi trường di động
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (!isMobile) return;

    // 2. Kiểm tra xem đã chạy ở dạng WebApp (PWA) chưa
    const isPWA = detectAppEnvironment();
    if (isPWA) return;

    // 3. Kiểm tra snooze trong localStorage
    const dismissedUntil = localStorage.getItem("pwa_prompt_dismissed_until");
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // Delay slighty so it doesn't jump scare the user
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      // Snooze 2 tiếng
      const dismissTime = Date.now() + 2 * 60 * 60 * 1000;
      localStorage.setItem("pwa_prompt_dismissed_until", String(dismissTime));
      setShowPrompt(false);
      setIsClosing(false);
    }, 300); // match animation duration
  };

  const handleInstall = () => {
    navigate("/download");
  };

  if (!showPrompt) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] transition-all duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleDismiss}
      ></div>

      {/* Popup Dialog */}
      <div 
        className={`relative w-full max-w-[340px] bg-base-100 rounded-[32px] shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 transform ${
          isClosing ? "scale-95 translate-y-4" : "scale-100 translate-y-0"
        }`}
      >
        {/* Banner Graphic Area */}
        <div className="w-full bg-gradient-to-br from-[#00c3ff]/15 to-primary/5 pt-10 pb-6 flex flex-col items-center justify-center relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-base-content/40 hover:text-base-content hover:bg-base-200/50 p-2 rounded-full transition-colors z-10"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
          
          <div className="relative">
            <div className="w-20 h-20 bg-base-100 rounded-[22px] shadow-lg flex items-center justify-center relative z-10 border border-base-200/50">
              <ArrowDownToLine size={32} strokeWidth={2.5} className="text-[#00c3ff]" />
            </div>
            {/* Decorative Star */}
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-md z-20 animate-[bounce_2s_infinite]">
              <Star size={14} className="text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="px-6 py-6 text-center flex flex-col gap-2.5">
          <h3 className="text-[22px] font-bold text-base-content tracking-tight">Cài đặt WebApp</h3>
          <p className="text-[15px] text-base-content/70 leading-relaxed font-medium">
            Bản web chỉ để xem tạm. Hãy cài đặt ứng dụng vào màn hình chính để có tốc độ mượt mà và đầy đủ tính năng!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-7 flex flex-col gap-3">
          <button
            onClick={handleInstall}
            className="w-full py-4 rounded-2xl text-[16px] font-bold bg-[#00c3ff] hover:bg-[#0099cc] text-white shadow-[0_6px_20px_rgba(0,195,255,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowDownToLine size={20} />
            Cài đặt ngay
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-base-content/60 bg-base-200/60 hover:bg-base-300 active:scale-[0.98] transition-all duration-200"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallAppPrompt;
