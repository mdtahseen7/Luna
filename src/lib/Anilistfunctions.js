"use server"
import { trending, animeinfo, advancedsearch, top100anime, seasonal, popular } from "./anilistqueries";

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
