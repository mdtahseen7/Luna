"use server"
import { trending, animeinfo, advancedsearch, top100anime, seasonal, popular, userwatchinglist, schedule } from "./anilistqueries";

export const TrendingAnilist = async () => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: trending,
                variables: {
                    page: 1,
                    perPage: 15,
                },
            }),
        // }, { cache: "no-store" });
    }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Page.media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const PopularAnilist = async () => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: popular,
                variables: {
                    page: 1,
                    perPage: 15,
                },
            }),
        // }, { cache: "no-store" });
    }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Page.media;
    } catch (error) {
        console.error('Error fetching popular data from AniList:', error);
    }
}

export const Top100Anilist = async () => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: top100anime,
                variables: {
                    page: 1,
                    perPage: 10,
                },
            }),
        }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Page.media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const SeasonalAnilist = async () => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: seasonal,
                variables: {
                    page: 1,
                    perPage: 10,
                },
            }),
        }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Page.media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const AnimeInfoAnilist = async (animeid) => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: animeinfo,
                variables: {
                    id: animeid,
                },
            }),
        // }, { cache: "no-store" });
    }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const AdvancedSearch = async (searchvalue, selectedYear=null, seasonvalue=null, formatvalue=null, genrevalue=[], sortbyvalue=null, currentPage=1) => {
    const types = {};

    for (const item of genrevalue) {
        const { type, value } = item;

        if (types[type]) {
            types[type].push(value);
        } else {
            types[type] = [value];
        }
    }

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: advancedsearch,
                variables: {
                    ...(searchvalue && {
                        search: searchvalue,
                        ...(!sortbyvalue && { sort: "SEARCH_MATCH" }),
                    }),
                    type: "ANIME",
                    ...(selectedYear && { seasonYear: selectedYear }),
                    ...(seasonvalue && { season: seasonvalue }),
                    ...(formatvalue && { format: formatvalue }),
                    ...(sortbyvalue && { sort: sortbyvalue }),
                    ...(types && { ...types }),
                    ...(currentPage && { page: currentPage }),
                },
            }),
        });

        const data = await response.json();
        return data.data.Page;
    } catch (error) {
        console.error('Error fetching search data from AniList:', error);
    }
};

export const UpcomingAnilist = async () => {
    try {
        const API_URL = process.env.KAIDO_API_URL || 'https://kenjitsu.vercel.app';
        
        const response = await fetch(`${API_URL}/api/anilist/anime/top/upcoming?format=TV&page=1&perPage=15`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`[UpcomingAnilist] API returned status: ${response.status}`);
            return [];
        }

        const result = await response.json();
        
        if (!result.data || result.data.length === 0) {
            console.log('[UpcomingAnilist] No data returned from API');
            return [];
        }
        
        // Map the response to match AniList format
        const mappedData = result.data.map((item) => ({
            id: item.anilistId,
            malId: item.malId,
            title: {
                romaji: item.title?.romaji || '',
                english: item.title?.english || null,
                native: item.title?.native || ''
            },
            coverImage: {
                large: item.image,
                extraLarge: item.image
            },
            bannerImage: item.bannerImage || null,
            format: item.format || 'TV',
            status: item.status || 'NOT_YET_RELEASED',
            episodes: item.episodes,
            genres: item.genres || [],
            averageScore: item.score || null,
            season: item.season,
            seasonYear: item.releaseDate ? parseInt(item.releaseDate.split('-')[0]) : null,
            duration: item.duration,
            description: item.synopsis || '',
            trailer: item.trailer || null,
            studios: item.studio ? { nodes: [{ name: item.studio }] } : { nodes: [] }
        }));

        return mappedData;
    } catch (error) {
        console.error('[UpcomingAnilist] Error fetching upcoming anime:', error);
        return [];
    }
};

