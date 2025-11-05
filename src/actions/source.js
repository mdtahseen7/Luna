"use server"
import { ANIME } from "@consumet/extensions";

const gogo = new ANIME.Gogoanime();

export async function getGogoSources(id) {
    try {
        const data = await gogo.fetchEpisodeSources(id);

        if (!data) return null;

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getZoroSources(id, provider, episodeid, epnum, subtype) {
    try {
        let data;
        const API = process.env.ZORO_API;
        if (API) {
            const res = await fetch(`${API}/anime/episode-srcs?id=${episodeid}&server=vidstreaming&category=${subtype}`);
            data = await res.json();
        } else {
            console.log(episodeid)
            const resp = await fetch(`https://anify.eltik.cc/sources?providerId=${provider}&watchId=${encodeURIComponent(episodeid)}&episodeNumber=${epnum}&id=${id}&subType=${subtype}`);
            data = await resp.json();
        }
        if (!data) return null;

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export async function getAnimePaheSources(animeSession, episodeSession) {
    try {
        const API_URL = process.env.ANIMEPAHE_API_URL;
        if (!API_URL) {
            console.log("[AnimePahe] API URL not configured");
            return null;
        }

        console.log(`[AnimePahe] Fetching sources for anime_session: ${animeSession}, episode_session: ${episodeSession}`);
        
        const response = await fetch(`${API_URL}/sources?anime_session=${animeSession}&episode_session=${episodeSession}`);
        
        if (!response.ok) {
            console.error(`[AnimePahe] Error fetching sources: ${response.status} ${response.statusText}`);
            return null;
        }

        const sources = await response.json();
        console.log(`[AnimePahe] Found ${sources?.length || 0} sources`);
        console.log(`[AnimePahe] Raw sources from API:`, JSON.stringify(sources, null, 2));

        // Return sources in iframe-friendly format
        // Since resolver doesn't work, we'll use the Kwik URLs directly for iframe
        const formattedResponse = {
            sources: sources.map((source, index) => ({
                url: source.url,  // Kwik embed URL
                quality: source.quality || 'default',
                isM3U8: false,  // Not m3u8, it's iframe
                type: 'iframe',  // Mark as iframe source
            })),
            // Also keep raw sources for iframe fallback
            rawSources: sources,
        };
        
        console.log(`[AnimePahe] Formatted response:`, JSON.stringify(formattedResponse, null, 2));
        return formattedResponse;
    } catch (error) {
        console.error("[AnimePahe] Error fetching sources:", error.message);
        return null;
    }
}

export async function getAnimeSources(id, provider, epid, epnum, subtype, animeSession = null) {
    try {
        console.log(`[getAnimeSources] Called with provider: ${provider}, animeSession: ${animeSession}, epid: ${epid}`);
        
        // ============================================================
        // COMMENTED OUT: Old providers (Gogoanime & Zoro)
        // ============================================================
        /*
        if (provider === "gogoanime") {
            const data = await getGogoSources(epid);
            return data;
        }
        if (provider === "zoro") {
            const data = await getZoroSources(id, provider, epid, epnum, subtype)
            return data;
        }
        */

        // ============================================================
        // NEW: AnimePahe provider (ACTIVE)
        // ============================================================
        if (provider === "animepahe") {
            // epid is the episode session, we need the anime session too
            // The anime session should be passed from the episode data
            console.log(`[getAnimeSources] Calling getAnimePaheSources with animeSession: ${animeSession}, epid: ${epid}`);
            const data = await getAnimePaheSources(animeSession, epid);
            console.log(`[getAnimeSources] getAnimePaheSources returned:`, data);
            return data;
        }

        console.log(`[Sources] Unknown provider: ${provider}`);
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}
