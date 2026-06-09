import { useState } from "react";
import { useMomentsStoreV2, useSelectedStore } from "@/stores";
import MomentsGallery from "./MomentsGallery";
import UploadingQueue from "./UploadingQueue";
import { SonnerSuccess } from "@/components/ui/SonnerToast";
import { RefreshCcw } from "lucide-react";

const GridMoments = ({ selectedAnimate, setIsBottomOpen }) => {
  const selectedFriendUid = useSelectedStore((s) => s.selectedFriendUid);
  const selectedKey = selectedFriendUid ?? "all";

  const bucket = useMomentsStoreV2((s) => s.momentsByUser[selectedKey]);
  const moments = bucket?.moments ?? [];
  const loading = bucket?.loading ?? false;
  const hasMore = bucket?.hasMore ?? true;
  const visibleCount = bucket?.visibleCount ?? 0;

  const increaseVisibleCount = useMomentsStoreV2((s) => s.increaseVisibleCount);
  const loadMoreOlder = useMomentsStoreV2((s) => s.loadMoreOlder);
  const reloadMoments = useMomentsStoreV2((s) => s.reloadMoments);
  const [loadingMoments, setLoadingMoments] = useState(false);

  const refreshMoments = async () => {
    setLoadingMoments(true);
    try {
      await reloadMoments(selectedFriendUid);
      SonnerSuccess("Làm mới thành công!");
    } catch (err) {
      console.warn("Failed", err);
    } finally {
      setLoadingMoments(false);
    }
  };

  return (
    <div
      className={`w-full px-2 md:px-4 lg:px-8 max-w-7xl mx-auto pb-32 transition-all duration-300 ${
        selectedAnimate
          ? "pointer-events-none select-none opacity-0"
          : "opacity-100"
      }`}
    >
      <div className="sticky top-0 z-40 -mx-2 md:-mx-4 lg:-mx-8 -mt-[64px] pt-[76px] px-3 pb-3 mb-6 bg-transparent backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-b border-base-content/5 grid grid-cols-3 items-center transition-all duration-300">
        
        {/* Trái: Locket History */}
        <div className="flex justify-start">
          <h2 className="text-xl md:text-[1.35rem] font-bold font-lovehouse tracking-wide text-base-content/90 drop-shadow-sm">
            Locket History
          </h2>
        </div>

        {/* Giữa: Nút Về Camera (Chỉ có icon) */}
        <div className="flex justify-center">
          <button 
            className="w-10 h-10 min-h-0 md:w-12 md:h-12 rounded-full p-0 flex items-center justify-center bg-[#00c3ff] hover:bg-[#00c3ff]/90 text-white border-none shadow-[0_4px_12px_rgba(0,195,255,0.3)] hover:shadow-[0_6px_16px_rgba(0,195,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer" 
            onClick={() => setIsBottomOpen(false)}
            title="Về Camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Phải: Nút Làm mới */}
        <div className="flex justify-end">
          <button 
            className="btn btn-sm md:btn-md bg-base-200 hover:bg-base-300 text-base-content border-none rounded-full font-bold shadow-sm hover:shadow transition-all px-4"
            onClick={refreshMoments}
            disabled={loadingMoments}
          >
            {loadingMoments ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <RefreshCcw className="w-4 h-4 md:w-5 md:h-5" />
            )}
            <span className="hidden sm:inline ml-1">Làm mới</span>
          </button>
        </div>

      </div>
      <UploadingQueue />
      <MomentsGallery
        visibleCount={visibleCount}
        increaseVisibleCount={() => increaseVisibleCount(selectedFriendUid)}
        moments={moments}
        loadMoreOlder={loadMoreOlder}
        hasMore={hasMore}
        loading={loading}
      />
    </div>
  );
};

export default GridMoments;
