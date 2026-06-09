# 🔌 Fix Socket.IO CORS & Load Balancer bằng Cloudflare Worker (Bản Chuẩn)

> **TL;DR (Tóm tắt nhanh):** 
> Nếu app React/Vite của bạn gọi tới API Socket.IO nhưng bị lỗi CORS màu đỏ, hoặc báo lỗi `400 Bad Request`, `WebSocket is closed` liên tục. Hãy:
> 1. Dùng code Worker ở cuối trang này tạo 1 Proxy trên Cloudflare (Miễn phí 100%).
> 2. Đổi URL Socket.IO ở frontend sang URL của Worker đó.
> 3. Cài đặt `transports: ["websocket"]` để ép dùng WebSocket. Mọi thứ sẽ mượt mà!

---

Tài liệu này lưu trữ cách giải quyết triệt để 2 vấn đề lớn khi kết nối Socket.IO tới một API Backend (như `api.locket-dio.com`) từ Custom Domain:
1. **Lỗi CORS (Cross-Origin Resource Sharing):** Backend từ chối kết nối vì domain frontend của bạn không nằm trong danh sách cho phép (Whitelist).
2. **Lỗi Sticky Session (400 Bad Request):** Backend sử dụng Load Balancer, khiến các request HTTP Polling bị phân tán tới các server khác nhau, làm mất Session ID (`sid`).

## 🏗️ Kiến trúc & Giải pháp

### 1. Cloudflare Worker (Bypass CORS)
Worker đóng vai trò như một Proxy Server nằm giữa Trình duyệt và Backend Locket.
- Nhận request từ trình duyệt.
- Thay đổi (Spoof) header `Origin` và `Host` thành `http://localhost:3000` (được backend Locket tin tưởng).
- **Điểm mấu chốt:** Sử dụng `fetch()` trả thẳng về `Response` gốc để Cloudflare **tự động duy trì luồng dữ liệu 2 chiều (pipe) của WebSocket**.

### 2. Frontend: Ép dùng WebSocket thuần (Bypass Sticky Sessions)
Thay vì dùng HTTP Polling (bước đệm mặc định của Socket.IO), ta ép client **chỉ sử dụng WebSocket** ngay từ đầu (`transports: ["websocket"]`).
- **Tại sao?** Polling sử dụng nhiều request HTTP (`GET` để lấy sự kiện, `POST` để gửi). Khi đi qua Cloudflare Worker proxy, Load Balancer của backend Locket không nhận diện được "client cũ" -> Đẩy request sang máy chủ backend khác -> Lỗi 400 (Invalid Session).
- **Tại sao WebSocket lại hoạt động?** WebSocket thiết lập một đường truyền TCP duy nhất 1-1 từ đầu đến cuối, không bao giờ bị Load Balancer ngắt giữa chừng hay đẩy sang server khác.

---

## 📁 Cấu trúc

```
cloudflare-socket-worker/
├── worker.js     ← Code Cloudflare Worker proxy chuẩn
└── README.md     ← Tài liệu này
```

---

## 🚀 Hướng dẫn Deploy

### Bước 1: Deploy Cloudflare Worker

