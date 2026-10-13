// Vercel serverless function: POST /api/log-download
// 1) Sends a "New Download" message to your Discord webhook.
// 2) Saves the approximate location so the globe on the site can show it.
// The webhook URL is read from the DISCORD_WEBHOOK_URL environment variable,
// so it never appears in your public website code.

const { setLatest } = require('./_store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return res.status(500).json({ ok: false, error: 'Webhook not configured' });
  }

  const country = req.headers['x-vercel-ip-country'] || 'Unknown';

  // Location is rounded to whole degrees (roughly 100 km) so the globe only
  // shows an approximate area, never an exact spot.
  const lat = parseFloat(req.headers['x-vercel-ip-latitude']);
  const lon = parseFloat(req.headers['x-vercel-ip-longitude']);
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lon);
  const location = hasLocation
    ? { lat: Math.round(lat), lon: Math.round(lon), country, t: Date.now() }
    : null;

  const sendDiscord = fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'KongerHub Downloads',
      embeds: [
        {
          title: 'New Download',
          color: 0xf8f8f8,
          fields: [{ name: 'Country', value: country, inline: true }],
          timestamp: new Date().toISOString()
        }
      ]
    })
  });

  const saveLocation = location ? setLatest(location) : Promise.resolve();

  const results = await Promise.allSettled([sendDiscord, saveLocation]);
  const save = results[1];
  const stored = Boolean(location) && save.status === 'fulfilled';

  const body = { ok: true, stored, geo: hasLocation };
  if (location) Object.assign(body, location);
  if (location && !stored) {
    body.storeError = String((save.reason && save.reason.message) || 'unknown error');
  }
  return res.status(200).json(body);
};
