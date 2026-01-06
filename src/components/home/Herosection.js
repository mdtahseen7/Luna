"use client"
import React, { useEffect, useState } from 'react';
import styles from '../../styles/Herosection.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings, useTitle } from '@/lib/store';
import { useStore } from 'zustand';

function Herosection({ data }) {
  const settings = useStore(useSettings, (state) => state.settings);
  const [trailer, setTrailer] = useState(null);
  const [populardata, setPopulardata] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const animetitle = useStore(useTitle, (state) => state.animetitle);

  // Get random anime from data
  useEffect(() => {
    const getRandomAnime = () => {
      if (data && Array.isArray(data) && data.length > 0) {
        const filteredData = data.filter(
          item => item.bannerImage !== null && item.status !== 'NOT_YET_RELEASED'
        );
        const randomIndex = Math.floor(Math.random() * filteredData.length);
        setPopulardata(filteredData[randomIndex]);
      }
    };
    getRandomAnime();
  }, [data]);

  // Fetch TVDB logo for the selected anime title
  useEffect(() => {
    if (!populardata) {
      setLogoUrl(null);
      return;
    }

    const controller = new AbortController();

    async function fetchLogo() {
      try {
        const titleToUse =
          populardata.title?.[animetitle] ||
          populardata.title?.english ||
          populardata.title?.romaji;

        if (!titleToUse) {
          setLogoUrl(null);
          return;
        }

        const year = populardata.startDate?.year;
        const params = new URLSearchParams({ title: titleToUse });
        if (year) params.set('year', String(year));

        const res = await fetch(`/api/tvdb-logo?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setLogoUrl(null);
          return;
        }

        const data = await res.json();
        setLogoUrl(data.logoUrl || null);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLogoUrl(null);
        }
      }
    }

    fetchLogo();

    return () => {
      controller.abort();
    };
  }, [populardata, animetitle]);

  // Fetch trailer for random anime
  useEffect(() => {
    async function fetchTrailer(trailerId) {
      // Multiple API endpoints to try
      const apiEndpoints = [
        `https://pipedapi.kavin.rocks/streams/${trailerId}`,
        `https://pipedapi.tokhmi.xyz/streams/${trailerId}`,
        `https://api.piped.projectsegfau.lt/streams/${trailerId}`,
        `https://pipedapi.adminforge.de/streams/${trailerId}`,
      ];

      for (const endpoint of apiEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(endpoint, { 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            continue; // Try next endpoint
          }
          
          const res = await response.json();
          
          // Check if response has error
          if (res.error || !res.videoStreams || res.videoStreams.length === 0) {
            continue; // Try next endpoint
          }
          
          // Try to find best quality video
          const item = res.videoStreams?.find(
            (i) => i.quality === '1080p' && i.format === 'WEBM'
          ) || res.videoStreams?.find(
            (i) => i.quality === '720p'
          ) || res.videoStreams?.[0];
          
          if (item?.url) {
            setTrailer(item.url);
            return; // Successfully found a trailer, exit
          }
        } catch (error) {
          // Continue to next endpoint
          continue;
        }
      }
      
      // If all endpoints fail, fall back to embedded YouTube player
      if (trailerId) {
        // Use YouTube embed as last resort
        setTrailer(`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`);
      } else {
        setTrailer(null);
        setVideoEnded(true);
      }
    }
    
    setTrailer(null); // Reset trailer when changing anime
    setVideoEnded(false);
    
    if (populardata && populardata.trailer && settings.herotrailer !== false) {
      fetchTrailer(populardata.trailer.id);
    }
  }, [populardata, settings]);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  const handleVideoError = () => {
    setVideoEnded(true);
  };

  const Month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (!populardata) return null;

  // Check if trailer is a YouTube embed URL
  const isYouTubeEmbed = trailer?.includes('youtube.com/embed');

  return (
    <div className={`${styles.herosection}`}>
      <div className={styles.herogradient}></div>

      {trailer && !videoEnded ? (
        <span className={styles.heroimgcon}>
          {isYouTubeEmbed ? (
            <iframe
              src={trailer}
              className={styles.herovideo}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ border: 'none', width: '100%', height: '100%', objectFit: 'cover' }}
              onError={handleVideoError}
            ></iframe>
          ) : (
            <video
              src={trailer}
              preload="auto"
              autoPlay
              muted
              className={styles.herovideo}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            ></video>
          )}
        </span>
      ) : (
        <span className={styles.heroimgcon}>
          {populardata &&
            <Image 
              src={populardata.bannerImage} 
              alt={populardata.title?.[animetitle] || populardata.title?.romaji} 
              loading='eager' 
              priority={true} 
              width={200} 
              height={200} 
              className={styles.heroimg} 
            />
          }
        </span>
      )}
      <div className={styles.heroinfo}>
        {logoUrl ? (
          <div className={styles.logoWrapper}>
            <Image
              src={logoUrl}
              alt={populardata.title?.[animetitle] || populardata.title?.romaji || 'Title logo'}
              width={400}
              height={160}
              className={styles.logoImage}
              priority
            />
          </div>
        ) : (
          <h1 className={styles.herotitle}>{populardata.title?.[animetitle] || populardata.title?.romaji}</h1>
        )}
        <div className={styles.herocontent}>
          <span className='flex'>
          <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5 mr-1' viewBox="0 0 48 48"><defs><mask id="ipSPlay0"><g fill="none" strokeLinejoin="round" strokeWidth="4"><path fill="#fff" stroke="#fff" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path fill="#000" stroke="#000" d="M20 24v-6.928l6 3.464L32 24l-6 3.464l-6 3.464z"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSPlay0)"/></svg>                   
          {populardata.format}
          </span>
          <span className={`${populardata.status === 'RELEASING' ? styles.activestatus : styles.notactive}`}>{populardata.status}</span>
          <span className='flex '>
            <svg className="w-5 h-5 mr-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v12c0 .6.4 1 1 1Z" />
          </svg>
          {Month[populardata.startDate?.month - 1]} {populardata.startDate?.day}, {populardata.startDate?.year}
          </span>
          <span className="flex items-center">
            <svg viewBox="0 0 32 32" className="w-5 h-5 mr-1" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M4.6661 6.66699C4.29791 6.66699 3.99943 6.96547 3.99943 7.33366V24.667C3.99943 25.0352 4.29791 25.3337 4.6661 25.3337H27.3328C27.701 25.3337 27.9994 25.0352 27.9994 24.667V7.33366C27.9994 6.96547 27.701 6.66699 27.3328 6.66699H4.6661ZM8.66667 21.3333C8.29848 21.3333 8 21.0349 8 20.6667V11.3333C8 10.9651 8.29848 10.6667 8.66667 10.6667H14C14.3682 10.6667 14.6667 10.9651 14.6667 11.3333V12.6667C14.6667 13.0349 14.3682 13.3333 14 13.3333H10.8C10.7264 13.3333 10.6667 13.393 10.6667 13.4667V18.5333C10.6667 18.607 10.7264 18.6667 10.8 18.6667H14C14.3682 18.6667 14.6667 18.9651 14.6667 19.3333V20.6667C14.6667 21.0349 14.3682 21.3333 14 21.3333H8.66667ZM18 21.3333C17.6318 21.3333 17.3333 21.0349 17.3333 20.6667V11.3333C17.3333 10.9651 17.6318 10.6667 18 10.6667H23.3333C23.7015 10.6667 24 10.9651 24 11.3333V12.6667C24 13.0349 23.7015 13.3333 23.3333 13.3333H20.1333C20.0597 13.3333 20 13.393 20 13.4667V18.5333C20 18.607 20.0597 18.6667 20.1333 18.6667H23.3333C23.7015 18.6667 24 18.9651 24 19.3333V20.6667C24 21.0349 23.7015 21.3333 23.3333 21.3333H18Z" fill="currentColor"></path></svg>
            {populardata.nextAiringEpisode?.episode - 1 || populardata.episodes}</span>
        </div>
        <p className={styles.herodescription}>{populardata.description?.replace(/<.*?>/g, '') || ''}</p>
        <div className={styles.herobuttons}>
          <Link href={`/anime/info/${populardata.id}`}>
            <button className={styles.watchnowbutton}>
            <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5 mr-1' viewBox="0 0 48 48"><defs><mask id="ipSPlay0"><g fill="none" strokeLinejoin="round" strokeWidth="4"><path fill="#fff" stroke="#fff" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path fill="#000" stroke="#000" d="M20 24v-6.928l6 3.464L32 24l-6 3.464l-6 3.464z"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSPlay0)"/></svg>
              Play Now
              </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Herosection;
