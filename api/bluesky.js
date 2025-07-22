// /api/bluesky-followers.js

export default async function handler(req, res) {
  // 1. 從請求的 query 中取得 handle
  const { handle } = req.query;

  // 2. 檢查 handle 是否存在
  if (!handle) {
    return res.status(400).json({ error: 'Missing handle' });
  }

  // --- 新增：輸入驗證 ---
  // 簡單的正規表示式，確保 handle 只包含有效的字元 (字母、數字、點、減號)
  // 這可以防止一些基本的惡意輸入
  const handleRegex = /^[a-zA-Z0-9.-]+$/;
  if (!handleRegex.test(handle)) {
    return res.status(400).json({ error: 'Invalid handle format' });
  }

  try {
    // 3. 建立請求 Bluesky API 的 URL
    const url = `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${handle}`;
    
    // 4. 發送請求
    const response = await fetch(url);

    // 5. 如果 API 回應不成功 (例如 404 Not Found)，返回錯誤
    if (!response.ok) {
      // 可以根據 response.status 做更細緻的判斷，但 404 通常就是找不到使用者
      return res.status(404).json({ error: 'User not found' });
    }

    // 6. 解析 API 回應的 JSON 資料
    const data = await response.json();
    
    // 7. 安全地取得追隨者數量，如果該欄位不存在則預設為 0
    const followers = data.followersCount ?? 0;

    // 8. 設定 CDN 快取，這裡設定 10 分鐘 (600 秒)
    // 這可以有效減少對 Bluesky API 的請求次數
    res.setHeader('Cache-Control', 'public, s-maxage=600'); 
    
    // 9. 回傳成功的結果
    return res.status(200).json({ followers });

  } catch (err) {
    // --- 新增：伺服器端錯誤日誌 ---
    // 在伺服器控制台印出詳細的錯誤訊息，方便開發者除錯
    // 這個詳細訊息不會顯示給前端使用者
    console.error('Failed to fetch from Bluesky API:', err);

    // 10. 如果 fetch 過程發生任何網路或其他錯誤，返回 500 伺服器錯誤
    return res.status(500).json({ error: 'Failed to fetch from Bluesky' });
  }
}
