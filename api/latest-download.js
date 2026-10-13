// Vercel serverless function: GET /api/latest-download
// Returns the approximate location of the most recent download, or null.

const { getLatest } = require('./_store');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10');
  try {
    const latest = await getLatest();
    return res.status(200).json(latest);
  } catch (err) {
    return res.status(200).json(null);
  }
};
