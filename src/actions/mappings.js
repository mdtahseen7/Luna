"use server"
import { redis } from '@/lib/rediscache';
import { AnimeInfoAnilist } from '@/lib/Anilistfunctions'
import { findSimilarTitles } from '@/lib/stringSimilarity';

export async function getMappings(anilistId) {
    console.log(`\n========== [MAPPINGS] Starting for AniList ID: ${anilistId} ==========`);
    const data = await getInfo(anilistId);
    let animepaheres, kaidores;
    if (!data) {
        console.log("[MAPPINGS] No anime info found");
        return null;
    }
    console.log(`[MAPPINGS] Anime Title: ${data?.title?.romaji || data?.title?.english}`);
    
    // AnimePahe and Kaido mapping
    animepaheres = await mapAnimePahe(data?.title);
    console.log(`[MAPPINGS] AnimePahe result:`, animepaheres);
    
    kaidores = await mapKaido(data?.title);
    console.log(`[MAPPINGS] Kaido result:`, kaidores);
    
    const result = { animepahe: animepaheres, kaido: kaidores, id: data?.id, malId: data?.idMal, title: data?.title.romaji };
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
        const API_URL = process.env.ANIMEPAHE_API_URL;
        if (!API_URL) {
            console.log("AnimePahe API URL not configured");
            return null;
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
                
                const results = await response.json();
                console.log(`[AnimePahe] Found ${results?.length || 0} results`);
                
                if (results && results.length > 0) {
                    // Use string similarity to find the best match
                    const matches = findSimilarTitles(query, results);
                    if (matches && matches.length > 0) {
                        const topMatch = matches[0];
                        console.log(`[AnimePahe] Top match: ${topMatch.title} (similarity: ${topMatch.similarity})`);
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
        if (bestMatch && bestMatch.session) {
            console.log(`[AnimePahe] Successfully mapped to session: ${bestMatch.session}`);
            return {
                session: bestMatch.session,
                title: bestMatch.title,
                id: bestMatch.id
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