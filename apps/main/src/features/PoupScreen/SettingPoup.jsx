import { useReadReceipts, useShareHistory, useUserSetting, useAuthStore, useThemeStore } from "@/stores";
import { CheckCheck, Eye, History, UserRoundSearch, X, LogOut, SquareArrowOutUpRight, Smartphone, Palette, Smile } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { SonnerError, SonnerSuccess } from "@/components/ui/SonnerToast";
import { useApp } from "@/context/AppContext";

import ThemeSelector from "@/pages/LocketCameraBeta/MainHomeScreen/ThemeSelector";

const SettingPoup = ({ open, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [activeView, setActiveView] = useState("main"); // "main" or "theme"

  // Drag states
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = React.useRef(null);

  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (dragStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;
    
    // Chỉ cho phép kéo xuống
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 120) {
      // Kéo đủ xa thì đóng
      onClose();
    }
    // Trở về vị trí cũ nếu không đủ xa
    setDragOffset(0);
    dragStartY.current = null;
  };
  
  const user = useAuthStore((state) => state.user);
  const clearAndlogout = useAuthStore((state) => state.clearAndlogout);
  const navigate = useNavigate();
  const { navigation } = useApp();
  const { setIsToolsOpen, setToolsActiveTab, setIsSidebarOpen } = navigation;

  const handleLogout = async () => {
    try {
      clearAndlogout();
      SonnerSuccess(
        "Đăng xuất thành công!",
        `Tạm biệt ${user?.displayName || "người dùng"}!`
      );
      navigate("/login");
    } catch (error) {
      SonnerError("error", "Đăng xuất thất bại!");
      console.error("❌ Lỗi khi đăng xuất:", error);
    }
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showModal]);

  useEffect(() => {
    if (open) {
      setShowModal(true);
      setActiveView("main");
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setShowModal(false), 500);
    }
  }, [open]);

  const showSeenMoments = useUserSetting((s) => s.showSeenMoments);
  const toggleSeenMoments = useUserSetting((s) => s.toggleSeenMoments);

  const ghostMode = useUserSetting((s) => s.ghostMode);
  const toggleGhostMode = useUserSetting((s) => s.toggleGhostMode);

  const allowSearch = useUserSetting((s) => s.allowSearch);
  const toggleAllowSearch = useUserSetting((s) => s.toggleAllowSearch);

  const { sendReadReceipts, toggleReadReceipts } = useReadReceipts();
  const { shareHistoryOn, toggleShareHistoryOn } = useShareHistory();

  if (!showModal) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 bg-base-100/30 backdrop-blur-[4px] transition-opacity duration-500 z-[62] text-base-content ${
        animate ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed bottom-0 left-0 right-0 mx-auto w-full max-w-lg h-[85vh] md:h-[70%] bg-base-100 rounded-t-4xl shadow-xl
        transition-all duration-500 z-[63] flex flex-col`}
        style={{
          transform: animate ? `translateY(${dragOffset}px)` : 'translateY(100%)',
          transition: dragOffset > 0 ? 'none' : 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="relative flex flex-col items-center justify-center border-b border-base-300 px-4 py-3 touch-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-base-content/20 rounded-full mx-auto absolute top-2" />
          {activeView !== "main" && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 hover:bg-base-200 rounded-full transition-colors"
              onClick={() => setActiveView("main")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
          )}
          <h3 className="text-xl font-semibold mt-3">
            {activeView === "theme" ? "Camera Theme" : "Cài đặt"}
          </h3>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={onClose}
          >
            <X className="w-8 h-8 btn btn-circle p-1" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative">
          {activeView === "theme" ? (
            <ThemeSelector embedded={true} isOpen={true} />
          ) : (
            <div className="px-4 py-4 space-y-6">
              <div>
                <p className="text-sm text-base-content/60 mb-2">Hiển thị</p>

                <div className="bg-base-200 rounded-2xl divide-y divide-base-300">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-base-300">
                        <Eye className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-medium flex items-center gap-2">Trạng thái xem Moments</p>
                        <p className="text-xs text-base-content/60 leading-tight">
                          Khi bật, người khác sẽ biết bạn đã xem Moments của họ.
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={showSeenMoments}
                      onChange={(e) => toggleSeenMoments()}
                      className="toggle shrink-0"
                      style={showSeenMoments ? { backgroundColor: '#00c3ff', borderColor: '#00c3ff' } : {}}
                    />
                  </div>

                  {/* GHOST MODE TOGGLE */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-purple-500/20 text-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ghost"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-medium flex flex-wrap items-center gap-2">
                          Chế độ Tàng hình
                          <span className="badge badge-sm badge-primary text-[10px] h-4 shrink-0">VIP</span>
                        </div>
                        <p className="text-xs text-base-content/60 leading-tight mt-0.5">
                          Lướt ảnh, xem tin nhắn không bị phát hiện "Đã xem".
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={ghostMode}
                      onChange={(e) => toggleGhostMode()}
                      className="toggle shrink-0"
                      style={ghostMode ? { backgroundColor: '#a855f7', borderColor: '#a855f7' } : {}}
                    />
                  </div>


                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-base-300">
                        <CheckCheck className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-medium flex items-center gap-2">Hiển thị đã đọc</p>
                        <p className="text-xs text-base-content/60 leading-tight">
                          Khi bật, người khác sẽ biết bạn đã đọc tin nhắn của họ.
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={sendReadReceipts}
                      onChange={toggleReadReceipts}
                      className="toggle shrink-0"
                      style={sendReadReceipts ? { backgroundColor: '#00c3ff', borderColor: '#00c3ff' } : {}}
                    />
                  </div>

                </div>
              </div>

              <div>
                <p className="text-sm text-base-content/60 mb-2">Tính năng</p>
                <div className="bg-base-200 rounded-2xl divide-y divide-base-300 overflow-hidden">
                  <Link to="/download" className="flex items-center gap-3 px-4 py-3 hover:bg-base-300 transition-colors">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-base-300">
                      <SquareArrowOutUpRight className="w-5 h-5" />
                    </div>
                    <p className="font-medium">Cài đặt WebApp</p>
                  </Link>

                  <button 
                    onClick={() => setActiveView("theme")} 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-300 transition-colors"
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-base-300">
                      <Palette className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium">Camera Theme</p>
                  </button>

                  <button 
                    onClick={() => {
                      setToolsActiveTab("gold-unlock");
                      setIsToolsOpen(true);
                      onClose();
                    }} 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-300 transition-colors"
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.518l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
                    </div>
                    <p className="font-medium">Mở khóa Locket Gold</p>
                  </button>

                  <button 
                    onClick={() => {
                      setToolsActiveTab("custom-crush");
                      setIsToolsOpen(true);
                      onClose();
                    }} 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-300 transition-colors"
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-base-300">
                      <Palette className="w-5 h-5" />
                    </div>
                    <p className="font-medium">Tùy chỉnh Crush</p>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setToolsActiveTab("custom-emoji");
                      setIsToolsOpen(true);
                      onClose();
                    }} 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-300 transition-colors"
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-base-300">
                      <Smile className="w-5 h-5" />
                    </div>
                    <p className="font-medium">Tùy Chỉnh Emoji</p>
                  </button>
                </div>
              </div>

              <div>
                <div className="bg-base-200 rounded-2xl divide-y divide-base-300 overflow-hidden">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-300 transition-colors text-error">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-error/10">
                      <LogOut className="w-5 h-5 text-error" />
                    </div>
                    <p className="font-medium">Đăng xuất</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SettingPoup;
