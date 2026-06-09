import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { FaAndroid, FaApple } from "react-icons/fa";
import {
  Smartphone,
  Monitor,
  Menu,
  Share,
  Plus,
  Zap,
  Bell,
  Save,
  AppWindow,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Chrome,
  Globe,
  PlayCircle,
  ChevronLeft,
} from "lucide-react";
import { EMBEDVIDEO_CONFIG } from "@/config";
const SettingAppIcon = lazy(() => import("./SettingAppIcon"));

const AddToHomeScreenGuide = () => {
  const [activeTab, setActiveTab] = useState("android");
  const navigate = useNavigate();

  // Detect user's operating system
  useEffect(() => {
    const detectOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "ios";
      if (/android/i.test(userAgent) || /Mobi/i.test(userAgent)) return "android";
      return "android";
    };
    setActiveTab(detectOS());
  }, []);

  return (
    <div className="h-[100dvh] w-full overflow-y-auto bg-base-100 text-base-content flex flex-col items-center py-4 px-4">
      <div className="max-w-7xl w-full flex justify-start mb-2">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-circle btn-ghost"
        >
          <ChevronLeft size={28} />
        </button>
      </div>
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-base-content">
            Thêm vào Màn hình Chính
          </h1>
          <p className="text-sm text-base-content/60 max-w-md mx-auto leading-relaxed">
            Chọn biểu tượng bạn thích dưới đây, sau đó làm theo hướng dẫn cài đặt WebApp để trải nghiệm mượt mà như app gốc.
          </p>
        </div>

        {/* 1. Chọn biểu tượng ứng dụng (Đưa lên hàng đầu) */}
        <div className="mb-10">
          <Suspense fallback={<div className="h-40 flex items-center justify-center"><span className="loading loading-spinner opacity-20"></span></div>}>
            <SettingAppIcon />
          </Suspense>
        </div>

        {/* 2. Hướng dẫn cài đặt (Đưa xuống dưới) */}
        <div className="border-t border-base-300 pt-8">
          <h2 className="text-xl font-bold text-center text-base-content mb-6">
            Hướng dẫn thêm vào màn hình chính
          </h2>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="bg-base-200/50 backdrop-blur p-1 rounded-xl flex gap-2 border border-base-300">
              <button
                onClick={() => setActiveTab("android")}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "android"
                    ? "bg-base-100 text-base-content shadow-sm border border-base-300/50"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                <FaAndroid className="w-4 h-4" />
                Android
              </button>
              <button
                onClick={() => setActiveTab("ios")}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "ios"
                    ? "bg-base-100 text-base-content shadow-sm border border-base-300/50"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                <FaApple className="w-4 h-4" />
                iOS
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-10 text-center">
            {activeTab === "android" && (
              <div className="bg-base-200/50 border border-base-300 rounded-2xl p-5 shadow-sm inline-block text-left w-full max-w-md">
                <div className="flex items-center gap-2 mb-5 justify-center">
                  <Chrome className="w-5 h-5 text-[#00c3ff]" />
                  <h3 className="text-base font-bold tracking-tight">Trình duyệt Chrome</h3>
                </div>
                <ul className="space-y-3 text-sm font-medium">
                  <li className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold shadow-sm">1</span>
                    Nhấn biểu tượng Menu (⋮) ở góc trên.
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#00c3ff]/20 text-[#00c3ff] flex items-center justify-center text-xs font-bold shadow-sm">2</span>
                    Chọn "Thêm vào Màn hình chính".
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "ios" && (
              <div className="bg-base-200/50 border border-base-300 rounded-2xl p-5 shadow-sm inline-block text-left w-full max-w-md">
                <div className="flex items-center gap-2 mb-5 justify-center">
                  <Globe className="w-5 h-5 text-[#00c3ff]" />
                  <h3 className="text-base font-bold tracking-tight">Trình duyệt Safari</h3>
                </div>
                <ul className="space-y-3 text-sm font-medium">
                  <li className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold shadow-sm">1</span>
                    Nhấn biểu tượng Chia sẻ (↑) ở dưới.
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#00c3ff]/20 text-[#00c3ff] flex items-center justify-center text-xs font-bold shadow-sm">2</span>
                    Chọn "Thêm vào MH chính" (Add to Home Screen).
                  </li>
                </ul>
                <p className="text-xs text-base-content/60 mt-5 text-center italic">
                  *Vui lòng dùng Safari, Chrome trên iOS chưa hỗ trợ.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-xs text-base-content/40 tracking-wide font-medium uppercase">
            Hỗ trợ kỹ thuật
          </p>
          <a href="mailto:hegiahe@gmail.com" className="text-xs text-base-content/60 hover:text-base-content transition-colors mt-1 inline-block">
            hegiahe@gmail.com
          </a>
        </div>
        
      </div>
    </div>
  );
};

export default AddToHomeScreenGuide;
