// Relays a cedb.me user profile to the browser.
// cedb.me does not send CORS headers, so the page cannot call it directly.
// GET /api/user?id=<uuid>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || '').trim();
  if (!UUID.test(id)) {
    res.status(400).json({ error: 'Invalid cedb user ID.' });
    return;
  }

  let upstream;
  try {
    upstream = await fetch(`https://cedb.me/api/user/${id}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'cedb-user-objective-images (+https://github.com)',
      },
    });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach cedb.me.' });
    return;
  }

  if (upstream.status === 404) {
    res.status(404).json({ error: 'No cedb user found with that ID.' });
    return;
  }
  if (!upstream.ok) {
    res.status(502).json({ error: `cedb.me responded with HTTP ${upstream.status}.` });
    return;
  }

  const body = await upstream.text();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Short CDN cache so repeat lookups are fast but stay current.
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  res.status(200).send(body);
};
