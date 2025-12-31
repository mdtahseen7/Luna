"use client"
import React from 'react'
import Link from 'next/link'
import { useTitle } from '@/lib/store';
import { useStore } from 'zustand';
import Image from 'next/image';

function Footer() {
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    const handleToggle = () => {
        if (animetitle === 'english') {
            useTitle.setState({ animetitle: 'romaji' })
        } else {
            useTitle.setState({ animetitle: 'english' })
        }
    };

    function getSeason(month) {
        if (month === 12 || month === 1 || month === 2) {
            return 'WINTER';
        } else if (month === 3 || month === 4 || month === 5) {
            return 'SPRING';
        } else if (month === 6 || month === 7 || month === 8) {
            return 'SUMMER';
        } else {
            return 'FALL';
        }
    }

    const format = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

    function nextSeason(currentSeason) {
        const currentSeasonIndex = format.indexOf(currentSeason);
        const nextSeasonIndex = (currentSeasonIndex + 1) % format.length;
        return format[nextSeasonIndex];
    }

    return (
        <div>
            <footer className="bg-[#050506] mt-16 border-t border-white/5">
                <div className="mx-auto w-full lg:max-w-[85%] px-4 py-8 lg:py-10 flex flex-col gap-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        <div className="mb-2 lg:mb-0 flex flex-col gap-3">
                            <Link className="flex items-center w-fit" href="/">
                                <p className="Akira self-center !text-4xl tracking-wider font-medium whitespace-nowrap dark:text-white">Luna</p>
                            </Link>
                            <p className="mt-1 lg:text-[0.8rem] text-[0.7rem] text-[#ffffffb2] max-w-xl">
                                This site does not store any files on our server, we only link to media hosted on third party services.
                            </p>
                            <div className="flex items-center gap-5 mt-1">
                                <Link href="https://github.com/mdtahseen7/airin-revived" target="_blank" className=" hover:text-gray-900 dark:hover:text-white">
                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clipRule="evenodd" />
                                    </svg>
                                    <span className="sr-only">GitHub account</span>
                                </Link>
                                <Link href="https://www.instagram.com/md_tahseen_7" target="_blank" className=" hover:text-gray-900 dark:hover:text-white">
                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                    <span className="sr-only">Instagram account</span>
                                </Link>
                                <div className="flex items-center">
                                    <label className="relative cursor-pointer">
                                        {animetitle && (
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={animetitle === 'english'}
                                                onChange={handleToggle}
                                            />
                                        )}
                                        <div className="w-[40px] text-xs h-4 flex items-center bg-[#EAEEFB] rounded-full  peer-checked:text-[#18181b] text-[black] font-bold after:flex after:items-center after:justify-center peer after:content-['JP'] peer-checked:after:content-['EN'] peer-checked:after:translate-x-3/4 after:absolute peer-checked:after:border-white after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#EAEEFB]">
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:gap-16 sm:gap-10 sm:grid-cols-2">
                            <div>
                                <ul className="font-semibold flex flex-col gap-2 lg:text-[0.85rem] text-[0.7rem] text-[#ffffffb2]">
                                    <li className="">
                                        <Link href={`/anime/catalog?season=${getSeason(month + 1)}&year=2024`} className="hover:text-white">This Season</Link>
                                    </li>
                                    <li className="">
                                        <Link href={`/anime/catalog?season=${nextSeason(getSeason(month + 1))}&year=2024`} className="hover:text-white">Upcoming Season</Link>
                                    </li>
                                    <li>
                                        <Link href="/anime/catalog?format=MOVIE" className="hover:text-white"> Movies</Link>
                                    </li>
                                    <li>
                                        <Link href="/anime/catalog?format=TV" className="hover:text-white"> Tv Shows</Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <ul className="font-semibold flex flex-col gap-2 lg:text-[0.85rem] text-[0.7rem] text-[#ffffffb2]">
                                    <li>
                                        <Link href="/dmca" className="hover:text-white"> DMCA</Link>
                                    </li>
                                    
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mx-auto w-full lg:max-w-[85%] flex flex-col lg:flex-row lg:items-center lg:justify-between border-t border-white/5 pt-4 pb-24 lg:pb-8 gap-4 lg:gap-0 text-[#ffffffb2] lg:text-[0.8rem] text-[0.7rem] px-4">
                    <span className="sm:text-center">© {year} <Link href="/" className="hover:text-white">Luna™</Link></span>
                    <div className="flex items-center justify-start lg:justify-end gap-6 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>All API functional</span>
                        </div>
                        <span className="text-gray-400">V5.0</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer
