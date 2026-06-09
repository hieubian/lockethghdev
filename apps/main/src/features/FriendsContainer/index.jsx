import { useRef, useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { X } from "lucide-react";
import { AcceptRequestToFriend } from "@/services";
import IncomingFriendRequests from "./IncomingRequests";
import { SonnerError, SonnerSuccess } from "@/components/ui/SonnerToast";
import OutgoingRequest from "./OutgoingRequest";
import { useFriendList, useFriendStoreV3 } from "@/stores";
import FindFriend from "./FindFriend";
import FriendList from "./FriendList";

const FriendsContainer = () => {
  const popupRef = useRef(null);
  const { navigation } = useApp();

  const {
    loading,
    loadFriends,
    removeFriendLocal,
    addFriendLocal,
    hiddenUserState,
  } = useFriendStoreV3();

  const friendList = useFriendList();

  const { isFriendsTabOpen, setFriendsTabOpen, isPWA } = navigation;
  const [showAllFriends, setShowAllFriends] = useState(false);

  // Drag states
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef(null);

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
      // e.preventDefault(); // Bỏ comment nếu cần ngăn chặn cuộn body khi kéo ở header
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 120) {
      // Kéo đủ xa thì đóng
      setFriendsTabOpen(false);
      setShowAllFriends(false);
    }
    // Trở về vị trí cũ nếu không đủ xa
    setDragOffset(0);
    dragStartY.current = null;
  };

  //Khoá cuộn màn hình cho thẻ body
  useEffect(() => {
    if (isFriendsTabOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      setShowAllFriends(false);
      setDragOffset(0);
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
      setShowAllFriends(false);
    };
  }, [isFriendsTabOpen]);

  const handleAcceptRequest = async (uid) => {
    try {
      const data = await AcceptRequestToFriend(uid);
      if (data) {
        addFriendLocal(data);
        // ✅ Hiển thị thông báo
        SonnerSuccess(
          "Thông báo từ Locket hgh",
          `Đã chấp nhận ${data.firstName}`,
        );
      } else {
        SonnerError(
          "Thông báo từ Locket hgh",
          "Không tìm thấy lời mời để chấp nhận.",
        );
      }
    } catch (error) {
      console.error("❌ Lỗi khi chấp nhận lời mời:", error.message || error);
      SonnerError("❌ Chấp nhận lời mời thất bại!");
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-base-100/10 backdrop-blur-[2px] bg-opacity-50 transition-opacity duration-500 z-0 ${
          isFriendsTabOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
        onClick={() => {
          setFriendsTabOpen(false);
          setShowAllFriends(false);
        }}
      />

      {/* Popup */}
      <div
        className={`fixed inset-0 z-50 flex justify-center items-end text-base-content ${
          isFriendsTabOpen
            ? ""
            : "pointer-events-none"
        }`}
      >
        {/* Overlay Background */}
        <div 
          className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ${
            isFriendsTabOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setFriendsTabOpen(false)}
        ></div>
        <div
          ref={popupRef}
          className={`relative w-full max-w-7xl mx-auto h-[85vh] sm:h-[85vh]
            bg-base-100 flex flex-col rounded-t-4xl shadow-lg z-50`}
          style={{
            transform: isFriendsTabOpen ? `translateY(${dragOffset}px)` : 'translateY(100%)',
            transition: dragOffset > 0 ? 'none' : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
          }}
        >
          {/* Header */}
          <div 
            className="sticky top-0 shadow-md z-10 flex flex-col items-center pb-2 px-3 bg-base-100 rounded-t-4xl touch-none cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex justify-between items-center w-full">
              <div className="w-12 h-1.5 bg-base-content rounded-full mx-auto my-2" />
              <button
                className="absolute top-4 right-4 text-base-content/70 hover:text-base-content hover:bg-base-200 p-2 rounded-full transition-all duration-300"
                onClick={() => setFriendsTabOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <h1 className="text-2xl font-semibold text-base-content mt-2">
              {friendList.length} người bạn
            </h1>
            <h2 className="text-md font-semibold text-base-content">
              Tìm kiếm và thêm bạn thân
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 pt-6 pb-28 md:pb-6 space-y-6">
            {/* Danh sách bạn bè */}
            <FriendList
              loading={loading}
              loadFriends={loadFriends}
              removeFriendLocal={removeFriendLocal}
              hiddenUserState={hiddenUserState}
              showAllFriends={showAllFriends}
              setShowAllFriends={setShowAllFriends}
            />

            {/* Requests */}
            <IncomingFriendRequests handleAcpFriend={handleAcceptRequest} />
            <OutgoingRequest />
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendsContainer;
