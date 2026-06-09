import React, { useState, useEffect } from "react";
import { Download, Repeat, Share, Trash2, X } from "lucide-react";
import PlanBadge from "@/components/ui/PlanBadge/PlanBadge";
import {
  SonnerSuccess,
  SonnerWarning,
  SonnerInfo,
} from "@/components/ui/SonnerToast";
import Modal from "@/components/ui/Modal";
import { DeleteMoment, downloadAndShareFile } from "@/services";
import { getMomentById } from "@/cache/momentDB";
import {
  useMomentsStoreV2,
  useSelectedStore,
  useUploadQueueStore,
} from "@/stores";
import { getUploadItemFromDB } from "@/cache/uploadMomentDB";

const OptionMoment = ({ setOptionModalOpen, isOptionModalOpen }) => {
  const selectedMoment = useSelectedStore((s) => s.selectedMoment);
  const setSelectedMoment = useSelectedStore((s) => s.setSelectedMoment);

  const selectedQueue = useSelectedStore((s) => s.selectedQueue);
  const setSelectedQueue = useSelectedStore((s) => s.setSelectedQueue);

  const selectedMomentId = useSelectedStore((s) => s.selectedMomentId);
  const setSelectedMomentId = useSelectedStore((s) => s.setSelectedMomentId);

  const selectedQueueId = useSelectedStore((s) => s.selectedQueueId);
  const setSelectedQueueId = useSelectedStore((s) => s.setSelectedQueueId);

  const selectedFriendUid = useSelectedStore((s) => s.selectedFriendUid);
  const setSelectedFriendUid = useSelectedStore((s) => s.setSelectedFriendUid);

  const [openModal, setOpenModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const removeMoment = useMomentsStoreV2((s) => s.removeMoment);

  const { removeUploadItemById } = useUploadQueueStore();
  // Lock scroll khi mở modal
  useEffect(() => {
    document.body.style.overflow = isOptionModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOptionModalOpen]);

  const handleClose = () => {
    setSelectedMoment(null);
    setSelectedQueue(null);
    setSelectedQueueId(null);
    setSelectedMomentId(null);
  };

  const handleDelete = async () => {
    if (selectedMomentId !== null) {
      try {
        //Call API xoá ảnh
        const deletedMoment = await DeleteMoment(selectedMomentId);
        if (deletedMoment === selectedMomentId) {
          //Xoá ảnh trong local nếu id đã xoá trùng id chọn
          await removeMoment(selectedMomentId, selectedFriendUid);
          SonnerSuccess("Đã xoá ảnh thành công!");
          handleClose();
        } else {
          SonnerWarning("Xoá không thành công, vui lòng thử lại!");
        }
      } catch (error) {
        SonnerWarning("Xoá không thành công, vui lòng thử lại!");
        console.warn("❌ Failed", error);
      }
      return;
    }

    if (selectedQueueId !== null) {
      await removeUploadItemById(selectedQueueId);
      SonnerSuccess("Đã xoá khỏi hàng chờ!");
      handleClose();
    }
  };

  const getMediaInfo = async () => {
    if (selectedQueueId !== null) {
      const data = await getUploadItemFromDB(selectedQueueId);
      if (!data) return null;

      const { url, publicUrl, publicURL, type } = data.mediaInfo || {};
      const mediaUrl = publicUrl || publicURL || url;

      if (!mediaUrl) return null;

      return {
        url: mediaUrl,
        filename: `moment_${selectedQueueId}.${type === "video" ? "mp4" : "jpg"}`,
      };
    }

    if (selectedMomentId !== null) {
      const data = await getMomentById(selectedMomentId);
      if (!data) return null;

      if (data.videoUrl) {
        return {
          url: data.videoUrl,
          filename: `moment_${selectedMomentId}.mp4`,
        };
      }

      if (data.thumbnailUrl) {
        return {
          url: data.thumbnailUrl,
          filename: `moment_${selectedMomentId}.jpg`,
        };
      }
    }

    return null;
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    SonnerInfo("Đang chuẩn bị tải xuống...");

    try {
      const media = await getMediaInfo();
      if (!media) {
        SonnerInfo("Không có video hoặc thumbnail để tải");
        return;
      }

      await downloadAndShareFile(media.url, media.filename, () =>
        setDownloading(false),
      );
    } catch (err) {
      SonnerWarning(
        "Phương tiện không tồn tại hoặc đã huỷ quá trình tải xuống.",
      );
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSharing = async () => {
    if (sharing) return;
    setSharing(true);
    SonnerInfo("Đang chuẩn bị chia sẻ...");

    try {
      const media = await getMediaInfo();
      if (!media) {
        SonnerInfo("Không có video hoặc thumbnail để tải");
        return;
      }

      await downloadAndShareFile(media.url, media.filename, () =>
        setSharing(false),
      );
    } catch (err) {
      SonnerWarning("Phương tiện không tồn tại hoặc đã huỷ quá trình chia sẻ.");
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-base-100/30 backdrop-blur-[4px] transition-opacity duration-500 z-[62] ${
          isOptionModalOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOptionModalOpen(false)}
      />

      <div
        className={`fixed border md:border-none border-base-200/50 bottom-0 md:bottom-auto md:top-1/2 left-0 md:left-1/2 w-full md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 p-6 bg-base-100/95 backdrop-blur-2xl rounded-t-[32px] md:rounded-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] md:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-400 ease-out z-[63] flex flex-col text-base-content ${
          isOptionModalOpen
            ? "opacity-100 translate-y-0 md:translate-y-[-50%] md:scale-100"
            : "opacity-0 translate-y-full md:translate-y-[-40%] md:scale-95 pointer-events-none"
        }`}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-base-300 rounded-full mx-auto mb-4 md:hidden"></div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[1.4rem] font-bold font-lovehouse text-base-content tracking-wide">
              Option Moment
            </h3>
            <p className="text-left text-sm mt-1.5 text-base-content/60 leading-relaxed max-w-[95%]">
              Quản lý khoảnh khắc này, lưu về thiết bị, chia sẻ hoặc xóa khỏi lịch sử.
            </p>
          </div>
          <button
            onClick={() => setOptionModalOpen(false)}
            className="btn btn-sm btn-circle btn-ghost bg-base-200/50 hover:bg-base-300 text-base-content/80"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Buttons Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn h-[88px] bg-base-200 hover:bg-base-300 text-base-content border-none rounded-[24px] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {downloading ? (
              <span className="loading loading-spinner loading-md text-[#00c3ff]"></span>
            ) : (
              <div className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm text-[#00c3ff]">
                <Download size={20} strokeWidth={2.5} />
              </div>
            )}
            <span className="text-[13px] font-semibold tracking-wide">Tải xuống</span>
          </button>

          <button
            onClick={() => SonnerInfo("Chức năng này sẽ sớm có mặt!")}
            className="btn h-[88px] bg-base-200 hover:bg-base-300 text-base-content border-none rounded-[24px] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm text-base-content/80">
              <Repeat size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-semibold tracking-wide">Đăng lại</span>
          </button>

          <button
            onClick={handleSharing}
            disabled={sharing}
            className="btn h-[88px] bg-base-200 hover:bg-base-300 text-base-content border-none rounded-[24px] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {sharing ? (
              <span className="loading loading-spinner loading-md text-base-content/80"></span>
            ) : (
              <div className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm text-base-content/80">
                <Share size={20} strokeWidth={2.5} />
              </div>
            )}
            <span className="text-[13px] font-semibold tracking-wide">Chia sẻ</span>
          </button>

          <button
            onClick={() => {
              setOptionModalOpen(false);
              setOpenModal(true);
            }}
            className="btn h-[88px] bg-error/10 hover:bg-error/15 text-error border-none rounded-[24px] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-base-100/50 flex items-center justify-center shadow-sm text-error">
              <Trash2 size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-semibold tracking-wide">Xóa ảnh</span>
          </button>
        </div>
      </div>

      {/* Modal xoá giữ nguyên */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Xoá ảnh?"
        actions={
          <>
            <button
              onClick={() => setOpenModal(false)}
              className="btn btn-soft px-4 py-2 rounded-xl transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={() => {
                handleDelete();
                setOpenModal(false);
              }}
              className="btn btn-error px-4 py-2 rounded-xl transition-colors"
            >
              Xoá
            </button>
          </>
        }
      >
        Việc này sẽ xoá ảnh khỏi lịch sử của bạn và không thể hoàn tác.
      </Modal>
    </>
  );
};

export default OptionMoment;
