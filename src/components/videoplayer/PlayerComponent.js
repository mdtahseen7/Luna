"use client"
import React, { useEffect, useState } from 'react'
import { getAnimeSources } from '@/actions/source';
import PlayerEpisodeList from './PlayerEpisodeList';
import Player from './VidstackPlayer/player';
import { Spinner } from '@vidstack/react';
import { toast } from 'sonner';
import { useTitle, useNowPlaying, useDataInfo } from '../../lib/store';
import { useStore } from "zustand";
import { logger } from "@/utils/logger";

function PlayerComponent({ id, epId, provider, epNum, subdub, data, session, savedep }) {
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const [episodeData, setepisodeData] = useState(null);
    const [episodeProviderData, setEpisodeProviderData] = useState(null); // Store full provider data
    const [loading, setLoading] = useState(true);
    const [groupedEp, setGroupedEp] = useState(null);
    const [src, setSrc] = useState(null);
    const [subtitles, setSubtitles] = useState(null);
    const [thumbnails, setThumbnails] = useState(null);
    const [skiptimes, setSkipTimes] = useState(null);
    const [error, setError] = useState(false);
    
    // State to track current provider and episodeId for dynamic changes
    const [currentProvider, setCurrentProvider] = useState(provider);
    const [currentEpisodeId, setCurrentEpisodeId] = useState(epId);
    
    // Sync state with props when they change (initial load)
    useEffect(() => {
        setCurrentProvider(provider);
        setCurrentEpisodeId(epId);
    }, [provider, epId]);
    
    // Callback function to handle provider changes from PlayerEpisodeList
    const handleProviderChange = (newProvider, newEpisodeId) => {
        logger.log(`[PlayerComponent] Provider changed to: ${newProvider}, Episode ID: ${newEpisodeId}`);
        setCurrentProvider(newProvider);
        setCurrentEpisodeId(decodeURIComponent(newEpisodeId));
    };

    useEffect(() => {
        useDataInfo.setState({ dataInfo: data });
        const fetchSources = async () => {
            setError(false);
            setLoading(true);
            try {
                // Get anime session for AnimePahe provider
                // First try to get it from current episode data, then from provider data
                let animeSession = null;
                if (currentProvider === "animepahe") {
                    // Check if current episode has anime session embedded
                    const currentEp = episodeData?.find((i) => i.number === parseInt(epNum));
                    if (currentEp?.animeSession) {
                        animeSession = currentEp.animeSession;
                        logger.log(`[PlayerComponent] Using animeSession from episode: ${animeSession}`);
                    } else if (episodeProviderData?.animeSession) {
                        animeSession = episodeProviderData.animeSession;
                        logger.log(`[PlayerComponent] Using animeSession from provider: ${animeSession}`);
                    } else {
                        logger.log(`[PlayerComponent] WARNING: No animeSession found!`, { currentEp, episodeProviderData });
                    }
                }

                const response = await getAnimeSources(id, currentProvider, currentEpisodeId, epNum, subdub, animeSession);

                logger.log("[PlayerComponent] Source response:", response);
                logger.log("[PlayerComponent] Sources array:", response?.sources);
                logger.log("[PlayerComponent] Sources length:", response?.sources?.length);
                
                // Check if we have sources
                if (!response?.sources || response.sources.length === 0) {
                    logger.error("[PlayerComponent] No sources found in response!");
                    toast.error("Failed to load episode. Please try again later.");
                    setError(true);
                    setLoading(false);
                    return;
                }
                
                // Check if sources are iframe type (AnimePahe/MegaPlay) or m3u8 (Kaido/HiAnime with Vidstack)
                const firstSource = response?.sources?.[0];
                logger.log("[PlayerComponent] First source:", firstSource);
                logger.log("[PlayerComponent] Provider:", currentProvider);
                
                if ((currentProvider === 'animepahe' || currentProvider === 'megaplay') && firstSource?.type === 'iframe') {
                    // AnimePahe and MegaPlay use iframe players
                    let iframeUrl = firstSource.url;
                    
                    // Add autoplay parameter to the URL if not already present
                    if (!iframeUrl.includes('autoplay=')) {
                        const separator = iframeUrl.includes('?') ? '&' : '?';
                        iframeUrl = `${iframeUrl}${separator}autoplay=1`;
                    }
                    
                    logger.log(`[PlayerComponent] Using ${currentProvider} iframe source with autoplay:`, iframeUrl);
                    setSrc({ type: 'iframe', url: iframeUrl });
                } else if (currentProvider === 'kaido' || currentProvider === 'hianime') {
                    // Kaido and HiAnime use Vidstack player with proxied m3u8
                    const m3u8Source = firstSource?.url || firstSource;
                    logger.log(`[PlayerComponent] Using ${currentProvider} m3u8 with Vidstack (proxied):`, m3u8Source);
                    setSrc(m3u8Source);
                } else {
                    // For regular m3u8 sources (fallback)
                    const sources = response?.sources?.find(i => i.quality === "default" || i.quality === "auto")?.url || response?.sources?.find(i => i.quality === "1080p")?.url || response?.sources?.find(i => i.type === "hls")?.url;
                    logger.log("[PlayerComponent] Using regular source:", sources);
                    setSrc(sources);
                }
                const download = response?.download;

                let subtitlesArray = response.tracks || response.subtitles;
                const reFormSubtitles = subtitlesArray?.map((i) => ({
                    src: i?.file || i?.url,
                    label: i?.label || i?.lang,
                    kind: i?.kind || (i?.lang === "Thumbnails" ? "thumbnails" : "subtitles"),
                    default: i?.default || (i?.lang === "English"),
                }));
                

                setSubtitles(reFormSubtitles?.filter((s) => s.kind !== 'thumbnails'));
                setThumbnails(reFormSubtitles?.filter((s) => s.kind === 'thumbnails'));

                // Use provider's skip times if available, otherwise fall back to AniSkip API
                let skiptime = [];
                
                if ((currentProvider === 'kaido' || currentProvider === 'hianime') && (response?.intro || response?.outro)) {
                    logger.log(`[PlayerComponent] Using ${currentProvider} skip times:`, { intro: response.intro, outro: response.outro });
                    
                    if (response.intro) {
                        skiptime.push({
                            startTime: response.intro.start ?? 0,
                            endTime: response.intro.end ?? 0,
                            text: 'Opening',
                        });
                    }
                    
                    if (response.outro) {
                        skiptime.push({
                            startTime: response.outro.start ?? 0,
                            endTime: response.outro.end ?? 0,
                            text: 'Ending',
                        });
                    }
                } else {
                    // Fall back to AniSkip API for other providers
                    const skipResponse = await fetch(
                        `https://api.aniskip.com/v2/skip-times/${data?.idMal}/${parseInt(epNum)}?types[]=ed&types[]=mixed-ed&types[]=mixed-op&types[]=op&types[]=recap&episodeLength=`
                    );

                    const skipData = await skipResponse.json();
                    const op = skipData?.results?.find((item) => item.skipType === 'op') || null;
                    const ed = skipData?.results?.find((item) => item.skipType === 'ed') || null;
                    const episodeLength = skipData?.results?.find((item) => item.episodeLength)?.episodeLength || 0;

                    if (op?.interval) {
                        skiptime.push({
                            startTime: op.interval.startTime ?? 0,
                            endTime: op.interval.endTime ?? 0,
                            text: 'Opening',
                        });
                    }
                    if (ed?.interval) {
                        skiptime.push({
                            startTime: ed.interval.startTime ?? 0,
                            endTime: ed.interval.endTime ?? 0,
                            text: 'Ending',
                        });
                    } else {
                        skiptime.push({
                            startTime: op?.interval?.endTime ?? 0,
                            endTime: episodeLength,
                            text: '',
                        });
                    }
                }

                const episode = {
                    download: download || null,
                    skiptimes: skiptime || [],
                    epId: currentEpisodeId || null,
                    provider: currentProvider || null,
                    epNum: epNum || null,
                    subtype: subdub || null,
                };

                useNowPlaying.setState({ nowPlaying: episode });
                setSkipTimes(skiptime);
                // logger.log(skipData);
                setLoading(false);
            } catch (error) {
                logger.error('Error fetching data:', error);
                toast.error("Failed to load episode. Please try again later.");
                const episode = {
                    download: null,
                    skiptimes: [],
                    epId: currentEpisodeId || null,
                    provider: currentProvider || null,
                    epNum: epNum || null,
                    subtype: subdub || null,
                };

                useNowPlaying.setState({ nowPlaying: episode });
                setLoading(false);
            }
        };
        fetchSources();
    }, [id, currentProvider, currentEpisodeId, epNum, subdub, episodeData, episodeProviderData, data]);

    useEffect(() => {
        if (episodeData) {
            const previousep = episodeData?.find(
                (i) => i.number === parseInt(epNum) - 1
            );
            const nextep = episodeData?.find(
                (i) => i.number === parseInt(epNum) + 1
            );
            const currentep = episodeData?.find(
                (i) => i.number === parseInt(epNum)
            );
            
            // Extract provider data from current episode for AnimePahe
            if (currentep?._providerData) {
                setEpisodeProviderData(currentep._providerData);
            }
            
            const epdata = {
                previousep,
                currentep,
                nextep,
            }
            setGroupedEp(epdata);
        }
    }, [episodeData, epId, provider, epNum, subdub]);

    return (
        <div className='xl:w-[99%]'>
            <div>
                <div className='mb-2'>
                    {!loading && !error ? (
                        <div className='h-full w-full aspect-video overflow-hidden'>
                            {src?.type === 'iframe' ? (
                                // AnimePahe iframe embed with autoplay
                                <iframe
                                    src={src.url}
                                    className='w-full h-full'
                                    frameBorder="0"
                                    allowFullScreen
                                    scrolling="no"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    title={`Episode ${epNum}`}
                                />
                            ) : (
                                // Regular m3u8 player (commented out old providers)
                                <Player dataInfo={data} id={id} groupedEp={groupedEp} session={session} savedep={savedep} src={src} subtitles={subtitles} thumbnails={thumbnails} skiptimes={skiptimes} />
                            )}
                        </div>
                    ) : (
                        <div className="h-full w-full rounded-[8px] relative flex items-center text-xl justify-center aspect-video border border-solid border-white border-opacity-10">
                            {!loading && error ? (
                                <div className='text-sm sm:text-base px-2 flex flex-col items-center text-center'>
                                    <p className='mb-2 text-xl'>(╯°□°)╯︵ ɹoɹɹƎ</p>
                                    <p>Failed to load episode. Please try again later.</p>
                                    <p>If the problem persists, consider changing servers.</p>
                                </div>) : (
                                <div className="pointer-events-none absolute inset-0 z-50 flex h-full w-full items-center justify-center">
                                    <Spinner.Root className="text-white animate-spin opacity-100" size={84}>
                                        <Spinner.Track className="opacity-25" width={8} />
                                        <Spinner.TrackFill className="opacity-75" width={8} />
                                    </Spinner.Root>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className=' my-[9px] mx-2 sm:mx-1 px-1 lg:px-0'>
                    <h2 className='text-[20px]'>{data?.title?.[animetitle] || data?.title?.romaji}</h2>
                    <h2 className='text-[16px] text-[#ffffffb2]'>{` EPISODE ${epNum} `}</h2>
                </div>
            </div>
            <div className='w-[98%] mx-auto lg:w-full'>
                <PlayerEpisodeList 
                    id={id} 
                    data={data} 
                    setwatchepdata={setepisodeData} 
                    onprovider={handleProviderChange}
                    initialProvider={provider}
                    epnum={epNum} 
                />
            </div>
        </div>
    )
}

export default PlayerComponent