export const AiringSchedule = async () => {
    try {
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const oneWeekFromNow = now + (7 * 24 * 60 * 60); // One week from now

        console.log(`[AiringSchedule] Fetching schedule from ${new Date(now * 1000).toISOString()} to ${new Date(oneWeekFromNow * 1000).toISOString()}`);

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: schedule,
                variables: {
                    page: 1,
                    perPage: 50,
                    from: now,
                    to: oneWeekFromNow
                },
            }),
        }, { next: { revalidate: 300 } }); // Cache for 5 minutes

        if (!response.ok) {
            console.error(`[AiringSchedule] API returned status: ${response.status}`);
            return [];
        }

        const data = await response.json();
        
        console.log(`[AiringSchedule] Raw response:`, JSON.stringify(data, null, 2));
        
        if (!data?.data?.Page?.airingSchedules) {
            console.log('[AiringSchedule] No airing schedules found in response');
            return [];
        }

        console.log(`[AiringSchedule] Found ${data.data.Page.airingSchedules.length} schedules before filtering`);

        // Map and sort by airing time
        const schedules = data.data.Page.airingSchedules
            .filter(item => {
                const isReleasing = item.media?.status === 'RELEASING';
                const isTVShort = item.media?.format === 'TV_SHORT';
                if (!isReleasing) {
                    console.log(`[AiringSchedule] Filtered out: ${item.media?.title?.romaji} - Status: ${item.media?.status}`);
                }
                if (isTVShort) {
                    console.log(`[AiringSchedule] Filtered out TV_SHORT: ${item.media?.title?.romaji}`);
                }
                return isReleasing && !isTVShort;
            })
            .map(item => ({
                id: item.media?.id || Math.random(),
                episode: item.episode,
                airingAt: item.airingAt,
                timeUntilAiring: item.timeUntilAiring,
                title: item.media?.title,
                coverImage: {
                    large: item.media?.coverImage?.large || item.media?.coverImage?.extraLarge,
                    extraLarge: item.media?.coverImage?.extraLarge || item.media?.coverImage?.large,
                },
                bannerImage: item.media?.bannerImage,
                format: item.media?.format,
                status: item.media?.status,
                totalEpisodes: item.media?.episodes,
            }))
            .sort((a, b) => a.airingAt - b.airingAt); // Sort by airing time (earliest first)

        console.log(`[AiringSchedule] Returning ${schedules.length} schedules after filtering`);
        return schedules;
    } catch (error) {
        console.error('[AiringSchedule] Error fetching airing schedule:', error);
        return [];
    }
};

export const UserWatchingList = async (token, userId) => {
    try {
        if (!token && !userId) {
            console.log('[UserWatchingList] No token or userId provided');
            return [];
        }

        let targetUserId = userId;

        // If no userId provided but we have token, fetch the authenticated user's ID
        if (!targetUserId && token) {
            try {
                const viewerResponse = await fetch('https://graphql.anilist.co', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        query: `query { Viewer { id } }`
                    }),
                }, { cache: "no-store" });

                if (viewerResponse.ok) {
                    const viewerData = await viewerResponse.json();
                    targetUserId = viewerData.data?.Viewer?.id;
                }
            } catch (e) {
                console.error('[UserWatchingList] Error fetching Viewer ID:', e);
            }
        }

        if (!targetUserId) {
             console.log('[UserWatchingList] Could not determine user ID');
             return [];
        }

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
                query: userwatchinglist,
                variables: {
                    userId: parseInt(targetUserId),
                },
            }),
        }, { cache: "no-store" });

        if (!response.ok) {
            console.error(`[UserWatchingList] API returned status: ${response.status}`);
            return [];
        }

        const data = await response.json();
        
        if (!data?.data?.MediaListCollection?.lists) {
            // console.log('[UserWatchingList] No lists found');
            return [];
        }

        // Aggregate entries from ALL lists with status CURRENT (handles split lists)
        const currentLists = data.data.MediaListCollection.lists.filter(list => list.status === 'CURRENT');
        
        if (currentLists.length === 0) {
            // console.log('[UserWatchingList] No currently watching lists found');
            return [];
        }

        let allEntries = [];
        currentLists.forEach(list => {
            if (list.entries && list.entries.length > 0) {
                allEntries = [...allEntries, ...list.entries];
            }
        });

        if (allEntries.length === 0) {
            return [];
        }

        // Extract media from entries and return only those with CURRENT status
        const watchingAnime = allEntries
            .filter(entry => entry.status === 'CURRENT')
            .map(entry => ({
                ...entry.media,
                listProgress: entry.progress,
                listId: entry.id
            }));

        return watchingAnime;
    } catch (error) {
        console.error('[UserWatchingList] Error fetching watching list:', error);
        return [];
    }
};

export const getSchedule = async (page = 1, perPage = 50, from, to) => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: schedule,
                variables: {
                    page,
                    perPage,
                    from,
                    to,
                },
            }),
        }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Page.airingSchedules;
    } catch (error) {
        console.error('Error fetching schedule data from AniList:', error);
        return [];
    }
};

