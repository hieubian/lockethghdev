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
        return response; // Trả thẳng về, không cần relay tay (cách chuẩn nhất của Cloudflare)
      }

      // 4b. Nếu là HTTP Polling -> Ghi đè lại CORS headers để trình duyệt của bạn không chặn
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', clientOrigin);
      newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return newResponse;
    } catch (err) {
      return new Response(err.stack || err.message, { status: 500 });
    }
  }
};
