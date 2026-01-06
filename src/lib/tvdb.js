const TVDB_API_BASE = 'https://api4.thetvdb.com/v4';

let cachedToken = null;
let cachedTokenExpiry = 0; // epoch ms

async function getToken() {
  const apiKey = process.env.TVDB_API_KEY;
  if (!apiKey) {
    console.warn('TVDB_API_KEY is not set; TVDB logo lookup is disabled.');
    return null;
  }

  const now = Date.now();
  // Refresh token 5 minutes before expiry
  if (cachedToken && now < cachedTokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  console.log('TVDB: Requesting new token...');
  const res = await fetch(`${TVDB_API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: apiKey }),
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('TVDB login failed with status', res.status);
    const text = await res.text();
    console.error('TVDB login response:', text);
    return null;
  }

  const data = await res.json().catch(() => null);
  const token = data?.data?.token || data?.token;

  if (!token) {
    console.error('TVDB login response did not contain a token', data);
    return null;
  }

  console.log('TVDB: Token acquired successfully.');
  cachedToken = token;
  // Token is valid for about a month; use a conservative 27 days.
  cachedTokenExpiry = now + 27 * 24 * 60 * 60 * 1000;

  return token;
}

async function tvdbFetch(path, { query, signal } = {}) {
  const token = await getToken();
  if (!token) return null;

  const url = new URL(`${TVDB_API_BASE}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  // console.log(`TVDB: Fetching ${url.toString()}`);
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    signal,
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn('TVDB fetch failed', path, res.status);
    return null;
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Simple in-memory cache for logo URLs to avoid repeated API calls.
const logoCache = new Map(); // key: titleKey -> { url, cachedAt }

function makeTitleKey(title, year) {
  return `${title?.toLowerCase().trim() || ''}|${year || ''}`;
}

export async function fetchSeriesLogoUrl({ title, year }) {
  if (!title) return null;

  const key = makeTitleKey(title, year);
  const cached = logoCache.get(key);
  if (cached) {
    return cached.url;
  }

  console.log(`TVDB: Searching for "${title}" (${year || 'no year'})`);

  // Helper to run search
  const doSearch = async (q, y) => {
    // TVDB v4 uses 'query' parameter, not 'q'
    const params = { query: q, type: 'series' };
    if (y) params.year = y;
    return await tvdbFetch('/search', { query: params });
  };

  // 1) Attempt 1: Exact title + Year
  let searchData = await doSearch(title, year);
  let results = searchData?.data || [];

  // 2) Attempt 2: Exact title (no year) - if year was provided and failed
  if (results.length === 0 && year) {
    console.log(`TVDB: No results with year ${year}. Retrying without year...`);
    searchData = await doSearch(title);
    results = searchData?.data || [];
  }

  // 3) Attempt 3: Short title (before colon) - common for "Anime: Subtitle"
  if (results.length === 0 && title.includes(':')) {
    const shortTitle = title.split(':')[0].trim();
    if (shortTitle.length > 2) { // Avoid searching for too short strings
      console.log(`TVDB: No results for full title. Retrying with "${shortTitle}"...`);
      searchData = await doSearch(shortTitle);
      results = searchData?.data || [];
    }
  }

  if (!Array.isArray(results) || results.length === 0) {
    console.log(`TVDB: No search results for "${title}" after all attempts`);
    logoCache.set(key, { url: null, cachedAt: Date.now() });
    return null;
  }

  // Try to pick the best match: exact title match if possible, else first.
  const lowerTitle = title.toLowerCase();
  let series = results.find((r) => r.name?.toLowerCase() === lowerTitle) || results[0];

  const seriesId = series?.id;
  if (!seriesId) {
    console.log(`TVDB: No series ID found for "${title}"`);
    logoCache.set(key, { url: null, cachedAt: Date.now() });
    return null;
  }

  console.log(`TVDB: Found series ID ${seriesId} for "${title}". Fetching artworks...`);

  // 2) Fetch artworks for the chosen series
  const artworksData = await tvdbFetch(`/series/${seriesId}/artworks`);
  const artworks = artworksData?.data || [];

  if (!Array.isArray(artworks) || artworks.length === 0) {
    console.log(`TVDB: No artworks found for series ${seriesId}`);
    logoCache.set(key, { url: null, cachedAt: Date.now() });
    return null;
  }

  // Artwork type IDs/names vary; prefer types that look like logo/clearlogo.
  // TVDB often uses type 23 for clearlogo, or typeName 'clearlogo'
  const logoArtwork =
    artworks.find((a) =>
      a.type === 23 || // Common ID for clearlogo
      a.type?.toString?.().toLowerCase().includes('logo') ||
      a.typeName?.toLowerCase?.().includes('logo') ||
      a.typeName?.toLowerCase?.().includes('clearlogo')
    ) ||
    // Fallback to poster if absolutely necessary? No, user wants logo.
    // Maybe check for 'hd clearlogo' etc.
    null;

  if (!logoArtwork) {
     console.log(`TVDB: No logo artwork found for series ${seriesId} (checked ${artworks.length} artworks)`);
  }

  const image = logoArtwork?.image;
  let url = image ? image : null;

  // Ensure URL is absolute
  if (url && !url.startsWith('http')) {
    url = `https://artworks.thetvdb.com${url.startsWith('/') ? '' : '/'}${url}`;
  }

  if (url) console.log(`TVDB: Found logo URL: ${url}`);

  logoCache.set(key, { url, cachedAt: Date.now() });
  return url;
}
