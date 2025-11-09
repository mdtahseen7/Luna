"use server"
import { redis } from "@/lib/rediscache";

export async function getRecentEpisodes() {
    try {
        // Using Kaido API's category endpoint for airing/ongoing anime
        const API_URL = process.env.KAIDO_API_URL || 'https://kenjitsu.vercel.app';
        
        const response = await fetch(`${API_URL}/api/kaido/anime/category/airing?page=1`, {
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            console.error(`[RecentEpisodes] API returned status: ${response.status}`);
            return [];
        }

        const result = await response.json();
        
        // Map Kaido response to our format
        const mappedData = result.data?.map((item) => ({
            id: item.id, // This is the Kaido ID, we'll need to get AniList ID
            title: {
                romaji: item.romaji || item.name,
                english: item.name
            },
            status: 'RELEASING', // These are updated anime, so they're releasing
            format: item.type || 'TV',
            totalEpisodes: item.totalEpisodes || null,
            currentEpisode: item.episodes?.sub || item.episodes?.dub || 0,
            coverImage: {
                large: item.posterImage,
                extraLarge: item.posterImage
            },
            kaidoId: item.id // Store Kaido ID for reference
        })) || [];

        return mappedData;
    } catch (error) {
        console.error("Error fetching Recent Episodes:", error);
        return [];
    }
}

export const GET = async (req) => {
    let cached;
    if (redis) {
        console.log('using redis')
        cached = await redis.get('recent');
    }
    if (cached) {
        return JSON.parse(cached);
    }
    else {
        const data = await fetchRecent();
        if (data && data?.length > 0) {
            if (redis) {
                await redis.set(
                    "recent",
                    JSON.stringify(data),
                    "EX",
                    60 * 60
                );
            }
            return data;
        } else {
            return { message: "Recent Episodes not found" };
        }
    }
};