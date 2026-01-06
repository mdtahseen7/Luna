"use client"
import React, { useState, useEffect } from 'react';
import styles from '../../styles/VerticalList.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useTitle } from '@/lib/store';
import { useStore } from 'zustand';

const UpcomingSchedule = ({ data, id, startIndex = 0, className = '' }) => {
  const animetitle = useStore(useTitle, (state) => state.animetitle);
  const [maxWidth, setMaxWidth] = useState(0);

  useEffect(() => {
    console.log('[UpcomingSchedule] Received data:', data);
    console.log('[UpcomingSchedule] Data length:', data?.length);
    console.log('[UpcomingSchedule] Start index:', startIndex);
  }, [data, startIndex]);

  useEffect(() => {
    const handleResize = () => {
      setMaxWidth(window.innerWidth);
    };
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatAirTime = (airingAt, timeUntilAiring) => {
    const now = Date.now() / 1000;
    const airingDate = new Date(airingAt * 1000);
    
    // If airing in less than 24 hours
    if (timeUntilAiring < 86400) {
      const hours = Math.floor(timeUntilAiring / 3600);
      const minutes = Math.floor((timeUntilAiring % 3600) / 60);

      if (hours === 0) {
        return `${minutes}m from now`;
      }
      return `${hours}h ${minutes}m from now`;
    }
    
    // If airing in less than 7 days
    const days = Math.floor(timeUntilAiring / 86400);
    if (days < 7) {
      return `In ${days}d`;
    }
    
    // Show date
    return airingDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getColorStyle = (index) => {
    const colors = ['#a78bfa', '#8b5cf6', '#c084fc'];
    return maxWidth <= 900
      ? { backgroundColor: colors[index % 3], color: 'white' }
      : { backgroundColor: 'transparent', color: colors[index % 3] };
  };

  const isMobile = maxWidth <= 1024;

  const activeData = data;
  const activeId = id;
  const activeStartIndex = startIndex;

  return (
    <div className={`${styles.verticalcard} ${className}`}>
      <div className={styles.tophead}>
        <span className={styles.bar}></span><h1 className={styles.headtitle}>{activeId}</h1>
      </div>
      <div className={styles.mobiletop}>
        <div className='flex flex-row gap-[8px] items-center'>
          <span className={styles.bar}></span>
          <h1 className={styles.mobiletitle}>{activeId}</h1>
        </div>
      </div>
      {(!activeData || activeData.length === 0) ? (
        <div className="text-center py-8 text-gray-400">
          <p>No upcoming episodes</p>
        </div>
      ) : (
        activeData?.slice(0, 5).map((anime, index) => (
        <div className={`${styles.vcarditem} group`} key={`${anime.id}-${anime.episode}`}>
          <div
            className={styles.vcardindex}
            style={index < 3 ? getColorStyle(index) : {}}
          >
            #{activeStartIndex + index + 1}
          </div>
          <div className={styles.vcardcontent}>
            <div className={styles.vcardleft}>
              <Image
                src={anime?.coverImage?.large || anime?.coverImage?.extraLarge}
                alt={anime.title?.[animetitle] || anime.title?.romaji}
                width={60}
                height={85}
                className={styles.vcardimg}
              />
              <div className={styles.vcardinfo}>
                <div className={styles.linktitle}>
                  <Link
                    href={`/anime/info/${anime.id}`}
                    className="line-clamp-2"
                  >
                    {anime.title?.[animetitle] || anime.title?.romaji}
                  </Link>
                </div>
                <div className={styles.vcardleftb}>
                  <span className={styles.score}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-[14px] h-[14px] mt-[1px] mr-[2px]">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {anime.format === 'TV' ? 'TV Show' : anime.format}
                  </span>
                  <span className={styles.dot}>.</span>
                  <span className={styles.season}>
                    EP {anime.episode}
                  </span>
                  <span className={styles.dot}>.</span>
                  <span className={styles.vstatusc}>
                    AIRING
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.vcardright}>
              <div className={styles.vpopular}>
                <span className={styles.format}>
                  {formatAirTime(anime.airingAt, anime.timeUntilAiring)}
                </span>
                <div className={styles.vcardformat}>
                  {anime.totalEpisodes ? (
                    <span className={styles.bpopular}>
                      {anime.totalEpisodes} episodes
                    </span>
                  ) : (
                    <span className={styles.bpopular}>Ongoing</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )))}
    </div>
  );
};

export default UpcomingSchedule;
