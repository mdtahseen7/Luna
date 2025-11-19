"use client"
import React, { useRef, useState } from 'react';
import styles from '../../styles/Animecard.module.css';
import { useDraggable } from 'react-use-draggable-scroll';
import Link from 'next/link';
import ItemContent from '../CardComponent/ItemContent';

function UserWatchingList({ data }) {
    const containerRef = useRef();
    const { events } = useDraggable(containerRef);
    const [isLeftArrowActive, setIsLeftArrowActive] = useState(false);
    const [isRightArrowActive, setIsRightArrowActive] = useState(false);

    if (!data || data.length === 0) {
        return null;
    }

    function handleScroll() {
        const container = containerRef.current;
        const scrollPosition = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setIsLeftArrowActive(scrollPosition > 30);
        setIsRightArrowActive(scrollPosition < maxScroll - 30);
    }

    const smoothScroll = (amount) => {
        const container = containerRef.current;
        const cont = document.getElementById('Currently Watching');

        if (cont && container) {
            cont.classList.add('scroll-smooth');
            container.scrollLeft += amount;

            setTimeout(() => {
                cont.classList.remove('scroll-smooth');
            }, 300);
        }
    };

    function scrollLeft() {
        smoothScroll(-500);
    }

    function scrollRight() {
        smoothScroll(+500);
    }

    return (
        <div className={styles.animecard}>
            <div className={styles.cardhead}>
                <span className={styles.bar}></span>
                <h1 className={styles.headtitle}>Currently Watching</h1>
            </div>
            <div className={styles.animeitems}>
                <span className={`${styles.leftarrow} ${isLeftArrowActive ? styles.active : styles.notactive}`}>
                    <svg onClick={scrollLeft} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                        <path d="m15 18-6-6 6-6"></path>
                    </svg>
                </span>
                <span className={`${styles.rightarrow} ${isRightArrowActive ? styles.active : styles.notactive}`}>
                    <svg onClick={scrollRight} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                        <path d="m9 18 6-6-6-6"></path>
                    </svg>
                </span>
                <div className={styles.cardcontainer} id="Currently Watching" {...events} ref={containerRef} onScroll={handleScroll}>
                    {data.map((item) => {
                        const anime = {
                            id: item.id || '',
                            coverImage: item.coverImage?.extraLarge || item.coverImage?.large || '',
                            title: item.title || '',
                            status: item.status || '',
                            format: item.format || '',
                            episodes: item.episodes || '',
                            nextAiringEpisode: item.nextAiringEpisode || null,
                            listProgress: item.listProgress || 0
                        };
                        return (
                            <Link href={`/anime/info/${anime.id}`} key={`${anime.id}-${item.listId}`}>
                                <ItemContent anime={anime} cardid="Currently Watching" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default UserWatchingList;

