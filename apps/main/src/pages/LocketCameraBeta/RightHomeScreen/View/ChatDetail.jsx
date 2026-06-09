import React, { useState, useRef, useMemo, useLayoutEffect } from "react";
import ChatDetailHeader from "../Layout/HeaderChatDetail";
import ChatDetailFooter from "../Layout/InputChatDetail";
import Avatar from "@/components/ui/Avatar";

// ================= Component: ChatMessageItem =================
const ChatMessageItem = ({ msg, selectedChat }) => {
  const me = localStorage.getItem("localId");
  const isMe = msg.sender === me;

  return (
    <div className={`chat ${isMe ? "chat-end" : "chat-start"} mb-2 group`} key={msg.id}>
      {/* Avatar bạn bè */}
      {!isMe && (
        <div className="chat-image avatar">
          <Avatar
            src={selectedChat?.friend?.profilePic}
            firstName={selectedChat?.friend?.firstName || "?"}
            className="w-8 h-8 shadow-sm border-none p-0 text-sm"
          />
        </div>
      )}

      {/* Nội dung */}
      <div 
        className={`chat-bubble relative shadow-sm max-w-[85%] sm:max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed 
          ${isMe 
            ? "!bg-[#00c3ff] !text-white rounded-3xl rounded-br-sm" 
            : "!bg-base-200/80 !text-base-content rounded-3xl rounded-bl-sm"
          }`}
      >
        {/* Reply */}
        {msg.reply_moment && (
          <div className={`text-xs italic mb-2 ${isMe ? "text-white/80 border-white/30" : "text-base-content/60 border-base-content/20"} border-l-2 pl-2`}>
            ↪ {msg.reply_moment}
          </div>
        )}

        {/* Ảnh thumbnail */}
        {msg.thumbnail_url && (
          <img
            src={msg.thumbnail_url}
            alt="thumbnail"
            className="w-48 max-w-full h-auto object-cover rounded-xl my-1.5 shadow-sm"
          />
        )}

        {/* Text */}
        <span className="whitespace-pre-wrap break-words">{msg.text}</span>

        {/* Reactions */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className="absolute -bottom-3 -right-2 flex gap-1 bg-base-100 p-1 px-1.5 rounded-full shadow-md text-xs border border-base-200 z-10">
            {msg.reactions.map((r, idx) => (
              <span key={idx} title={r.sender}>
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thời gian */}
      <div className="chat-footer opacity-0 group-hover:opacity-60 transition-opacity text-[10px] mt-1 font-medium px-1">
        {new Date(Number(msg.create_time) * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};

// ================= Component: ChatDetail =================
const ChatDetail = ({ selectedChat, messages, setSelectedChat, isLoading }) => {
  const [message, setMessage] = useState("");
  const messagesContainerRef = useRef(null);

  // Sort tin nhắn theo thời gian tăng dần
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => Number(a.create_time) - Number(b.create_time)
    );
  }, [messages]);

  // Auto scroll xuống cuối khi mở hoặc khi có tin nhắn mới
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [sortedMessages, selectedChat]);

  return (
    <div
      className={`fixed inset-0 z-60 transition-transform duration-500 bg-base-100 text-base-content 
        ${selectedChat ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="w-full h-full max-w-7xl mx-auto flex flex-col relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-base-100">
          <ChatDetailHeader
            selectedChat={selectedChat}
            onBack={() => setSelectedChat(null)}
          />
        </div>

        {/* Danh sách tin nhắn */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 h-full"
        >
          {isLoading ? (
            // Loading skeleton
            <div className="flex flex-col space-y-4">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-10 w-2/3 bg-base-300 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : sortedMessages.length === 0 ? (
            // Không có tin nhắn
            <div className="flex justify-center items-center h-full text-sm text-base-content/60">
              Chưa có tin nhắn nào
            </div>
          ) : (
            [
              ...new Map(
                sortedMessages
                  .filter((msg) => msg && msg.id) // bỏ null/undefined
                  .map((m) => [m.id, m]) // dùng id làm key trong Map
              ).values(),
            ].map((msg) => (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                selectedChat={selectedChat}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-4 z-10 p-2">
          <ChatDetailFooter selectedChat={selectedChat} />
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
