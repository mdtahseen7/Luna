
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

// Helper to clean title (remove 'Season X', 'Part X', etc.)
function cleanTitle(title) {
  if (!title) return '';
  return title
    .replace(/season\s+\d+/gi, '') // Remove "Season 1", "Season 2"
    .replace(/part\s+\d+/gi, '')   // Remove "Part 1"
    .replace(/cour\s+\d+/gi, '')   // Remove "Cour 1"
    .replace(/[:\-]\s*$/g, '')     // Remove trailing colons/dashes
    .trim();
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
    const doSearch = async (q, y) => {
      const p = { query: q };
      if (y) p.first_air_date_year = y;
      return await fetchFromTmdb('/search/tv', p);
    };

    // Attempt 1: Exact title + Year
    let searchData = await doSearch(title, year);
    let show = searchData?.results?.[0];

    // Attempt 2: Cleaned title (remove Season X) + Year
    if (!show) {
      const cleaned = cleanTitle(title);
      if (cleaned !== title) {
        logger.log(`Fanart/TMDB: valid show not found for "${title}". Retrying with cleaned title: "${cleaned}"`);
        searchData = await doSearch(cleaned, year);
        show = searchData?.results?.[0];
      }
    }

    // Attempt 3: Cleaned title + NO year (sometimes year mismatches for specific seasons)
    if (!show) {
        const cleaned = cleanTitle(title);
        logger.log(`Fanart/TMDB: Retrying with cleaned title "${cleaned}" and NO year`);
        searchData = await doSearch(cleaned);
        show = searchData?.results?.[0];
    }

    // Attempt 4: Title before colon (e.g. "Jujutsu Kaisen: Culling Game" -> "Jujutsu Kaisen")
    if (!show && title.includes(':')) {
        const shortTitle = title.split(':')[0].trim();
        // Only if short title is different from what we already tried
        if (shortTitle && shortTitle !== title && shortTitle !== cleanTitle(title)) {
             logger.log(`Fanart/TMDB: Retrying with short title (before colon) "${shortTitle}"`);
             searchData = await doSearch(shortTitle);
             show = searchData?.results?.[0];
        }
    }

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
        if (typeA !== typeB) return typeB - typeA; // Descending: 1 (clearlogo) comes before 0 (hdtv)

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
