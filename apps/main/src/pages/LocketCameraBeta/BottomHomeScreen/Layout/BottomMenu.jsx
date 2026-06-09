import { CalendarHeart, LayoutGrid, Share, Download } from "lucide-react";
import InputForMoment from "./InputForMoment";
import { SonnerInfo, SonnerSuccess, SonnerError } from "@/components/ui/SonnerToast";
import { useMomentActivityStore, useSelectedStore, useThemeStore, CAMERA_THEMES, useMomentsStoreV2 } from "@/stores";

const BottomMenu = ({ setIsBottomOpen, setOptionModalOpen }) => {
  const selectedMoment = useSelectedStore((s) => s.selectedMoment);
  const selectedQueue = useSelectedStore((s) => s.selectedQueue);
  const { currentThemeId } = useThemeStore();
  const activeTheme = CAMERA_THEMES.find(t => t.id === currentThemeId) || CAMERA_THEMES[0];

  const setSelectedMoment = useSelectedStore((s) => s.setSelectedMoment);
  const setSelectedQueue = useSelectedStore((s) => s.setSelectedQueue);

  const selectedMomentId = useSelectedStore((s) => s.selectedMomentId);
  const setSelectedMomentId = useSelectedStore((s) => s.setSelectedMomentId);
  const setSelectedQueueId = useSelectedStore((s) => s.setSelectedQueueId);

  const clearActivity = useMomentActivityStore((s) => s.clearActive);

  const resetSelection = () => {
    setSelectedMoment(null);
    setSelectedQueue(null);
    setSelectedMomentId(null);
    setSelectedQueueId(null);
    clearActivity();
  };

  const handleReturnHome = () => {
    resetSelection();
    setIsBottomOpen(false);
  };

  const handleClose = () => {
    resetSelection();
  };

  const moments = useMomentsStoreV2((s) => s.momentsByUser);
  const selectedFriendUid = useSelectedStore((s) => s.selectedFriendUid);

  const handleDownload = async () => {
    if (!selectedMomentId) return;
    
    // Tìm moment hiện tại để lấy URL
    const selectedKey = selectedFriendUid ?? "all";
    const momentList = moments[selectedKey]?.moments ?? [];
    const currentMoment = momentList.find((item) => item.id === selectedMomentId);
    
    if (!currentMoment || !currentMoment.thumbnail_url) {
       SonnerError("Không tìm thấy link ảnh gốc!");
       return;
    }
    
    SonnerInfo("Đang tải ảnh gốc...", "Vui lòng đợi");
    
    try {
      const response = await fetch(currentMoment.thumbnail_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Locket_VIP_${currentMoment.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      SonnerSuccess("Tải ảnh gốc thành công!");
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
      // Fallback mở tab mới nếu fetch bị CORS
      window.open(currentMoment.thumbnail_url, "_blank");
      SonnerSuccess("Đã mở ảnh gốc ở tab mới!");
    }
  };

  return (
    <>
      <div 
        className="fixed z-70 w-full max-w-7xl left-1/2 transform -translate-x-1/2 bottom-0 px-5 text-base-content space-y-3"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        {typeof selectedMoment === "number" && <InputForMoment />}

        <div className="grid grid-cols-3 items-center">
          <div className="flex justify-start">
            {(selectedMoment !== null || selectedQueue !== null) && (
              <button
                className="p-2 text-base-content cursor-pointer hover:bg-base-200/50 rounded-full transition-colors"
                onClick={handleClose}
              >
                <LayoutGrid size={28} />
              </button>
            )}
          </div>

          <div className="flex justify-center scale-75 sm:scale-65">
            <button
              onClick={handleReturnHome}
              className={`relative flex items-center justify-center w-20 h-20 aspect-square transition-all duration-300 ${
                selectedMoment === null && selectedQueue === null 
                  ? "opacity-0 scale-0 pointer-events-none" 
                  : "opacity-100 scale-100"
              }`}
            >
              <div 
                className="absolute w-[68px] h-[68px] aspect-square ring-4 rounded-full z-10 opacity-80"
                style={{ color: activeTheme.primaryColor }}
              ></div>
              <div className="absolute rounded-full w-16 h-16 aspect-square camera-inner-circle z-0 hover:scale-105 transition-transform"></div>
            </button>
          </div>

          <div className="flex justify-end items-center gap-2">
            {(selectedMoment !== null || selectedQueue !== null) && (
              <>
                <button
                  onClick={handleDownload}
                  className="p-2 text-base-content cursor-pointer hover:bg-base-200/50 rounded-full transition-colors"
                  title="Tải ảnh gốc siêu nét"
                >
                  <Download size={28} strokeWidth={2} className="text-primary" />
                </button>
                <button
                  onClick={() => setOptionModalOpen(true)}
                  className="p-2 text-base-content cursor-pointer hover:bg-base-200/50 rounded-full transition-colors"
                >
                  <Share size={28} strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomMenu;
