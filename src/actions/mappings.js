"use server"
import { redis } from '@/lib/rediscache';
import { AnimeInfoAnilist } from '@/lib/Anilistfunctions'
import { findSimilarTitles } from '@/lib/stringSimilarity';

export async function getMappings(anilistId, providers = ['animepahe', 'kaido', 'hianime']) {
    console.log(`\n========== [MAPPINGS] Starting for AniList ID: ${anilistId} ==========`);
    // Always print the AnimePahe base URL to verify env resolution
    try {
        const apBase = process.env.ANIMEPAHE_API_URL;
        console.log(`[MAPPINGS] AnimePahe API base: ${apBase || 'undefined'}`);
    } catch (e) {
        console.log(`[MAPPINGS] AnimePahe API base: ERROR reading env`, e?.message);
    }
    const data = await getInfo(anilistId);
    
    if (!data) {
        console.log("[MAPPINGS] No anime info found");
        return null;
    }
    console.log(`[MAPPINGS] Anime Title: ${data?.title?.romaji || data?.title?.english}`);

    const mappingPromises = [];
    
    if (providers.includes('animepahe')) {
        mappingPromises.push(mapAnimePahe(data?.title).then(res => ({ provider: 'animepahe', data: res })));
    }
    if (providers.includes('kaido')) {
        mappingPromises.push(mapKaido(data?.title).then(res => ({ provider: 'kaido', data: res })));
    }
    if (providers.includes('hianime')) {
        mappingPromises.push(mapHiAnime(data?.title).then(res => ({ provider: 'hianime', data: res })));
    }
    
    const results = await Promise.all(mappingPromises);
    
    const resultMap = { animepahe: null, kaido: null, hianime: null };
    results.forEach(result => {
        resultMap[result.provider] = result.data;
        console.log(`[MAPPINGS] ${result.provider} result:`, result.data);
    });
    
    const result = { 
        animepahe: resultMap.animepahe, 
        kaido: resultMap.kaido, 
        hianime: resultMap.hianime,
        id: data?.id, 
        malId: data?.idMal, 
        title: data?.title.romaji 
    };
    console.log(`[MAPPINGS] Final mappings:`, JSON.stringify(result, null, 2));
    console.log(`========== [MAPPINGS] Complete ==========\n`);
    return result;
}

async function getInfo(id) {
    try {
        let cachedData;
        if (redis) {
            cachedData = await redis.get(`info:${id}`);
            if (!JSON.parse(cachedData) || JSON.parse(cachedData)?.length === 0) {
                await redis.del(`info:${id}`);
                cachedData = null;
            }
        }
        if (cachedData) {
            // console.log("using cached info")
            return JSON.parse(cachedData);
        } else {
            const data = await AnimeInfoAnilist(id);
            const cacheTime = data?.status === 'FINISHED' ? 60 * 60 * 24 * 45 : 60 * 60 * 3;
            if (redis && data !== null && data) {
                await redis.set(`info:${id}`, JSON.stringify(data), "EX", cacheTime);
            }
            return data;
        }
    } catch (error) {
        console.error("Error fetching info: ", error);
    }
}

async function mapAnimePahe(title) {
    try {
        const API_URL = process.env.ANIMEPAHE_API_URL || "https://mdtahseen7-animepahe-api.hf.space";
        if (!API_URL) {
            console.log("AnimePahe API URL not configured");
            return null;
        }
        // Log which base URL is being used for AnimePahe
        console.log(`[AnimePahe] Using API base: ${API_URL}`);
        if (API_URL.includes("onrender.com")) {
            console.log("[AnimePahe] WARNING: Render URL detected. Forcing HuggingFace fallback.");
        }

        console.log(`[AnimePahe] Attempting to map anime: ${title?.romaji || title?.english}`);

        // Search using multiple title variants for better matching
        const searchQueries = [
            title?.english,
            title?.romaji,
            title?.userPreferred
        ].filter(Boolean);

        let bestMatch = null;
        let highestSimilarity = 0;

        for (const query of searchQueries) {
            try {
                console.log(`[AnimePahe] Searching with query: ${query}`);
                const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    console.log(`[AnimePahe] Search failed with status: ${response.status}`);
                    continue;
                }
                
                const raw = await response.json();
                // Support multiple response shapes: array, {results: []}, {data: {results: []}}
                const results = Array.isArray(raw)
                  ? raw
                  : Array.isArray(raw?.results)
                    ? raw.results
                    : Array.isArray(raw?.data?.results)
                      ? raw.data.results
                      : [];
                console.log(`[AnimePahe] Search response shape:`, Object.keys(raw || {}).join(','));
                console.log(`[AnimePahe] Found ${results?.length || 0} results`);
                
                if (results && results.length > 0) {
                    // Use string similarity to find the best match
                    const matches = findSimilarTitles(query, results);
                    if (matches && matches.length > 0) {
                        const topMatch = matches[0];
                        console.log(`[AnimePahe] Top match: ${topMatch?.title || topMatch?.name} (similarity: ${topMatch.similarity})`);
                        if (topMatch.similarity > highestSimilarity) {
                            highestSimilarity = topMatch.similarity;
                            bestMatch = topMatch;
                        }
                    }
                }
            } catch (fetchError) {
                console.error(`[AnimePahe] Error searching with query "${query}":`, fetchError.message);
                continue;
            }
        }

        // Return session token if we found a good match
        if (bestMatch && (bestMatch.session || bestMatch.anime_session)) {
            console.log(`[AnimePahe] Successfully mapped to session: ${bestMatch.session}`);
            return {
                session: bestMatch.session || bestMatch.anime_session,
                title: bestMatch.title || bestMatch.name,
                id: bestMatch.id || bestMatch.slug || null
            };
        }

        console.log("[AnimePahe] No suitable match found");
        return null;
    } catch (error) {
        console.error("[AnimePahe] Error mapping AnimePahe:", error);
        return null;
    }
}

