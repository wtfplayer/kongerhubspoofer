// Vercel serverless function: GET /api/latest-download
// Returns the approximate location of the most recent download from anyone,
// or null if nothing has been downloaded yet.

const { getLatest } = require('./_store');

module.exports = async (req, res) => {
  try {
    const latest = await getLatest();
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=20');
    return res.status(200).json(latest);
  } catch (err) {
    // Database problem: tell the page so it keeps whatever it already shows.
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json(null);
  }
};
