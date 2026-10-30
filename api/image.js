// Relays one objective image so the browser can put it in a zip.
// Image hosts (Steam CDN, upload.cedb.me, etc.) do not reliably send CORS headers.
// GET /api/image?url=<https image url>
//
// Safeguards so this is not a general-purpose open proxy:
//  - https only, hostnames only (no raw IP addresses), standard port
//  - response must be an image, max 10 MB

const MAX_BYTES = 10 * 1024 * 1024;

module.exports = async (req, res) => {
  let target;
  try {
    target = new URL(String((req.query && req.query.url) || ''));
  } catch {
    res.status(400).json({ error: 'Invalid image URL.' });
    return;
  }

  const host = target.hostname;
  const isIp = /^[\d.]+$/.test(host) || host.includes(':') || host.startsWith('[');
  if (target.protocol !== 'https:' || isIp || target.port || host === 'localhost') {
    res.status(400).json({ error: 'Image URL not allowed.' });
    return;
  }

  let upstream;
  try {
    upstream = await fetch(target.href, {
      headers: { 'User-Agent': 'cedb-user-objective-images' },
      redirect: 'follow',
    });
  } catch {
    res.status(502).json({ error: 'Could not reach image host.' });
    return;
  }

  if (!upstream.ok) {
    res.status(502).json({ error: `Image host responded with HTTP ${upstream.status}.` });
    return;
  }

  const type = (upstream.headers.get('content-type') || '').toLowerCase();
  if (!type.startsWith('image/')) {
    res.status(415).json({ error: 'URL did not return an image.' });
    return;
  }

  const declared = Number(upstream.headers.get('content-length') || 0);
  if (declared > MAX_BYTES) {
    res.status(413).json({ error: 'Image too large.' });
    return;
  }

  const buf = Buffer.from(await upstream.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    res.status(413).json({ error: 'Image too large.' });
    return;
  }

  res.setHeader('Content-Type', type);
  // Objective icons rarely change; cache at Vercel's edge for a day.
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(buf);
};
