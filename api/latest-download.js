// Vercel serverless function: GET /api/latest-download
// Returns the approximate location of the most recent download from anyone,
// or null if nothing has been downloaded yet.
//
// Troubleshooting: open /api/latest-download?debug=1 in your browser to see
// whether the database is connected.

const { getLatest, isConfigured } = require('./_store');

module.exports = async (req, res) => {
  const debug = req.query && req.query.debug;

  try {
    const latest = await getLatest();
    if (debug) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ configured: true, working: true, latest });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=20');
    return res.status(200).json(latest);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    if (debug) {
      return res.status(200).json({ configured: isConfigured(), working: false, error: String(err.message) });
    }
    return res.status(503).json(null);
  }
};
