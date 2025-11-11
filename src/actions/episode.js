"use server";
import { CombineEpisodeMeta } from "@/utils/EpisodeFunctions";
import { redis } from "@/lib/rediscache";
import { getMappings } from "./mappings";

export async function fetchAnimePaheEpisodes(session) {
  try {
    const API_URL = process.env.ANIMEPAHE_API_URL;
    if (!API_URL || !session) {
      console.log("[AnimePahe] API URL not configured or session missing");
      return [];
    }

    console.log(`[AnimePahe] Fetching episodes for session: ${session}`);
    const response = await fetch(`${API_URL}/episodes?session=${session}`);
    
    if (!response.ok) {
      console.error(`[AnimePahe] Error fetching episodes: ${response.status} ${response.statusText}`);
      return [];
    }

    const episodes = await response.json();
    console.log(`[AnimePahe] Successfully fetched ${episodes?.length || 0} episodes`);
    
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
    console.error("[AnimePahe] Error fetching episodes:", error.message);
    return [];
  }
}

export async function fetchKaidoEpisodes(animeId) {
  try {
    const API_URL = process.env.KAIDO_API_URL;
    if (!API_URL || !animeId) {
      console.log("[Kaido] API URL not configured or animeId missing");
      return [];
    }

    console.log(`[Kaido] Fetching episodes for anime ID: ${animeId}`);
    const response = await fetch(`${API_URL}/api/kaido/anime/${animeId}/episodes`);
    
    if (!response.ok) {
      console.error(`[Kaido] Error fetching episodes: ${response.status} ${response.statusText}`);
      return [];
    }

    const result = await response.json();
    const episodes = result.data || [];
    console.log(`[Kaido] Successfully fetched ${episodes.length} episodes`);
    
    // Transform Kaido episode format to match the app's format
    return episodes.map(ep => ({
      id: ep.episodeId,         // Episode ID for source fetching
      number: ep.episodeNumber, // Episode number
      title: ep.title || ep.romaji || `Episode ${ep.episodeNumber}`, // Episode title
      episodeId: ep.episodeId,  // Backup ID field
      animeId: animeId,         // Store anime ID for later use
    }));
  } catch (error) {
    console.error("[Kaido] Error fetching episodes:", error.message);
    return [];
  }
}

export async function fetchHiAnimeEpisodes(animeId) {
  try {
    const API_URL = process.env.KAIDO_API_URL; // Same base URL
    if (!API_URL || !animeId) {
      console.log("[HiAnime] API URL not configured or animeId missing");
      return [];
    }

    console.log(`[HiAnime] Fetching episodes for anime ID: ${animeId}`);
    const response = await fetch(`${API_URL}/api/hianime/anime/${animeId}/episodes`);
    
    if (!response.ok) {
      console.error(`[HiAnime] Error fetching episodes: ${response.status} ${response.statusText}`);
      return [];
    }

    const result = await response.json();
    const episodes = result.data || [];
    console.log(`[HiAnime] Successfully fetched ${episodes.length} episodes`);
    
    // Transform HiAnime episode format to match the app's format
    return episodes.map(ep => ({
      id: ep.episodeId,         // Episode ID for source fetching
      number: ep.episodeNumber, // Episode number
      title: ep.title || ep.romaji || `Episode ${ep.episodeNumber}`, // Episode title
      episodeId: ep.episodeId,  // Backup ID field
      animeId: animeId,         // Store anime ID for later use
    }));
  } catch (error) {
    console.error("[HiAnime] Error fetching episodes:", error.message);
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
const data = await res.json()
    const episodesArray = Object.values(data?.episodes);

    if (!episodesArray) {
      return [];
    }
    return episodesArray;
  } catch (error) {
    console.error("Error fetching and processing meta:", error.message);
    return [];
  }
}

