// Tiny helper for storing the most recent download location in Upstash Redis
// (added to your Vercel project from Storage / Marketplace).
// Files starting with "_" are not exposed as API routes by Vercel.

function findEnv(suffixes) {
  for (const key of Object.keys(process.env)) {
    if (suffixes.some((s) => key.endsWith(s))) return process.env[key];
  }
  return undefined;
}

function credentials() {
  return {
    url: findEnv(['REST_API_URL', 'REST_URL']),
    token: findEnv(['REST_API_TOKEN', 'REST_TOKEN'])
  };
}

async function command(args) {
  const { url, token } = credentials();
  if (!url || !token) throw new Error('Redis is not configured (no REST url/token variables found)');

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

const KEY = 'kongerhub:latest_download';

exports.isConfigured = () => {
  const { url, token } = credentials();
  return Boolean(url && token);
};

exports.setLatest = (value) => command(['SET', KEY, JSON.stringify(value)]);

exports.getLatest = async () => {
  const raw = await command(['GET', KEY]);
  return raw ? JSON.parse(raw) : null;
};
