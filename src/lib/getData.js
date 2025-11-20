"use server"
import { redis } from "@/lib/rediscache";

export async function getRecentEpisodes() {
    try {
        // Check Redis cache first
        if (redis) {
            const cached = await redis.get('recent-episodes-v3');
            if (cached) {
                console.log('[RecentEpisodes] Serving from Redis cache');
                return JSON.parse(cached);
            }
        }

        // Use AniList's airing schedule to get episodes that aired in the last 3 days
        const now = Math.floor(Date.now() / 1000);
        const threeDaysAgo = now - (3 * 24 * 60 * 60); // 3 days ago

        const query = `
            query($from: Int, $to: Int) {
                Page(page: 1, perPage: 30) {
                    airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME_DESC) {
                        episode
                        airingAt
                        media {
                            id
                            title {
                                romaji
                                english
                            }
                            coverImage {
                                large
                                extraLarge
                            }
                            status
                            format
                            episodes
                        }
                    }
                }
            }
        `;

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: {
                    from: threeDaysAgo,
                    to: now
                },
            }),
        }, { next: { revalidate: 1800 } }); // Cache for 30 minutes to reduce API calls

        if (!response.ok) {
            console.error(`[RecentEpisodes] API returned status: ${response.status}`);
            return [];
        }

        const result = await response.json();
        
        if (!result?.data?.Page?.airingSchedules) {
            console.log('[RecentEpisodes] No recent episodes found');
            return [];
        }

        // Map to our format and remove duplicates (keep latest episode per anime)
        const seenAnime = new Map();
        result.data.Page.airingSchedules.forEach(item => {
            if (item.media && !seenAnime.has(item.media.id)) {
                seenAnime.set(item.media.id, {
                    id: item.media.id,
                    title: item.media.title,
                    status: item.media.status,
                    format: item.media.format,
                    totalEpisodes: item.media.episodes,
                    currentEpisode: item.episode,
                    coverImage: item.media.coverImage,
                    airingAt: item.airingAt
                });
            }
        });

        const mappedData = Array.from(seenAnime.values())
            .filter(anime => anime.format !== 'TV_SHORT') // Filter out TV shorts
            .slice(0, 20); // Limit to 20 anime

        // Cache in Redis for 30 minutes (1800 seconds) to reduce rate limit issues
        if (redis && mappedData.length > 0) {
            await redis.set('recent-episodes-v3', JSON.stringify(mappedData), 'EX', 1800);
            console.log(`[RecentEpisodes] Cached ${mappedData.length} anime in Redis for 30 minutes`);
        }

        return mappedData;
    } catch (error) {
        console.error("Error fetching Recent Episodes:", error);
        return [];
    }
}