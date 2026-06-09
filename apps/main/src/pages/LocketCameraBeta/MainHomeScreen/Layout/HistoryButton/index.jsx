import React, { useEffect } from "react";
import { useMomentsStoreV2, useSelectedStore, useAuthStore } from "@/stores";

const HistoryArrow = ({ setIsBottomOpen }) => {
  const selectedFriendUid = useSelectedStore((s) => s.selectedFriendUid);
  const setSelectedMoment = useSelectedStore((s) => s.setSelectedMoment);
  const setSelectedMomentId = useSelectedStore((s) => s.setSelectedMomentId);
  const user = useAuthStore((s) => s.user);
  const fetchMoments = useMomentsStoreV2((s) => s.fetchMoments);
  
  const selectedKey = selectedFriendUid ?? "all";
  const bucket = useMomentsStoreV2((s) => s.momentsByUser[selectedKey]);
  const moments = bucket?.moments ?? [];

  useEffect(() => {
    if (user) {
      fetchMoments(user, selectedFriendUid);
    }
  }, [user, selectedFriendUid, fetchMoments]);

  const handleClick = () => {
    if (moments && moments.length > 0) {
      setSelectedMoment(0);
      setSelectedMomentId(moments[0].id);
    }
    setIsBottomOpen(true);
  };

  return (
    <>
      <div className={`flex flex-col items-center select-none`}>
        <button
          className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
          onClick={handleClick}
        >
          <div className="flex items-center justify-center space-x-2 mb-1">
            {/* <div className="bg-accent text-base-content font-semibold px-[9px] py-0.5 rounded-lg shadow-md">
          {recentPosts.length}
        </div> */}
            <span className="text-xl font-semibold text-base-content">
              Lịch sử
            </span>
          </div>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className=""
          >
            <path
              d="M4 8l17 7l17-7"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
};

export default HistoryArrow;
