"use client"
import React, { useEffect, useState } from 'react';
import { DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, DropdownSection, Avatar, Badge, useDisclosure } from "@nextui-org/react";
import Link from "next/link"
import styles from '../../styles/Navbar.module.css'
import { useSession, signIn, signOut } from 'next-auth/react';
import { FeedbackIcon, LoginIcon, LogoutIcon, SettingsIcon, ProfileIcon, NotificationIcon } from '@/lib/SvgIcons';
import { Usernotifications } from '@/lib/AnilistUser';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Feedbackform from './Feedbackform';
import { NotificationTime } from '@/utils/TimeFunctions';
import { useTitle, useSearchbar } from '@/lib/store';
import { useStore } from 'zustand';
import Image from 'next/image';

function Navbarcomponent({ home = false }) {
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const Isopen = useStore(useSearchbar, (state) => state.Isopen);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const iconClasses = "w-5 h-5 text-xl text-default-500 pointer-events-none flex-shrink-0";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { data, status } = useSession();
    const [hidden, setHidden] = useState(false);
    const { scrollY } = useScroll();
    const [notifications, setNotifications] = useState([]);
    const [todayNotifications, setTodayNotifications] = useState([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('Today');

    const handleTimeframeChange = (e) => {
        setSelectedTimeframe(e.target.value);
    };

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        }
        else {
            setHidden(false);
            setIsScrolled(false);
        }
        if (latest > 50) {
            setIsScrolled(true)
        }
    })

    useEffect(() => {
        if (status === 'authenticated') {
            setIsLoggedIn(true);
        }
        else {
            setIsLoggedIn(false);
        }
    }, [status])

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (status === 'authenticated' && data?.user?.token) {
                    const response = await Usernotifications(data.user.token, 1);
                    const notify = response?.notifications?.filter(item => Object.keys(item).length > 0);
                    setNotifications(notify);
                    const filteredNotifications = filterNotifications(notify);
                    setTodayNotifications(filteredNotifications);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        }
        fetchNotifications();
    }, [status, data]);

    function filterNotifications(notifications) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const oneDayInSeconds = 24 * 60 * 60;
        return notifications.filter(notification => {
            const createdAtTimestamp = notification.createdAt;
            const timeDifference = currentTimestamp - createdAtTimestamp;
            return timeDifference <= oneDayInSeconds;
        });
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'KeyS' && e.ctrlKey) {
                e.preventDefault();
                useSearchbar.setState({ Isopen: !useSearchbar.getState().Isopen });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [Isopen]);

    const navbarClass = isScrolled
        ? `${home ? styles.homenavbar : styles.navbar} ${home && styles.navbarscroll}`
        : home ? styles.homenavbar : styles.navbar;

    return (
        <motion.nav className={navbarClass}
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? 'hidden' : 'visible'}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <div className={styles.navleft}>
                <div className={styles.logoContainer}>
                    <Link href="/" className={styles.logoLink}>
                        
                        Luna
                    </Link>
                </div>
                <button
                    type="button"
                    title="Search"
                    onClick={() => useSearchbar.setState({ Isopen: true }) }
                    className="ml-3 px-4 py-2 min-w-[200px] lg:min-w-[300px] h-[40px] outline-none backdrop-blur-md bg-white/5 rounded-full flex items-center gap-3 hover:bg-white/10 transition-all border border-white/10"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 flex-shrink-0"
                    >
                        <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14z"
                        ></path>
                    </svg>
                    <span className="text-white/50 text-sm font-medium">Search anime...</span>
                    <span className="ml-auto text-white/30 text-xs hidden lg:block">Ctrl+S</span>
                </button>
            </div>
            <div className={styles.navright}>
                <Dropdown placement="bottom-end" classNames={{
                    base: "before:bg-default-200",
                    content: "py-1 px-1 border border-default-200 bg-gradient-to-br from-white to-default-200 dark:from-default-50 dark:to-black",
                }}>
                    <DropdownTrigger>
                        <Avatar
                            isBordered
                            isDisabled={status === 'loading'}
                            as="button"
                            className="transition-transform w-[36px] h-[36px] backdrop-blur-md bg-white/5 hover:scale-110"
                            color="secondary"
                            name={data?.user?.name}
                            size="sm"
                            src={data?.user?.image?.large || data?.user?.image?.medium || "https://i.pravatar.cc/150?u=a042581f4e29026704d"}
                        />
                    </DropdownTrigger>
                    {isLoggedIn ? (
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="info" className="h-14 gap-2">
                                <p className="font-semibold">Signed in as</p>
                                <p className="font-semibold">{data?.user?.name}</p>
                            </DropdownItem>
                            <DropdownItem key="profile" startContent={<ProfileIcon className={iconClasses} />}>
                            <Link href={`/user/profile`} className='w-full h-full block '>Profile</Link>
                                </DropdownItem>
                            <DropdownItem key="help_and_feedback" onPress={onOpen} startContent={<FeedbackIcon className={iconClasses} />}>Help & Feedback</DropdownItem>
                            <DropdownItem key="settings" startContent={<SettingsIcon className={iconClasses} />}>
                                <Link href={`/settings`} className='w-full h-full block '>Settings</Link>
                            </DropdownItem>
                            <DropdownItem key="logout" color="danger" startContent={<LogoutIcon className={iconClasses} />}>
                                <button className="font-semibold outline-none border-none w-full h-full block text-left" onClick={() => signOut('AniListProvider')}>Log Out</button>
                            </DropdownItem>
                        </DropdownMenu>
                    ) : (
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="notlogprofile" startContent={<LoginIcon className={iconClasses} />}>
                                <button className="font-semibold outline-none border-none w-full h-full block text-left" onClick={() => signIn('AniListProvider')}>Login With Anilist</button>
                            </DropdownItem>
                            <DropdownItem key="notloghelp_and_feedback" onPress={onOpen} startContent={<FeedbackIcon className={iconClasses} />}>Help & Feedback</DropdownItem>
                            <DropdownItem key="settings" startContent={<SettingsIcon className={iconClasses} />}>
                                <Link href={`/settings`} className='w-full h-full block '>Settings</Link>
                            </DropdownItem>
                        </DropdownMenu>
                    )}
                </Dropdown>
                <Feedbackform isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange} />
            </div>
        </motion.nav>
    )
}

export default Navbarcomponent
