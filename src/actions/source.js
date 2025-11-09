"use server"

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

export async function getKaidoSources(episodeId, version = 'sub', server = 'vidcloud') {
    try {
        const API_URL = process.env.KAIDO_API_URL;
        if (!API_URL || !episodeId) {
            console.log("[Kaido] API URL not configured or episodeId missing");
            return null;
        }

        console.log(`[Kaido] Fetching sources for episode: ${episodeId}, version: ${version}, server: ${server}`);
        
        const response = await fetch(`${API_URL}/api/kaido/sources/${episodeId}?version=${version}&server=${server}`);
        
        if (!response.ok) {
            console.error(`[Kaido] Error fetching sources: ${response.status} ${response.statusText}`);
            return null;
        }

        const result = await response.json();
        console.log(`[Kaido] Raw response:`, result);
        console.log(`[Kaido] Found ${result?.data?.sources?.length || 0} sources`);
        
        // Format sources for Vidstack player with proxy support
        const PROXY_URI = process.env.NEXT_PUBLIC_PROXY_URI;
        console.log(`[Kaido] Proxy URI:`, PROXY_URI);
        
        const formattedSources = result.data?.sources?.map(source => {
            // Use proxy for m3u8 URLs to avoid CORS
            // PROXY_URI should already include the full path like: https://proxy.com/m3u8-proxy?url=
            const url = PROXY_URI 
                ? `${PROXY_URI}${encodeURIComponent(source.url)}`
                : source.url;
            console.log(`[Kaido] Original:`, source.url);
            console.log(`[Kaido] Proxied:`, url);
            return {
                url: url,
                quality: source.quality || 'auto',
                type: source.isM3u8 ? 'hls' : 'video'
            };
        }) || [];
        
        console.log(`[Kaido] Formatted sources for Vidstack:`, formattedSources);
        
        // Format subtitles for Vidstack
        const formattedSubtitles = result.data?.subtitles?.map(sub => ({
            file: sub.file || sub.url,
            url: sub.file || sub.url,
            label: sub.label || sub.lang,
            lang: sub.label || sub.lang,
            kind: sub.kind || 'subtitles',
            default: sub.default || false
        })) || [];
        
        console.log(`[Kaido] Formatted subtitles:`, formattedSubtitles);
        
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
        console.error("[Kaido] Error fetching sources:", error.message);
        return null;
    }
}

export async function getAnimeSources(id, provider, epid, epnum, subtype, animeSession = null) {
    try {
        console.log(`[getAnimeSources] Called with provider: ${provider}, animeSession: ${animeSession}, epid: ${epid}`);
        
        // AnimePahe and Kaido providers
        if (provider === "animepahe") {
            // epid is the episode session, we need the anime session too
            // The anime session should be passed from the episode data
            console.log(`[getAnimeSources] Calling getAnimePaheSources with animeSession: ${animeSession}, epid: ${epid}`);
            const data = await getAnimePaheSources(animeSession, epid);
            console.log(`[getAnimeSources] getAnimePaheSources returned:`, data);
            return data;
        }
        
        if (provider === "kaido") {
            // epid is the episode ID, subtype is sub/dub
            console.log(`[getAnimeSources] Calling getKaidoSources with epid: ${epid}, subtype: ${subtype}`);
            const data = await getKaidoSources(epid, subtype);
            console.log(`[getAnimeSources] getKaidoSources returned:`, data);
            return data;
        }

        console.log(`[Sources] Unknown provider: ${provider}`);
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}