1. Vào [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Create Worker**
2. Chọn **"Start with Hello World!"**, đặt tên (VD: `socket-proxy`).
3. Sau khi tạo xong, nhấn **Edit code**.
4. Paste **toàn bộ code** từ file `worker.js` vào.
5. Nhấn **Save & Deploy** → Copy URL của Worker (vd: `https://socket-proxy.yourname.workers.dev`).

### Bước 2: Cấu hình Frontend Vercel

1. Vào [vercel.com](https://vercel.com) → Project của bạn → **Settings** → **Environment Variables**.
2. Thêm biến môi trường:
   - **Key:** `VITE_SOCKET_URL`
   - **Value:** `https://socket-proxy.yourname.workers.dev` (URL Worker bước trên)
3. Nhấn **Save**.

### Bước 3: Sửa Code Frontend (Đã áp dụng trong repo)

Trong file `apps/main/src/socket/socketClient.js`, ta cấu hình:

```javascript
  const socketClient = io(API_ENDPOINTS.socketUrl, {
    // Ép dùng WebSocket ngay từ đầu để tránh lỗi Sticky Session của Load Balancer
    transports: ["websocket"],
    auth: { token: idToken },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });
```

### Bước 4: Redeploy Vercel
Vào Vercel thực hiện **Redeploy** hoặc push code lên Github.

---

## 🔍 Giải thích chi tiết Code `worker.js`

- **Xử lý CORS Preflight (`OPTIONS`):** 
  Socket.IO đòi hỏi Credentials (cookies/auth headers). Do đó `Access-Control-Allow-Origin` không được dùng `*`, mà phải trả về chính xác tên miền gốc của client (`request.headers.get('Origin')`).
  
- **Forward Body của HTTP Polling:**
  Nếu vô tình Socket.IO vẫn fallback về polling (vd mạng yếu rớt websocket), worker phải đọc `request.body` và truyền đi. Cần khai báo `duplex: 'half'` trong `fetchInit` để Cloudflare cho phép streaming body.

- **WebSocket Automatic Piping:**
  ```javascript
  if (response.status === 101) {
    return response;
  }
  ```
  Nếu server backend (Locket) đồng ý Upgrade lên WebSocket (trả về status 101), chỉ cần return trực tiếp `response`. Hệ thống nội tại của Cloudflare Worker sẽ tự động đấu nối và truyền tải mọi Frame dữ liệu giữa Trình duyệt và Server cực kỳ mượt mà, không gặp lỗi rác (so với tự viết code relay thủ công).

---

## ✅ Kiểm tra hoạt động
1. Mở App Locket Web → F12 Mở **DevTools** → Tab **Network**.
2. Lọc từ khóa `socket.io`.
3. Chỉ có 1 request duy nhất với Type là `websocket`.
4. Status là **`101 Switching Protocols`** (Màu xanh hoặc hiển thị Pending tùy trình duyệt nhưng không báo đỏ).
5. Tab Console hiển thị `Socket connected: ...` và avatar realtime hoạt động.

---

## ❓ FAQ & Xử lý sự cố (Troubleshooting)

**Hỏi: Tại sao tôi đã thêm Worker rồi nhưng báo lỗi 400 Bad Request?**
*Đáp:* 99% là bạn đang để `transports: ["polling", "websocket"]`. Phải ép cứng thành `["websocket"]` ở frontend để bypass lỗi Load Balancer của backend.

**Hỏi: Nó báo lỗi "WebSocket is closed before the connection is established"?**
*Đáp:* Code Cloudflare Worker của bạn đang thiếu đoạn proxy Body của request hoặc chưa return trực tiếp `response` khi `status === 101`. Hãy chắc chắn bạn chép y hệt đoạn code mẫu ở dưới.

**Hỏi: Tôi bị giới hạn request Cloudflare miễn phí không?**
*Đáp:* Gói Free của Cloudflare Worker cho phép **100,000 requests/ngày**. Vì WebSocket chỉ đếm 1 request khi thiết lập kết nối (chứ không đếm từng tin nhắn gửi qua lại), nên cực kỳ thoải mái và khó hết.

---

## 📜 Full Code Mẫu (`worker.js`)
Bạn có thể copy đoạn code dưới đây dán thẳng vào Cloudflare Worker:

```javascript
const TARGET_HOST = 'api.locket-dio.com';
const SPOOF_ORIGIN = 'http://localhost:3000';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const clientOrigin = request.headers.get('Origin') || '*';

    // 1. Xử lý CORS Preflight (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': clientOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-locket-auth',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // 2. Chuẩn bị Headers giả mạo (Spoofing) để đánh lừa backend Locket
    const headers = new Headers(request.headers);
    headers.set('Host', TARGET_HOST);
    headers.set('Origin', SPOOF_ORIGIN);
    headers.set('Referer', `${SPOOF_ORIGIN}/`);
    
    // Xóa các headers mặc định của CF để backend không nhận ra là bị proxy
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ray');
    headers.delete('cf-visitor');
    headers.delete('cf-ipcountry');

    const targetUrl = `https://${TARGET_HOST}${url.pathname}${url.search}`;

    const fetchInit = {
      method: request.method,
      headers: headers,
      redirect: 'manual',
    };

    // Forward body cho POST requests (cực kỳ quan trọng cho Socket.IO polling)
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
      fetchInit.body = request.body;
      fetchInit.duplex = 'half'; // Bắt buộc khi truyền stream body trong CF Worker
    }

    try {
      // 3. Gửi request thật tới Locket API
      const response = await fetch(targetUrl, fetchInit);

      // 4a. Nếu là WebSocket (Status 101) -> Cloudflare tự động duy trì kết nối!
      if (response.status === 101) {
        return response; // Trả thẳng về, không cần relay tay
      }

      // 4b. Nếu là HTTP Polling -> Ghi đè lại CORS headers để trình duyệt không chặn
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', clientOrigin);
      newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return newResponse;
    } catch (err) {
      return new Response(err.stack || err.message, { status: 500 });
    }
  }
};
```
