export default async function handler(req, res) {
  const { handle } = req.query;

  if (!handle) {
    return res.status(400).json({ error: 'Missing handle' });
  }

  try {
    const url = `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${handle}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data = await response.json();
    const followers = data.followersCount ?? 0;

    res.setHeader('Cache-Control', 's-maxage=600'); // CDN 缓存 10 分钟
    return res.status(200).json({ followers });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch from Bluesky' });
  }
}
