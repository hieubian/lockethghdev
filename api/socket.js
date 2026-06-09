// api/socket.js — Vercel Edge Function: proxy socket.io polling với spoofed Origin
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': '*',
        'access-control-max-age': '86400',
      },
    });
  }

  // Lấy path gốc từ query param (truyền vào bởi vercel.json rewrite)
  // VD: socketPath = "" khi /socket.io/, hoặc "" khi là base path
  const socketPath = url.searchParams.get('socketPath') || '';

  // Build query string — bỏ socketPath, giữ lại EIO, transport, sid, t, ...
  const forwardParams = new URLSearchParams(url.search);
  forwardParams.delete('socketPath');
  const queryString = forwardParams.toString();

  // Target URL đúng dạng: https://api.locket-dio.com/socket.io/{path}?EIO=4&transport=polling&...
  const targetPath = socketPath ? `/socket.io/${socketPath}` : '/socket.io/';
  const targetUrl = `https://api.locket-dio.com${targetPath}${queryString ? '?' + queryString : ''}`;

  // Build headers — spoof origin về localhost:3000
  const forwardHeaders = new Headers();
  for (const [key, value] of req.headers.entries()) {
    const k = key.toLowerCase();
    if (['host', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto',
         'x-vercel-id', 'cf-connecting-ip', 'cf-ray'].includes(k)) continue;
    forwardHeaders.set(key, value);
  }
  forwardHeaders.set('origin', 'http://localhost:3000');
  forwardHeaders.set('referer', 'http://localhost:3000/');
  forwardHeaders.set('host', 'api.locket-dio.com');

  const fetchOptions = {
    method: req.method,
    headers: forwardHeaders,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = req.body;
    fetchOptions.duplex = 'half';
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);

    // Build response headers
    const resHeaders = new Headers();
    for (const [key, value] of response.headers.entries()) {
      const k = key.toLowerCase();
      if (['content-encoding', 'transfer-encoding', 'content-length'].includes(k)) continue;
      resHeaders.set(key, value);
    }
    resHeaders.set('access-control-allow-origin', '*');
    resHeaders.set('access-control-allow-methods', 'GET, POST, OPTIONS');

    // Stream response body trực tiếp (quan trọng cho long-polling)
    return new Response(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}

