
import { logger } from '@/utils/logger';

// Base URLs
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const FANART_BASE_URL = 'http://webservice.fanart.tv/v3';

// In-memory cache to prevent hitting limits
const logoCache = new Map(); // key: "title|year" -> { url, cachedAt }
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Helper to make cache key
function makeKey(title, year) {
  return `${title?.toLowerCase().trim() || ''}|${year || ''}`;
}

async function fetchFromTmdb(endpoint, params = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDB_API_KEY is not set');

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return await res.json();
}

async function fetchFromFanart(tvdbId) {
  const apiKey = process.env.FANART_API_KEY;
  if (!apiKey) throw new Error('FANART_API_KEY is not set');

  // Fanart.tv structure: /v3/tv/{id}?api_key={key}
  const url = `${FANART_BASE_URL}/tv/${tvdbId}?api_key=${apiKey}`;
  
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchSeriesLogoUrl({ title, year }) {
  if (!title) return null;

  // 1. Check Cache
  const key = makeKey(title, year);
  const cached = logoCache.get(key);
  if (cached && (Date.now() - cached.cachedAt < CACHE_DURATION)) {
    return cached.url;
  }

  try {
    // 2. Search TMDB for the TV Show ID
    const searchParams = { query: title };
    if (year) searchParams.first_air_date_year = year;

    const searchData = await fetchFromTmdb('/search/tv', searchParams);
    const show = searchData?.results?.[0];

    if (!show) {
      logger.log(`Fanart/TMDB: No show found for "${title}"`);
      logoCache.set(key, { url: null, cachedAt: Date.now() });
      return null;
    }

    // 3. Get External IDs (TVDB ID) from TMDB
    const idsData = await fetchFromTmdb(`/tv/${show.id}/external_ids`);
    const tvdbId = idsData?.tvdb_id;

    if (!tvdbId) {
      logger.log(`Fanart/TMDB: No TVDB ID found for TMDB show ${show.id} ("${title}")`);
      logoCache.set(key, { url: null, cachedAt: Date.now() });
      return null;
    }

    // 4. Fetch Images from Fanart.tv
    const fanartData = await fetchFromFanart(tvdbId);
    if (!fanartData) {
      logger.log(`Fanart: No data for TVDB ID ${tvdbId}`);
      logoCache.set(key, { url: null, cachedAt: Date.now() });
      return null;
    }

    // 5. Select Best Logo
    // Priority: clearlogo (smaller, ~400x155) -> hdtvlogo (larger, ~800x310)
    // We prefer clearlogo for better performance/loading times
    const clearLogos = (fanartData.clearlogo || []).map(l => ({ ...l, type: 'clearlogo' }));
    const hdtvLogos = (fanartData.hdtvlogo || []).map(l => ({ ...l, type: 'hdtvlogo' }));

    const logos = [...clearLogos, ...hdtvLogos];

    if (logos.length === 0) {
      logger.log(`Fanart: No logos found for TVDB ID ${tvdbId}`);
      logoCache.set(key, { url: null, cachedAt: Date.now() });
      return null;
    }

    // Sort by: Language (en) -> Type (clearlogo) -> Likes
    logos.sort((a, b) => {
        // 1. Language: English first
        const langA = a.lang === 'en' ? 1 : 0;
        const langB = b.lang === 'en' ? 1 : 0;
        if (langA !== langB) return langB - langA;

        // 2. Type: clearlogo preferred over hdtvlogo (for smaller size)
        const typeA = a.type === 'clearlogo' ? 1 : 0;
        const typeB = b.type === 'clearlogo' ? 1 : 0;
        if (typeA !== typeB) return typeA - typeB; // clearlogo (1) comes before hdtvlogo (0)

        // 3. Likes: Higher likes first
        return (parseInt(b.likes) || 0) - (parseInt(a.likes) || 0);
    });

    const bestLogo = logos[0].url;
    logger.log(`Fanart: Found logo for "${title}": ${bestLogo}`);
    
    logoCache.set(key, { url: bestLogo, cachedAt: Date.now() });
    return bestLogo;

  } catch (error) {
    logger.error('Error fetching logo from Fanart/TMDB:', error);
    return null;
  }
}