async function mapKaido(title) {
    try {
        const API_URL = process.env.KAIDO_API_URL;
        if (!API_URL) {
            console.log("[Kaido] API URL not configured");
            return null;
        }

        console.log(`[Kaido] Attempting to map anime: ${title?.romaji || title?.english}`);

        // Search using multiple title variants
        const searchQueries = [
            title?.english,
            title?.romaji,
            title?.userPreferred
        ].filter(Boolean);

        let bestMatch = null;
        let highestSimilarity = 0;

        for (const query of searchQueries) {
            try {
                console.log(`[Kaido] Searching with query: ${query}`);
                const response = await fetch(`${API_URL}/api/kaido/anime/search?q=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    console.log(`[Kaido] Search failed with status: ${response.status}`);
                    continue;
                }
                
                const results = await response.json();
                console.log(`[Kaido] Found ${results?.data?.length || 0} results`);
                
                if (results?.data && results.data.length > 0) {
                    // Use string similarity to find the best match
                    const matches = findSimilarTitles(query, results.data);
                    if (matches && matches.length > 0) {
                        const topMatch = matches[0];
                        console.log(`[Kaido] Top match: ${topMatch.name} (similarity: ${topMatch.similarity})`);
                        if (topMatch.similarity > highestSimilarity) {
                            highestSimilarity = topMatch.similarity;
                            bestMatch = topMatch;
                        }
                    }
                }
            } catch (fetchError) {
                console.error(`[Kaido] Error searching with query "${query}":`, fetchError.message);
                continue;
            }
        }

        // Return anime ID if we found a good match
        if (bestMatch && bestMatch.id) {
            console.log(`[Kaido] Successfully mapped to ID: ${bestMatch.id}`);
            return {
                id: bestMatch.id,
                name: bestMatch.name || bestMatch.title,
            };
        }

        console.log("[Kaido] No suitable match found");
        return null;
    } catch (error) {
        console.error("[Kaido] Error mapping Kaido:", error);
        return null;
    }
}

async function mapHiAnime(title) {
    try {
        const API_URL = process.env.KAIDO_API_URL; // Same base URL
        if (!API_URL) {
            console.log("[HiAnime] API URL not configured");
            return null;
        }

        console.log(`[HiAnime] Attempting to map anime: ${title?.romaji || title?.english}`);

        // Search using multiple title variants
        const searchQueries = [
            title?.english,
            title?.romaji,
            title?.userPreferred
        ].filter(Boolean);

        let bestMatch = null;
        let highestSimilarity = 0;

        for (const query of searchQueries) {
            try {
                console.log(`[HiAnime] Searching with query: ${query}`);
                const response = await fetch(`${API_URL}/api/hianime/anime/search?q=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    console.log(`[HiAnime] Search failed with status: ${response.status}`);
                    continue;
                }
                
                const results = await response.json();
                console.log(`[HiAnime] Found ${results?.data?.length || 0} results`);
                
                if (results?.data && results.data.length > 0) {
                    // Use string similarity to find the best match
                    const matches = findSimilarTitles(query, results.data);
                    if (matches && matches.length > 0) {
                        const topMatch = matches[0];
                        console.log(`[HiAnime] Top match: ${topMatch.name} (similarity: ${topMatch.similarity})`);
                        if (topMatch.similarity > highestSimilarity) {
                            highestSimilarity = topMatch.similarity;
                            bestMatch = topMatch;
                        }
                    }
                }
            } catch (fetchError) {
                console.error(`[HiAnime] Error searching with query "${query}":`, fetchError.message);
                continue;
            }
        }

        // Return anime ID if we found a good match
        if (bestMatch && bestMatch.id) {
            console.log(`[HiAnime] Successfully mapped to ID: ${bestMatch.id}`);
            return {
                id: bestMatch.id,
                name: bestMatch.name || bestMatch.title,
            };
        }

        console.log("[HiAnime] No suitable match found");
        return null;
    } catch (error) {
        console.error("[HiAnime] Error mapping HiAnime:", error);
        return null;
    }
}