// src/socket/socketClient.js
import { API_ENDPOINTS } from "@/config/apiConfig";
import { io } from "socket.io-client";

export const createSocket = (idToken, { onConnect, onDisconnect, onError } = {}) => {
  if (!idToken) return null;

  const socketClient = io(API_ENDPOINTS.socketUrl, {
    // Ép dùng WebSocket ngay từ đầu để tránh lỗi Sticky Session của Load Balancer
    transports: ["websocket"],
    auth: { token: idToken },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 8000,
    timeout: 20000,
  });

  // Trạng thái kết nối
  socketClient.on("connect", () => {
    console.log("Socket connected:", socketClient.id);
    onConnect?.(socketClient);
  });

  socketClient.on("disconnect", () => {
    onDisconnect?.();
  });

  let errorCount = 0;
  socketClient.on("connect_error", (err) => {
    errorCount++;
    // Chỉ log 1 lần đầu, sau đó im lặng
    if (errorCount === 1) {
      console.warn("[Socket] Không thể kết nối real-time. Tính năng vẫn hoạt động bình thường, chỉ mất cập nhật tự động.");
    }
    // Tắt reconnect sau 3 lần để không spam
    if (errorCount >= 3) {
      socketClient.io.reconnection(false);
    }
    onError?.(err);
  });

  socketClient.connect();
  return socketClient;
};
