import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowUp, SmilePlus } from "lucide-react";
import clsx from "clsx";
import { useApp } from "@/context/AppContext";
import { SendMessageMoment, SendReactMoment } from "@/services";
import { getMomentById } from "@/cache/momentDB";
import { SonnerError, SonnerSuccess, SonnerInfo } from "@/components/ui/SonnerToast";
import { getFriendDetail } from "@/cache/friendsDB";
import ActivitySection from "../Modal/ActivityViews/ActivityModal";
import { markMomentViewedOnce } from "@/cache/viewedMomentDB";
import {
  useAuthStore,
  useMomentsStoreV2,
  useMomentActivityStore,
  useSelectedStore,
  useUserSetting,
  resolveMyUid,
  resolveMomentOwnerUid,
  useReactionStore,
} from "@/stores";

const InputForMoment = () => {
  const { user } = useAuthStore();
  const myUid = resolveMyUid(user);

  const selectedMomentId = useSelectedStore((s) => s.selectedMomentId);
  const selectedFriendUid = useSelectedStore((s) => s.selectedFriendUid);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__SELECTED_MOMENT_ID__ = selectedMomentId;
      if (selectedMomentId) {
        getMomentById(selectedMomentId).then(m => {
          window.__CURRENT_RAW_MOMENT__ = m;
          console.log("MOMENT RAW FROM DB:", m);
        });
      }
    }
  }, [selectedMomentId]);

  const selectedKey = selectedFriendUid ?? "all";
  const moments =
    useMomentsStoreV2((s) => s.momentsByUser[selectedKey]?.moments) ?? [];

  const knownOwnerFromList = useMemo(() => {
    if (!selectedMomentId) return null;
    const m = moments.find((item) => item.id === selectedMomentId);
    return resolveMomentOwnerUid(m);
  }, [moments, selectedMomentId]);

  const syncForSelectedMoment = useMomentActivityStore(
    (s) => s.syncForSelectedMoment,
  );
  const clearActive = useMomentActivityStore((s) => s.clearActive);
  const activityEntry = useMomentActivityStore((s) =>
    selectedMomentId ? s.byMomentId[selectedMomentId] : null,
  );

  const { setShowEmojiPicker } = useApp().post;

  const [showFullInput, setShowFullInput] = useState(false);
  const [message, setMessage] = useState("");
  const [reactionPower, setReactionPower] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdingEmoji, setHoldingEmoji] = useState(null);
  const holdInterval = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  // thêm state
  const [reactionEffectEmoji, setReactionEffectEmoji] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [isLoadingMomentMeta, setIsLoadingMomentMeta] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSendingReaction, setIsSendingReaction] = useState(false);
  const [isAnonymousChat, setIsAnonymousChat] = useState(false); // 🔥 State cho Anonymous Chat
  const [isBomberMode, setIsBomberMode] = useState(false); // 🔥 State cho Bomber Mode

  const ownerUid = activityEntry?.ownerUid ?? knownOwnerFromList;
  const isOwnMoment = Boolean(myUid && ownerUid && myUid === ownerUid);
  const isPublic = activityEntry?.isPublic ?? true;
  const activity = activityEntry?.activity ?? [];
  const pollCounts = activityEntry?.pollCounts ?? null;
  const isLoadingActivity = activityEntry?.loading ?? false;

  useEffect(() => {
    if (!selectedMomentId) {
      clearActive();
      setUserDetail(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoadingMomentMeta(true);

      await syncForSelectedMoment({
        momentId: selectedMomentId,
        myUid,
        ownerUid: knownOwnerFromList,
      });

      if (cancelled || !selectedMomentId) return;

      const entry =
        useMomentActivityStore.getState().byMomentId[selectedMomentId];
      const resolvedOwner = entry?.ownerUid ?? knownOwnerFromList;

      if (!resolvedOwner || resolvedOwner === myUid) {
        setUserDetail(null);
        setIsLoadingMomentMeta(false);
        return;
      }

      try {
        const data = await getFriendDetail(resolvedOwner);
        if (!cancelled) setUserDetail(data);
      } catch (err) {
        console.error("Lỗi khi lấy user detail:", err);
      } finally {
        if (!cancelled) setIsLoadingMomentMeta(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    selectedMomentId,
    myUid,
    knownOwnerFromList,
    syncForSelectedMoment,
    clearActive,
  ]);

  const showSeenMoments = useUserSetting((s) => s.showSeenMoments);
  const ghostMode = useUserSetting((s) => s.ghostMode);

  useEffect(() => {
    if (!selectedMomentId || !ownerUid || isOwnMoment) return;
    if (!showSeenMoments) return;
    if (ghostMode) return; // 🔥 Không gửi sự kiện Đã Xem nếu bật Tàng Hình

    const markViewed = async () => {
      try {
        await markMomentViewedOnce({
          id: selectedMomentId,
          user: ownerUid,
        });
      } catch (err) {
        console.error("❌ Lỗi mark viewed:", err);
      }
    };

    markViewed();
  }, [selectedMomentId, ownerUid, isOwnMoment, showSeenMoments]);

  const triggerReaction = useReactionStore((s) => s.triggerReaction);
  const sendReact = async (emoji, power = 0, isSpam = false) => {
    if ((isSendingReaction && !isSpam) || !selectedMomentId) return;

    try {
      if (!isSpam) setIsSendingReaction(true);

      // trigger effect
      await SendReactMoment(emoji, selectedMomentId, power);
      triggerReaction(emoji);
      if (!isSpam) SonnerSuccess("Gửi cảm xúc thành công!");
      if (!isSpam) setShowEmojiPicker(false);
    } catch (error) {
      if (!isSpam) SonnerError("Gửi cảm xúc thất bại!");
      console.error("Lỗi khi gửi react:", error);
    } finally {
      if (!isSpam) setIsSendingReaction(false);

      // reset để lần sau trigger lại
      setTimeout(() => {
        setReactionEffectEmoji(null);
      }, 10000);
    }
  };

  const handleSpamReaction = async (emoji) => {
    if (isSendingReaction) return;
    setIsBomberMode(false);
    SonnerInfo(`Đang spam 1000 ⚡ ${emoji}...`, "Vui lòng đợi");
    setIsSendingReaction(true);
    try {
      // Bắn 1 phát max cường độ (1000)
      await sendReact(emoji, 1000, true);
      // Vòng lặp bắn thêm vài phát nữa để chắc chắn nổ server
      for (let i = 0; i < 5; i++) {
        await SendReactMoment(emoji, selectedMomentId, 1000);
      }
      SonnerSuccess(`Đã nã bão ${emoji} thành công!`);
    } catch (error) {
      SonnerError("Spam thất bại!");
    } finally {
      setIsSendingReaction(false);
    }
  };

  const handleHackPoll = async () => {
    if (isSendingReaction) return;
    SonnerInfo("Đang hack Poll...", "Gửi 100 lượt vote ảo");
    setIsSendingReaction(true);
    try {
      for (let i = 0; i < 100; i++) {
         // Locket vote poll thông qua reaction, mặc định vote left là emoji đầu
         await SendReactMoment("👍", selectedMomentId, 0); 
      }
      SonnerSuccess("Đã bơm 100 lượt Vote thành công!");
    } catch (error) {
       SonnerError("Lỗi bơm vote!");
    } finally {
      setIsSendingReaction(false);
    }
  };

  const handleHoldStart = (emoji) => {
    if (isSendingReaction) return;

    setIsHolding(true);
    setHoldingEmoji(emoji);
    setReactionPower(0);
    holdInterval.current = setInterval(() => {
      setReactionPower((prev) => (prev >= 1000 ? 1000 : prev + 1));
    }, 0.1);
  };

  const handleHoldEnd = (emoji) => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    if (isHolding && !isSendingReaction) sendReact(emoji, reactionPower);
    setIsHolding(false);
    setHoldingEmoji(null);
    setReactionPower(0);
  };

  const onEmojiDown = (e, emoji) => {
    if (isBomberMode) {
      e.preventDefault();
      e.stopPropagation();
      handleSpamReaction(emoji);
    } else {
      handleHoldStart(emoji);
    }
  };

  const onEmojiUp = (e, emoji) => {
    if (!isBomberMode && isHolding) {
      handleHoldEnd(emoji);
    }
  };

  const handleSend = async () => {
    if (isSendingMessage || !message.trim() || !selectedMomentId) return;

    try {
      setIsSendingMessage(true);
      const moment = await getMomentById(selectedMomentId);
      
      // 🔥 Ghost Chat: Đổi uid người gửi để thành ẩn danh
      if (isAnonymousChat) {
         await SendMessageMoment(message, selectedMomentId, moment.user, true);
         SonnerSuccess("Đã gửi tin nhắn ẩn danh 👻!");
      } else {
         await SendMessageMoment(message, moment.id, moment.user, false);
         SonnerSuccess("Gửi tin nhắn thành công!");
      }
      
      setMessage("");
      setShowFullInput(false);
      setIsAnonymousChat(false);
    } catch (error) {
      SonnerError("Gửi tin nhắn thất bại!");
      console.error("❌ Lỗi khi gửi message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const fullName = `${userDetail?.firstName || ""} ${
    userDetail?.lastName || ""
  }`.trim();
  const shortName =
    fullName.length > 10 ? fullName.slice(0, 10) + "…" : fullName;

  useEffect(() => {
    if (!showFullInput) return;

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowFullInput(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showFullInput]);

  if (!selectedMomentId) return null;

  if (isOwnMoment) {
    return (
      <div className="w-full max-w-[480px] mx-auto">
        <ActivitySection
          isPublic={isPublic}
          activity={activity}
          pollCounts={pollCounts}
          isLoading={isLoadingActivity || isLoadingMomentMeta}
        />
      </div>
    );
  }

  return (
    <>
      {showFullInput && (
        <div ref={wrapperRef} className="z-50 w-full max-w-[480px] mx-auto">
          <div className="relative w-full">
            <div className="flex w-full items-center gap-3 px-4 py-3.5 bg-base-200 rounded-3xl shadow-md">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Trả lời ${shortName}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSendingMessage || userDetail?.isCelebrity}
                className="flex-1 bg-transparent focus:outline-none font-semibold pl-1 disabled:opacity-50"
              />
              <button
                onClick={() => setIsAnonymousChat(!isAnonymousChat)}
                disabled={isSendingMessage || userDetail?.isCelebrity}
                className={`btn absolute right-[3.5rem] p-1 btn-sm btn-circle flex justify-center items-center disabled:opacity-50 transition-colors ${
                  isAnonymousChat ? "bg-purple-500 text-white" : "bg-base-300 text-base-content/60"
                }`}
                title="Tin nhắn Ẩn Danh (Ghost Chat)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ghost"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
              </button>
              <button
                onClick={handleSend}
                disabled={
                  isSendingMessage || !message.trim() || userDetail?.isCelebrity
                }
                className={`btn absolute right-3 p-1 btn-sm btn-circle flex justify-center items-center disabled:opacity-50 transition-colors ${
                   isAnonymousChat ? "bg-purple-500 text-white" : "bg-base-300 text-base-content"
                }`}
              >
                {isSendingMessage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-base-content"></div>
                ) : (
                  <ArrowUp className="text-base-content w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showFullInput && (
        <div className="w-full max-w-[480px] mx-auto">
          <div className="relative w-full">
            <div
              className={clsx(
                "flex items-center w-full px-4 py-3.5 rounded-3xl bg-base-200 shadow-md",
                userDetail?.isCelebrity
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-text",
              )}
              onClick={() => {
                if (!userDetail?.isCelebrity) setShowFullInput(true);
              }}
            >
              <span className="flex-1 text-md text-base-content/60 font-semibold pl-1">
                Gửi tin nhắn...
              </span>
            </div>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-4 pointer-events-auto px-2 items-center">
              {["🤣", "💛", "😋"].map((emoji) => (
                <div key={emoji} className="relative group flex items-center justify-center">
                  <button
                    title={emoji}
                    disabled={isSendingReaction}
                    onMouseDown={(e) => onEmojiDown(e, emoji)}
                    onMouseUp={(e) => onEmojiUp(e, emoji)}
                    onMouseLeave={(e) => onEmojiUp(e, emoji)}
                    onTouchStart={(e) => onEmojiDown(e, emoji)}
                    onTouchEnd={(e) => onEmojiUp(e, emoji)}
                    className={`cursor-pointer select-none text-3xl transition-all disabled:opacity-50 ${
                      holdingEmoji === emoji ? "shake" : ""
                    } ${isBomberMode ? "animate-bounce drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-110" : ""} ${isSendingReaction ? "pointer-events-none" : ""}`}
                  >
                    <span>{emoji}</span>
                  </button>
                </div>
              ))}

              {/* Nút bật/tắt chế độ Bomber */}
              <button
                type="button"
                onClick={() => setIsBomberMode(!isBomberMode)}
                disabled={isSendingReaction}
                className={`cursor-pointer relative disabled:opacity-50 p-2 rounded-full transition-all ${
                  isBomberMode ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse" : "text-red-500 hover:bg-red-500/10"
                }`}
                title="Bật/Tắt Chế Độ Bão Cảm Xúc (Bomber Mode)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bomb"><circle cx="11" cy="13" r="9"/><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/><path d="m22 2-1.5 1.5"/></svg>
              </button>
              
              {/* Nút Hack Poll (nếu ảnh là dạng poll) */}
              {pollCounts && (
                 <button
                  type="button"
                  onClick={handleHackPoll}
                  className="cursor-pointer relative disabled:opacity-50 text-purple-500 hover:text-purple-600 bg-purple-500/10 p-1.5 rounded-full"
                  title="Hack Poll (Bơm 100 vote ảo)"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
                 </button>
              )}

              <button
                type="button"
                disabled={isSendingReaction}
                className="cursor-pointer relative disabled:opacity-50"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <SmilePlus className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InputForMoment;