const fetchAndCacheData = async (id, meta, redis, cacheTime, refresh) => {
  console.log(`\n========== [EPISODES] Fetching for AniList ID: ${id} ==========`);
  let mappings;
  let subEpisodes = [];
  let dubEpisodes = [];
  let allepisodes = [];

  if (id) {
    mappings = await getMappings(id);
    console.log(`[EPISODES] Mappings received:`, mappings);
  }

  if (mappings) {
    // Fetch episodes in order: Kaido (Server 1), HiAnime (Server 2), AnimePahe (Server 3)
    
    // Fetch Kaido episodes first (Server 1)
    if (mappings?.kaido?.id) {
      console.log(`[EPISODES] Fetching Kaido episodes with ID: ${mappings.kaido.id}`);
      const kaidoEpisodes = await fetchKaidoEpisodes(mappings.kaido.id);
      console.log(`[EPISODES] Kaido returned ${kaidoEpisodes?.length || 0} episodes`);
      
      if (kaidoEpisodes?.length > 0) {
        allepisodes.push({
          episodes: kaidoEpisodes,
          providerId: "kaido",
          animeId: mappings.kaido.id, // Store anime ID for later use
        });
        console.log(`[EPISODES] Added Kaido to providers`);
      }
    } else {
      console.log(`[EPISODES] No Kaido ID available`);
    }
    
    // Fetch HiAnime episodes second (Server 2)
    if (mappings?.hianime?.id) {
      console.log(`[EPISODES] Fetching HiAnime episodes with ID: ${mappings.hianime.id}`);
      const hiAnimeEpisodes = await fetchHiAnimeEpisodes(mappings.hianime.id);
      console.log(`[EPISODES] HiAnime returned ${hiAnimeEpisodes?.length || 0} episodes`);
      
      if (hiAnimeEpisodes?.length > 0) {
        allepisodes.push({
          episodes: hiAnimeEpisodes,
          providerId: "hianime",
          animeId: mappings.hianime.id, // Store anime ID for later use
        });
        console.log(`[EPISODES] Added HiAnime to providers`);
      }
    } else {
      console.log(`[EPISODES] No HiAnime ID available`);
    }
    
    // Fetch AnimePahe episodes third (Server 3)
    if (mappings?.animepahe?.session) {
      console.log(`[EPISODES] Fetching AnimePahe episodes with session: ${mappings.animepahe.session}`);
      const animePaheEpisodes = await fetchAnimePaheEpisodes(mappings.animepahe.session);
      console.log(`[EPISODES] AnimePahe returned ${animePaheEpisodes?.length || 0} episodes`);
      
      if (animePaheEpisodes?.length > 0) {
        allepisodes.push({
          episodes: animePaheEpisodes,
          providerId: "animepahe",
          animeSession: mappings.animepahe.session, // Store anime session for later use
        });
        console.log(`[EPISODES] Added AnimePahe to providers`);
      }
    } else {
      console.log(`[EPISODES] No AnimePahe session available`);
    }
    
    console.log(`[EPISODES] Total providers: ${allepisodes.length}`);
    console.log(`[EPISODES] Provider IDs:`, allepisodes.map(p => p.providerId));
  } 
  const cover = await fetchEpisodeMeta(id, !refresh)

  // Check if redis is available
  if (redis) {
    if (allepisodes) {
      console.log(`[EPISODES] Caching ${allepisodes.length} providers to Redis`);
      await redis.setex(
        `episode:${id}`,
        cacheTime,
        JSON.stringify(allepisodes)
      );
    }

    let data = allepisodes;
    if (refresh) {
      if (cover && cover?.length > 0) {
        try {
          await redis.setex(`meta:${id}`, cacheTime, JSON.stringify(cover));
          data = await CombineEpisodeMeta(allepisodes, cover);
        } catch (error) {
          console.error("Error serializing cover:", error.message);
        }
      } else if (meta) {
        data = await CombineEpisodeMeta(allepisodes, JSON.parse(meta));
      }
    } else if (meta) {
      data = await CombineEpisodeMeta(allepisodes, JSON.parse(meta));
    }

    console.log(`[EPISODES] Returning ${data?.length || 0} providers`);
    console.log(`========== [EPISODES] Complete ==========\n`);
    return data;
  } else {
    console.error("Redis URL not provided. Caching not possible.");
    console.log(`[EPISODES] Returning ${allepisodes?.length || 0} providers (no Redis)`);
    console.log(`========== [EPISODES] Complete ==========\n`);
    return allepisodes;
  }
};

export const getEpisodes = async (id, status, refresh = false) => {
  console.log(`\n========== [getEpisodes] Called for ID: ${id}, refresh: ${refresh} ==========`);
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
      //   console.log(`Deleted ${keys.length} keys matching the pattern "meta:*"`);
      // }
      meta = await redis.get(`meta:${id}`);
      if (JSON.parse(meta)?.length === 0) {
        await redis.del(`meta:${id}`);
        console.log("deleted meta cache");
        meta = null;
      }
      cached = await redis.get(`episode:${id}`);
      if (JSON.parse(cached)?.length === 0) {
        await redis.del(`episode:${id}`);
        cached = null;
      }
      let data;
      if (refresh) {
        data = await fetchAndCacheData(id, meta, redis, cacheTime, refresh);
      }
      if (data?.length > 0) {
        console.log("deleted cache");
        return data;
      }

      console.log("using redis");
    } catch (error) {
      console.error("Error checking Redis cache:", error.message);
    }
  }

  if (cached) {
    console.log("[getEpisodes] Using CACHED data from Redis");
    try {
      let cachedData = JSON.parse(cached);
      console.log(`[getEpisodes] Cached providers:`, cachedData?.map(p => p.providerId));
      if (meta) {
        cachedData = await CombineEpisodeMeta(cachedData, JSON.parse(meta));
      }
      console.log(`========== [getEpisodes] Returning cached data ==========\n`);
      return cachedData;
    } catch (error) {
      console.error("Error parsing cached data:", error.message);
    }
  } else {
    console.log("[getEpisodes] No cache found, fetching fresh data");
    const fetchdata = await fetchAndCacheData(
      id,
      meta,
      redis,
      cacheTime,
      !refresh
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