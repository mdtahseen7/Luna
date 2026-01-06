"use server";
import { CombineEpisodeMeta } from "@/utils/EpisodeFunctions";
import { redis } from "@/lib/rediscache";
import { getMappings } from "./mappings";
import { logger } from "@/utils/logger";

export async function fetchHentaiTVEpisodes(searchQuery) {
  try {
    const API_URL = process.env.HENTAITV_API_URL;
    if (!API_URL || !searchQuery) {
      logger.log("[HentaiTV] API URL not configured or search query missing");
      return [];
    }

    logger.log(`[HentaiTV] Searching for: ${searchQuery}`);
    const response = await fetch(`${API_URL}/api/hen/hentaitv/search/${encodeURIComponent(searchQuery)}/1`);
    
    if (!response.ok) {
      logger.error(`[HentaiTV] Error searching: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const results = data?.data?.results || [];
    logger.log(`[HentaiTV] Found ${results.length} results`);
    
    // Transform HentaiTV search results to episode format
    return results.map((ep, index) => ({
      id: ep.id,                    // HentaiTV video ID
      number: index + 1,            // Sequential numbering
      title: ep.title,              // Episode title
      image: ep.image,              // Episode thumbnail
      episodeId: ep.id,             // Backup ID field
      views: ep.views,              // View count
    }));
  } catch (error) {
    logger.error("[HentaiTV] Error fetching episodes:", error.message);
    return [];
  }
}

export async function fetchAnimePaheEpisodes(session) {
  try {
    const API_URL = process.env.ANIMEPAHE_API_URL || "https://mdtahseen7-animepahe-api.hf.space";
    if (!API_URL || !session) {
      logger.log("[AnimePahe] API URL not configured or session missing");
      return [];
    }
    // Log which base URL is being used
    logger.log(`[AnimePahe] Using API base: ${API_URL}`);
    if (API_URL.includes("onrender.com")) {
      logger.log("[AnimePahe] WARNING: Render URL detected. Forcing HuggingFace fallback.");
    }
    logger.log(`[AnimePahe] Fetching episodes for session: ${session}`);
    const response = await fetch(`${API_URL}/episodes?session=${session}`);
    
    if (!response.ok) {
      logger.error(`[AnimePahe] Error fetching episodes: ${response.status} ${response.statusText}`);
      return [];
    }

    const episodes = await response.json();
    logger.log(`[AnimePahe] Successfully fetched ${episodes?.length || 0} episodes`);
    
    // Transform AnimePahe episode format to match the app's format
    // IMPORTANT: Store anime session in each episode for later source fetching
    return episodes.map(ep => ({
      id: ep.session,           // Episode session token used as ID
      number: ep.number,         // Episode number
      title: ep.title,          // Episode title
      image: ep.snapshot,       // Episode thumbnail/snapshot
      episodeId: ep.session,    // Backup ID field
      animeSession: session,    // Store anime session with each episode!
    }));
  } catch (error) {
    logger.error("[AnimePahe] Error fetching episodes:", error.message);
    return [];
  }
}

export async function fetchKaidoEpisodes(animeId) {
  try {
    const API_URL = process.env.KAIDO_API_URL;
    if (!API_URL || !animeId) {
      logger.log("[Kaido] API URL not configured or animeId missing");
      return [];
    }

    logger.log(`[Kaido] Fetching episodes for anime ID: ${animeId}`);
    const response = await fetch(`${API_URL}/api/kaido/anime/${animeId}/episodes`);
    
    if (!response.ok) {
      logger.error(`[Kaido] Error fetching episodes: ${response.status} ${response.statusText}`);
      return [];
    }

    const result = await response.json();
    const episodes = result.data || [];
    logger.log(`[Kaido] Successfully fetched ${episodes.length} episodes`);
    
    // Transform Kaido episode format to match the app's format
    return episodes.map(ep => ({
      id: ep.episodeId,         // Episode ID for source fetching
      number: ep.episodeNumber, // Episode number
      title: ep.title || ep.romaji || `Episode ${ep.episodeNumber}`, // Episode title
      episodeId: ep.episodeId,  // Backup ID field
      animeId: animeId,         // Store anime ID for later use
    }));
  } catch (error) {
    logger.error("[Kaido] Error fetching episodes:", error.message);
    return [];
  }
}

export async function fetchHiAnimeEpisodes(animeId) {
  try {
    const API_URL = process.env.KAIDO_API_URL; // Same base URL
    if (!API_URL || !animeId) {
      logger.log("[HiAnime] API URL not configured or animeId missing");
      return [];
    }

    logger.log(`[HiAnime] Fetching episodes for anime ID: ${animeId}`);
    const response = await fetch(`${API_URL}/api/hianime/anime/${animeId}/episodes`);
    
    if (!response.ok) {
      logger.error(`[HiAnime] Error fetching episodes: ${response.status} ${response.statusText}`);
      return [];
    }

    const result = await response.json();
    const episodes = result.data || [];
    logger.log(`[HiAnime] Successfully fetched ${episodes.length} episodes`);
    
    // Transform HiAnime episode format to match the app's format
    return episodes.map(ep => ({
      id: ep.episodeId,         // Episode ID for source fetching
      number: ep.episodeNumber, // Episode number
      title: ep.title || ep.romaji || `Episode ${ep.episodeNumber}`, // Episode title
      episodeId: ep.episodeId,  // Backup ID field
      animeId: animeId,         // Store anime ID for later use
    }));
  } catch (error) {
    logger.error("[HiAnime] Error fetching episodes:", error.message);
    return [];
  }
}

async function fetchEpisodeMeta(id, available = false) {
  try {
    if (available) {
      return null;
    }
    const res = await fetch(
      `https://api.ani.zip/mappings?anilist_id=${id}`
    );
    
    if (!res.ok) {
      logger.error(`[EpisodeMeta] API returned status: ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    
    if (!data?.episodes) {
      logger.log(`[EpisodeMeta] No episodes data found for ID: ${id}`);
      return [];
    }
    
    const episodesArray = Object.values(data.episodes);
    logger.log(`[EpisodeMeta] Fetched metadata for ${episodesArray.length} episodes for ID: ${id}`);

    if (!episodesArray || episodesArray.length === 0) {
      return [];
    }
    return episodesArray;
  } catch (error) {
    logger.error("Error fetching and processing meta:", error.message);
    return [];
  }
}

const fetchAndCacheData = async (id, meta, redis, cacheTime, refresh, genres = [], title = '', fast = false) => {
  const isHentai = genres?.includes('Hentai');
  logger.log(`\n========== [EPISODES] Fetching for AniList ID: ${id} (Fast: ${fast}) ==========`);
  logger.log(`[EPISODES] Title: ${title}`);
  logger.log(`[EPISODES] Genres:`, genres);
  logger.log(`[EPISODES] Is Hentai: ${isHentai}`);
  let mappings;
  let subEpisodes = [];
  let dubEpisodes = [];
  let allepisodes = [];

  // For hentai content, fetch from HentaiTV instead of regular providers
  if (isHentai) {
    logger.log(`[EPISODES] Detected hentai content, fetching from HentaiTV`);
    const hentaiEpisodes = await fetchHentaiTVEpisodes(title);
    
    if (hentaiEpisodes?.length > 0) {
      // Add two providers: MP4 (Server 1) and Iframe (Server 2)
      allepisodes.push(
        {
          episodes: hentaiEpisodes,
          providerId: "hentaitv-mp4",
          provider: "HentaiTV MP4"
        },
        {
          episodes: hentaiEpisodes,
          providerId: "hentaitv-iframe",
          provider: "HentaiTV Iframe"
        }
      );
      logger.log(`[EPISODES] Added HentaiTV providers with ${hentaiEpisodes.length} episodes`);
    }
    
    // Skip mappings and regular provider fetching for hentai
    logger.log(`[EPISODES] Total providers: ${allepisodes.length}`);
    logger.log(`[EPISODES] Provider IDs:`, allepisodes.map(p => p.providerId));
  } else {
    // Regular anime flow
    if (id) {
      // If fast mode, only check Kaido (fastest/most reliable). Otherwise check all.
      const providersToCheck = fast ? ['kaido'] : ['animepahe', 'kaido', 'hianime'];
      mappings = await getMappings(id, providersToCheck);
      logger.log(`[EPISODES] Mappings received:`, mappings);
    }

    if (mappings) {
      // Fetch episodes in parallel for better performance
      logger.log(`[EPISODES] Starting parallel fetch for providers: ${fast ? 'Fast Mode' : 'Full Mode'}`);
    
    const fetchPromises = [];
    
    // Prepare Kaido fetch (Server 1)
    if (mappings?.kaido?.id) {
      logger.log(`[EPISODES] Queuing Kaido episodes with ID: ${mappings.kaido.id}`);
      fetchPromises.push(
        fetchKaidoEpisodes(mappings.kaido.id)
          .then(episodes => ({
            type: 'kaido',
            episodes,
            id: mappings.kaido.id
          }))
          .catch(err => {
            logger.error(`[EPISODES] Kaido fetch failed:`, err);
            return { type: 'kaido', episodes: [], id: null };
          })
      );
    }
    
    // Prepare HiAnime fetch (Server 2)
    if (mappings?.hianime?.id) {
      logger.log(`[EPISODES] Queuing HiAnime episodes with ID: ${mappings.hianime.id}`);
      fetchPromises.push(
        fetchHiAnimeEpisodes(mappings.hianime.id)
          .then(episodes => ({
            type: 'hianime',
            episodes,
            id: mappings.hianime.id
          }))
          .catch(err => {
            logger.error(`[EPISODES] HiAnime fetch failed:`, err);
            return { type: 'hianime', episodes: [], id: null };
          })
      );
    }
    
    // Prepare AnimePahe fetch (Server 3)
    if (mappings?.animepahe?.session) {
      logger.log(`[EPISODES] Queuing AnimePahe episodes with session: ${mappings.animepahe.session}`);
      fetchPromises.push(
        fetchAnimePaheEpisodes(mappings.animepahe.session)
          .then(episodes => ({
            type: 'animepahe',
            episodes,
            session: mappings.animepahe.session
          }))
          .catch(err => {
            logger.error(`[EPISODES] AnimePahe fetch failed:`, err);
            return { type: 'animepahe', episodes: [], session: null };
          })
      );
    }
    
    // Execute all fetches in parallel
    logger.log(`[EPISODES] Executing ${fetchPromises.length} parallel fetches`);
    const results = await Promise.all(fetchPromises);
    logger.log(`[EPISODES] All fetches complete`);
    
    // Process results and add to allepisodes
    results.forEach(result => {
      if (result.episodes?.length > 0) {
        if (result.type === 'kaido') {
          allepisodes.push({
            episodes: result.episodes,
            providerId: "kaido",
            animeId: result.id,
          });
          logger.log(`[EPISODES] Added Kaido with ${result.episodes.length} episodes`);
        } else if (result.type === 'hianime') {
          allepisodes.push({
            episodes: result.episodes,
            providerId: "hianime",
            animeId: result.id,
          });
          logger.log(`[EPISODES] Added HiAnime with ${result.episodes.length} episodes`);
        } else if (result.type === 'animepahe') {
          allepisodes.push({
            episodes: result.episodes,
            providerId: "animepahe",
            animeSession: result.session,
          });
          logger.log(`[EPISODES] Added AnimePahe with ${result.episodes.length} episodes`);
        }
      }
    });
    
      logger.log(`[EPISODES] Total providers: ${allepisodes.length}`);
      logger.log(`[EPISODES] Provider IDs:`, allepisodes.map(p => p.providerId));
    }
  }
  
  const cover = await fetchEpisodeMeta(id, !refresh)

  // Check if redis is available
  if (redis) {
    // Only cache if not in fast mode
    if (allepisodes && !fast) {
      logger.log(`[EPISODES] Caching ${allepisodes.length} providers to Redis`);
      await redis.setex(
        `episode:${id}`,
        cacheTime,
        JSON.stringify(allepisodes)
      );
    } else if (fast) {
        logger.log(`[EPISODES] Fast mode enabled: Skipping Redis cache write`);
    }

    let data = allepisodes;
    if (refresh) {
      if (cover && cover?.length > 0) {
        try {
          if (!fast) { // Only cache meta if not fast
              await redis.setex(`meta:${id}`, cacheTime, JSON.stringify(cover));
          }
          data = await CombineEpisodeMeta(allepisodes, cover);
        } catch (error) {
          logger.error("Error serializing cover:", error.message);
        }
      } else if (meta) {
        data = await CombineEpisodeMeta(allepisodes, JSON.parse(meta));
      }
    } else if (meta) {
      data = await CombineEpisodeMeta(allepisodes, JSON.parse(meta));
    }

    logger.log(`[EPISODES] Returning ${data?.length || 0} providers`);
    logger.log(`========== [EPISODES] Complete ==========\n`);
    return data;
  } else {
    logger.error("Redis URL not provided. Caching not possible.");
    logger.log(`[EPISODES] Returning ${allepisodes?.length || 0} providers (no Redis)`);
    logger.log(`========== [EPISODES] Complete ==========\n`);
    return allepisodes;
  }
};

export const getEpisodes = async (id, status, refresh = false, genres = [], title = '', fast = false) => {
  const isHentai = genres?.includes('Hentai');
  logger.log(`\n========== [getEpisodes] Called for ID: ${id}, refresh: ${refresh}, genres: ${genres}, isHentai: ${isHentai}, fast: ${fast} ==========`);
  let cacheTime = null;
  if (status) {
    cacheTime = 60 * 60 * 3;
  } else {
    cacheTime = 60 * 60 * 24 * 45;
  }

  let meta = null;
  let cached;

  if (redis) {
    try {
      // // Find keys matching the pattern "meta:*"
      // const keys = await redis.keys("meta:*");

      // // Delete keys matching the pattern "meta:*"
      // if (keys.length > 0) {
      //   await redis.del(keys);
      //   logger.log(`Deleted ${keys.length} keys matching the pattern "meta:*"`);
      // }
      meta = await redis.get(`meta:${id}`);
      if (JSON.parse(meta)?.length === 0) {
        await redis.del(`meta:${id}`);
        logger.log("deleted meta cache");
        meta = null;
      }
      cached = await redis.get(`episode:${id}`);
      if (JSON.parse(cached)?.length === 0) {
        await redis.del(`episode:${id}`);
        cached = null;
      }
      let data;
      // If refresh is force, we bypass cache.
      if (refresh) {
        data = await fetchAndCacheData(id, meta, redis, cacheTime, refresh, genres, title, fast);
      }
      if (data?.length > 0) {
        logger.log("deleted cache");
        return data;
      }

      logger.log("using redis");
    } catch (error) {
      logger.error("Error checking Redis cache:", error.message);
    }
  }

  if (cached) {
    logger.log("[getEpisodes] Using CACHED data from Redis");
    try {
      let cachedData = JSON.parse(cached);
      logger.log(`[getEpisodes] Cached providers:`, cachedData?.map(p => p.providerId));
      if (meta) {
        cachedData = await CombineEpisodeMeta(cachedData, JSON.parse(meta));
      }
      logger.log(`========== [getEpisodes] Returning cached data ==========\n`);
      return cachedData;
    } catch (error) {
      logger.error("Error parsing cached data:", error.message);
    }
  } else {
    logger.log("[getEpisodes] No cache found, fetching fresh data");
    const fetchdata = await fetchAndCacheData(
      id,
      meta,
      redis,
      cacheTime,
      !refresh,
      genres,
      title,
      fast
    );
    return fetchdata;
  }
};


function transformEpisodeId(episodeId) {
  const regex = /^([^$]*)\$episode\$([^$]*)/;
  const match = episodeId.match(regex);

  if (match && match[1] && match[2]) {
    return `${match[1]}?ep=${match[2]}`; // Construct the desired output with the episode number
  }
  return episodeId; // Return original ID if no match is found
}
