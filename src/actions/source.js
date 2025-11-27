    "use server"
import { logger } from "@/utils/logger";

export async function getHentaiTVSources(episodeId, format = 'mp4') {
    try {
        const API_URL = process.env.HENTAITV_API_URL;
        if (!API_URL || !episodeId) {
            logger.log("[HentaiTV] API URL not configured or episodeId missing");
            return null;
        }

        logger.log(`[HentaiTV] Fetching sources for episode: ${episodeId}, format: ${format}`);
        
        const response = await fetch(`${API_URL}/api/hen/hentaitv/watch/${episodeId}`);
        
        if (!response.ok) {
            logger.error(`[HentaiTV] Error fetching sources: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const sources = data?.data?.results?.sources || [];
        
        logger.log(`[HentaiTV] Found ${sources.length} sources`);
        
        // Find the requested format (mp4 or iframe)
        const source = sources.find(s => s.format === format);
        
        if (!source) {
            logger.error(`[HentaiTV] No ${format} source found`);
            return null;
        }

        logger.log(`[HentaiTV] Using ${format} source:`, source.src);

        if (format === 'mp4') {
            // Return MP4 as a regular video source for Vidstack
            return {
                sources: [{
                    url: source.src,
                    quality: 'default',
                    type: 'mp4'
                }],
                subtitles: [],
                tracks: []
            };
        } else {
            // Return iframe source
            return {
                sources: [{
                    url: source.src,
                    quality: 'default',
                    type: 'iframe'
                }],
                subtitles: [],
                tracks: []
            };
        }
    } catch (error) {
        logger.error("[HentaiTV] Error fetching sources:", error.message);
        return null;
    }
}

export async function getAnimePaheSources(animeSession, episodeSession) {
    try {
        const API_URL = process.env.ANIMEPAHE_API_URL;
        if (!API_URL) {
            logger.log("[AnimePahe] API URL not configured");
            return null;
        }

        logger.log(`[AnimePahe] Fetching sources for anime_session: ${animeSession}, episode_session: ${episodeSession}`);
        
        const response = await fetch(`${API_URL}/sources?anime_session=${animeSession}&episode_session=${episodeSession}`);
        
        if (!response.ok) {
            logger.error(`[AnimePahe] Error fetching sources: ${response.status} ${response.statusText}`);
            return null;
        }

        const sources = await response.json();
        logger.log(`[AnimePahe] Found ${sources?.length || 0} sources`);
        logger.log(`[AnimePahe] Raw sources from API:`, JSON.stringify(sources, null, 2));

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
        
        logger.log(`[AnimePahe] Formatted response:`, JSON.stringify(formattedResponse, null, 2));
        return formattedResponse;
    } catch (error) {
        logger.error("[AnimePahe] Error fetching sources:", error.message);
        return null;
    }
}

export async function getKaidoSources(episodeId, version = 'sub', server = 'vidcloud') {
    try {
        const API_URL = process.env.KAIDO_API_URL;
        if (!API_URL || !episodeId) {
            logger.log("[Kaido] API URL not configured or episodeId missing");
            return null;
        }

        logger.log(`[Kaido] Fetching sources for episode: ${episodeId}, version: ${version}, server: ${server}`);
        
        const response = await fetch(`${API_URL}/api/kaido/sources/${episodeId}?version=${version}&server=${server}`);
        
        if (!response.ok) {
            logger.error(`[Kaido] Error fetching sources: ${response.status} ${response.statusText}`);
            return null;
        }

        const result = await response.json();
        logger.log(`[Kaido] Raw response:`, result);
        logger.log(`[Kaido] Found ${result?.data?.sources?.length || 0} sources`);
        
        // Format sources for Vidstack player with proxy support
        const PROXY_URI = process.env.NEXT_PUBLIC_PROXY_URI;
        logger.log(`[Kaido] Proxy URI:`, PROXY_URI);
        
        const formattedSources = result.data?.sources?.map(source => {
            // Use proxy for m3u8 URLs to avoid CORS
            // PROXY_URI should already include the full path like: https://proxy.com/m3u8-proxy?url=
            const url = PROXY_URI 
                ? `${PROXY_URI}${encodeURIComponent(source.url)}`
                : source.url;
            logger.log(`[Kaido] Original:`, source.url);
            logger.log(`[Kaido] Proxied:`, url);
            return {
                url: url,
                quality: source.quality || 'auto',
                type: source.isM3u8 ? 'hls' : 'video'
            };
        }) || [];
        
        logger.log(`[Kaido] Formatted sources for Vidstack:`, formattedSources);
        
        // Format subtitles for Vidstack
        const formattedSubtitles = result.data?.subtitles?.map(sub => ({
            file: sub.file || sub.url,
            url: sub.file || sub.url,
            label: sub.label || sub.lang,
            lang: sub.label || sub.lang,
            kind: sub.kind || 'subtitles',
            default: sub.default || false
        })) || [];
        
        logger.log(`[Kaido] Formatted subtitles:`, formattedSubtitles);
        
        // Return in standard format for Vidstack player
        return {
            sources: formattedSources,
            subtitles: formattedSubtitles,
            tracks: formattedSubtitles,
            intro: result.data?.intro,
            outro: result.data?.outro,
            headers: result.headers,
        };
    } catch (error) {
        logger.error("[Kaido] Error fetching sources:", error.message);
        return null;
    }
}

export async function getHiAnimeSources(episodeId, version = 'sub', server = 'hd-2') {
    try {
        const API_URL = process.env.KAIDO_API_URL; // Same base URL
        if (!API_URL || !episodeId) {
            logger.log("[HiAnime] API URL not configured or episodeId missing");
            return null;
        }

        logger.log(`[HiAnime] Fetching sources for episode: ${episodeId}, version: ${version}, server: ${server}`);
        
        const response = await fetch(`${API_URL}/api/hianime/sources/${episodeId}?version=${version}&server=${server}`);
        
        if (!response.ok) {
            logger.error(`[HiAnime] Error fetching sources: ${response.status} ${response.statusText}`);
            return null;
        }

        const result = await response.json();
        logger.log(`[HiAnime] Raw response:`, result);
        logger.log(`[HiAnime] Found ${result?.data?.sources?.length || 0} sources`);
        
        // Format sources for Vidstack player with proxy support
        const PROXY_URI = process.env.NEXT_PUBLIC_PROXY_URI;
        logger.log(`[HiAnime] Proxy URI:`, PROXY_URI);
        
        const formattedSources = result.data?.sources?.map(source => {
            // Use proxy for m3u8 URLs to avoid CORS
            const url = PROXY_URI && source.isM3u8
                ? `${PROXY_URI}${encodeURIComponent(source.url)}`
                : source.url;
            logger.log(`[HiAnime] Original:`, source.url);
            logger.log(`[HiAnime] Proxied:`, url);
            return {
                url: url,
                quality: source.quality || 'auto',
                type: source.isM3u8 ? 'hls' : 'video'
            };
        }) || [];
        
        logger.log(`[HiAnime] Formatted sources for Vidstack:`, formattedSources);
        
        // Format subtitles for Vidstack
        const formattedSubtitles = result.data?.subtitles?.map(sub => ({
            file: sub.file || sub.url,
            url: sub.file || sub.url,
            label: sub.label || sub.lang,
            lang: sub.label || sub.lang,
            kind: sub.kind || 'subtitles',
            default: sub.default || false
        })) || [];
        
        logger.log(`[HiAnime] Formatted subtitles:`, formattedSubtitles);
        
        // Return in standard format for Vidstack player
        return {
            sources: formattedSources,
            subtitles: formattedSubtitles,
            tracks: formattedSubtitles,
            intro: result.data?.intro,
            outro: result.data?.outro,
            headers: result.headers,
        };
    } catch (error) {
        logger.error("[HiAnime] Error fetching sources:", error.message);
        return null;
    }
}

export async function getMegaPlaySources(episodeId) {
    try {
        if (!episodeId) {
            logger.log("[MegaPlay] episodeId missing");
            return null;
        }

        logger.log(`[MegaPlay] Processing HiAnime episodeId: ${episodeId}`);
        
        // Extract the number after "episode-" from HiAnime's episodeId
        // Example: "bleach-thousand-year-blood-war-the-conflict-19322-episode-128444" -> "128444"
        const episodeMatch = episodeId.match(/episode-(\d+)$/i);
        
        if (!episodeMatch || !episodeMatch[1]) {
            logger.error(`[MegaPlay] Could not extract episode number from: ${episodeId}`);
            return null;
        }
        
        const episodeNumber = episodeMatch[1];
        logger.log(`[MegaPlay] Extracted episode number: ${episodeNumber}`);
        
        // Construct MegaPlay iframe URL
        // Format: https://megaplay.buzz/stream/s-2/{episodeNumber}/sub
        const iframeUrl = `https://megaplay.buzz/stream/s-2/${episodeNumber}/sub`;
        logger.log(`[MegaPlay] Generated iframe URL: ${iframeUrl}`);
        
        // Return in iframe format (similar to AnimePahe)
        return {
            sources: [{
                url: iframeUrl,
                type: 'iframe'
            }],
            subtitles: [],
            tracks: []
        };
    } catch (error) {
        logger.error("[MegaPlay] Error generating sources:", error.message);
        return null;
    }
}


export async function getAnimeSources(id, provider, epid, epnum, subtype, animeSession = null) {
    try {
        logger.log(`[getAnimeSources] Called with provider: ${provider}, animeSession: ${animeSession}, epid: ${epid}`);
        
        // AnimePahe and Kaido providers
        if (provider === "animepahe") {
            // epid is the episode session, we need the anime session too
            // The anime session should be passed from the episode data
            logger.log(`[getAnimeSources] Calling getAnimePaheSources with animeSession: ${animeSession}, epid: ${epid}`);
            const data = await getAnimePaheSources(animeSession, epid);
            logger.log(`[getAnimeSources] getAnimePaheSources returned:`, data);
            return data;
        }
        
        if (provider === "kaido") {
            // epid is the episode ID, subtype is sub/dub
            logger.log(`[getAnimeSources] Calling getKaidoSources with epid: ${epid}, subtype: ${subtype}`);
            const data = await getKaidoSources(epid, subtype);
            logger.log(`[getAnimeSources] getKaidoSources returned:`, data);
            return data;
        }

        if (provider === "hianime") {
            // epid is the episode ID, subtype is sub/dub
            logger.log(`[getAnimeSources] Calling getHiAnimeSources with epid: ${epid}, subtype: ${subtype}`);
            const data = await getHiAnimeSources(epid, subtype);
            logger.log(`[getAnimeSources] getHiAnimeSources returned:`, data);
            return data;
        }

        if (provider === "megaplay") {
            // epid is the HiAnime episode ID (we extract the number from it)
            logger.log(`[getAnimeSources] Calling getMegaPlaySources with epid: ${epid}`);
            const data = await getMegaPlaySources(epid);
            logger.log(`[getAnimeSources] getMegaPlaySources returned:`, data);
            return data;
        }

        if (provider === "hentaitv-mp4") {
            // epid is the HentaiTV video ID, format is mp4
            logger.log(`[getAnimeSources] Calling getHentaiTVSources with epid: ${epid}, format: mp4`);
            const data = await getHentaiTVSources(epid, 'mp4');
            logger.log(`[getAnimeSources] getHentaiTVSources (MP4) returned:`, data);
            return data;
        }

        if (provider === "hentaitv-iframe") {
            // epid is the HentaiTV video ID, format is iframe
            logger.log(`[getAnimeSources] Calling getHentaiTVSources with epid: ${epid}, format: iframe`);
            const data = await getHentaiTVSources(epid, 'iframe');
            logger.log(`[getAnimeSources] getHentaiTVSources (Iframe) returned:`, data);
            return data;
        }

        logger.log(`[Sources] Unknown provider: ${provider}`);
        return null;
    } catch (error) {
        logger.log(error);
        return null;
    }
}

