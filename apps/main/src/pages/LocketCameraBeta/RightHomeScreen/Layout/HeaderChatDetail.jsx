import { ChevronLeft, Ellipsis } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

const ChatDetailHeader = ({ selectedChat, onBack }) => {
  return (
    <div className="flex items-center justify-between shadow-lg px-4 py-2">
      {/* Left */}
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="btn p-1 border-0 rounded-full hover:bg-base-200 transition cursor-pointer"
        >
          <ChevronLeft size={30} />
        </button>
      </div>

      {/* Center */}
      <div className="flex-1 flex justify-center items-center flex-row gap-3 text-center">
        <Avatar
          src={selectedChat?.friend?.profilePic}
          firstName={selectedChat?.friend?.firstName || "?"}
          className="w-9 h-9 border-none p-0"
        />
        <h2 className="text-lg font-bold truncate">
          {selectedChat?.friend
            ? `${selectedChat?.friend?.firstName} ${selectedChat?.friend?.lastName}`
            : "Chi tiết cuộc trò chuyện"}
        </h2>
      </div>

    </div>
  );
};

export default ChatDetailHeader;
