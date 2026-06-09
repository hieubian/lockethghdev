export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  // Tokens configured via env vars
  const fetchToken = process.env.REVENUECAT_FETCH_TOKEN;
  const appTransaction = process.env.REVENUECAT_APP_TRANSACTION;

  if (!fetchToken || !appTransaction) {
    return res.status(500).json({ error: "Server is missing RevenueCat tokens" });
  }

  const payload = {
    product_id: "locket_199_1m",
    fetch_token: fetchToken,
    app_transaction: appTransaction,
    app_user_id: uid,
    is_restore: true,
    store_country: "VNM",
    currency: "USD",
    price: "1.99",
    normal_duration: "P1M",
    subscription_group_id: "21419447",
    observer_mode: false,
    initiation_source: "restore",
    offers: [],
    attributes: {
      $attConsentStatus: { updated_at_ms: Date.now(), value: "notDetermined" },
    },
  };

  const headers = {
    Host: "api.revenuecat.com",
    Authorization: "Bearer appl_JngFETzdodyLmCREOlwTUtXdQik",
    "Content-Type": "application/json",
    Accept: "*/*",
    "X-Platform": "iOS",
    "X-Platform-Version": "Version 26.2 (Build 23C55)",
    "X-Platform-Device": "iPhone15,3",
    "X-Platform-Flavor": "native",
    "X-Version": "5.41.0",
    "X-Client-Version": "2.32.2",
    "X-Client-Bundle-ID": "com.locket.Locket",
    "X-Client-Build-Version": "3",
    "X-StoreKit2-Enabled": "true",
    "X-StoreKit-Version": "2",
    "X-Observer-Mode-Enabled": "false",
    "X-Is-Sandbox": "false", // Must match the token
    "X-Storefront": "VNM",
    "X-Apple-Device-Identifier": "39A73C25-1E05-4350-ADA7-5CD3FE1079E8",
    "X-Preferred-Locales": "vi_KR,ko_KR,en_KR",
    "X-Nonce": "w0Mlb6+AmV4WYuVv",
    "X-Is-Backgrounded": "false",
    "X-Retry-Count": "0",
    "X-Is-Debug-Build": "false",
    "User-Agent": "Locket/3 CFNetwork/3860.300.31 Darwin/25.2.0",
    "Accept-Language": "vi-VN,vi;q=0.9",
  };

  try {
    const response = await fetch("https://api.revenuecat.com/v1/receipts", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 200) {
      // Verify via subscribers
      const statusRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${uid}`, {
        headers,
      });
      if (statusRes.ok) {
        const data = await statusRes.json();
        const gold = data?.subscriber?.entitlements?.Gold;
        if (gold) {
          return res.status(200).json({ success: true, expires_date: gold.expires_date });
        }
      }
      return res.status(200).json({ success: true, warning: "Receipt accepted but entitlement verification failed or delayed." });
    } else {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errData.message || "Request Rejected" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
