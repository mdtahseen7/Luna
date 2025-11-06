"use server"
import { redis } from '@/lib/rediscache';
import { ANIME } from "@consumet/extensions";
import { AnimeInfoAnilist } from '@/lib/Anilistfunctions'
import { findSimilarTitles } from '@/lib/stringSimilarity';


const gogo = new ANIME.Gogoanime();
const hianime = new ANIME.Zoro();

export async function getMappings(anilistId) {
    console.log(`\n========== [MAPPINGS] Starting for AniList ID: ${anilistId} ==========`);
    const data = await getInfo(anilistId);
    let gogores, zorores, animepaheres, kaidores;
    if (!data) {
        console.log("[MAPPINGS] No anime info found");
        return null;
    }
    console.log(`[MAPPINGS] Anime Title: ${data?.title?.romaji || data?.title?.english}`);
    
    // COMMENTED OUT: Old provider mappings to test AnimePahe exclusively
    // gogores = await mapGogo(data?.title);
    // zorores = await mapZoro(data?.title);
    
    // ACTIVE: AnimePahe and Kaido mapping
    animepaheres = await mapAnimePahe(data?.title);
    console.log(`[MAPPINGS] AnimePahe result:`, animepaheres);
    
    kaidores = await mapKaido(data?.title);
    console.log(`[MAPPINGS] Kaido result:`, kaidores);
    
    const result = { gogoanime: gogores, zoro: zorores, animepahe: animepaheres, kaido: kaidores, id: data?.id, malId: data?.idMal, title: data?.title.romaji };
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

async function mapGogo(title) {
    let eng = await gogo.search(title?.english || title?.userPreferred);
    let rom = await gogo.search(title?.romaji);
    let english_search = eng?.results || [];
    let romaji_search = rom?.results || [];
    // Combine both results and remove duplicates
    const combined = [...english_search, ...romaji_search];

    const uniqueResults = Array.from(new Set(combined.map(item => JSON.stringify(item))))
    .map(item => JSON.parse(item));

    const gogomap = findSimilarTitles(title?.romaji || title?.english || title?.userPreferred, uniqueResults)
    const gogoanime = {};

    gogomap?.forEach((obj) => {
        const title = obj.title;
        const id = obj.id;

        const match = title.replace(/\(TV\)/g, "").match(/\(([^)0-9]+)\)/);

        if (match && (match[1].toLowerCase() === 'uncensored' || match[1].toLowerCase() === 'dub')) {
            const key = match[1].replace(/\s+/g, '-').toLowerCase();
            if (!gogoanime[key]) {
                gogoanime[key] = id;
            }
        } else {
            if (!gogoanime['sub']) {
                gogoanime['sub'] = id;
            }
        }
    });
    return gogoanime;
}

async function mapZoro(title) {
    let eng = await hianime.search(title?.english || title?.romaji || title?.userPreferred);
    const zoromap = findSimilarTitles(title?.english, eng?.results)
    const zoromaprom = findSimilarTitles(title?.romaji, eng?.results)
    const combined = [...zoromap, ...zoromaprom];

    const uniqueCombined = combined.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    // Sort based on similarity (assuming similarity is a property of the objects)
    uniqueCombined.sort((a, b) => b.similarity - a.similarity);

    const zoro = {};

    uniqueCombined.forEach((obj) => {
        const title = obj.title;
        const id = obj.id;

        const match = title.replace(/\(TV\)/g, "").match(/\(([^)0-9]+)\)/);
        if (match && (match[1].toLowerCase() === 'uncensored' || match[1].toLowerCase() === 'dub')) {
            const key = match[1].replace(/\s+/g, '-').toLowerCase();
            if (!zoro[key]) {
                zoro[key] = id;
            }
        } else {
            if (!zoro['sub']) {
                zoro['sub'] = id;
            }
        }
    });
    return zoro;
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