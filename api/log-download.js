// Vercel serverless function: POST /api/log-download
// Sends a "download clicked" message to your Discord webhook.
// The webhook URL is read from the DISCORD_WEBHOOK_URL environment variable,
// so it never appears in your public website code.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return res.status(500).json({ ok: false, error: 'Webhook not configured' });
  }

  const country = req.headers['x-vercel-ip-country'] || 'Unknown';
  const userAgent = String(req.headers['user-agent'] || 'Unknown').slice(0, 200);

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'KongerHub Downloads',
        embeds: [
          {
            title: 'New download',
            color: 0xf8f8f8,
            fields: [
              { name: 'Country', value: country, inline: true },
              { name: 'Browser', value: userAgent }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      })
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false });
  }
};
