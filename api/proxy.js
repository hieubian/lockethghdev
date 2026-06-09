export default async function handler(req, res) {
  try {
    const targetPath = req.query.path;
    const targetHost = req.query.host;

    if (!targetPath || !targetHost) {
      return res.status(400).json({ error: 'Missing target path or host' });
    }

    const query = { ...req.query };
    delete query.host;
    delete query.path;
    const queryString = new URLSearchParams(query).toString();
    const url = `https://${targetHost}/${Array.isArray(targetPath) ? targetPath.join('/') : targetPath}${queryString ? '?' + queryString : ''}`;

    // Forward headers but spoof the Origin to bypass the backend's faulty CORS middleware
    const headers = { ...req.headers };
    delete headers.host;
    headers.origin = 'http://localhost:3000'; // Spoof origin

    const options = {
      method: req.method,
      headers: headers,
    };

    // Vercel parses JSON bodies automatically, so we need to stringify it back
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const response = await fetch(url, options);
    
    // Copy response headers but exclude encoding headers since fetch auto-decodes the response
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'content-length' && key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
