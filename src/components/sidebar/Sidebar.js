"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Usernotifications } from '@/lib/AnilistUser';
import styles from '../../styles/Sidebar.module.css';
import { 
  HomeIcon, 
  GridIcon, 
  ScheduleIcon, 
  SettingsIcon,
  SpotlightIcon,
  NotificationIcon,
  TrendingIcon
} from '@/lib/SvgIcons';

export default function Sidebar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState(null);
  const { data, status } = useSession();
  const [todayNotifications, setTodayNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (status === 'authenticated' && data?.user?.token) {
          const response = await Usernotifications(data.user.token, 1);
          const notify = response?.notifications?.filter(item => Object.keys(item).length > 0);
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

  const mainNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      href: '/',
      showOnMobile: true,
    },
    {
      id: 'catalog',
      label: 'Catalog',
      icon: GridIcon,
      href: '/anime/catalog',
      showOnMobile: true,
    },
    {
      id: 'popular',
      label: 'Trending',
      icon: TrendingIcon,
      href: '/anime/trending',
      showOnMobile: false,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: ScheduleIcon,
      href: '/anime/schedule',
      showOnMobile: true,
    },
    {
      id: 'settings-mobile',
      label: 'Settings',
      icon: SettingsIcon,
      href: '/settings',
      showOnMobile: true,
      mobileOnly: true,
    },
  ];

  const bottomNavItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: NotificationIcon,
      href: '/user/notifications',
      showOnMobile: false,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      href: '/settings',
      showOnMobile: true,
    },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navMain}>
        <ul className={styles.navList}>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li 
                key={item.id} 
                className={`${styles.navItem} ${item.showOnMobile === false ? styles.hideOnMobile : ''} ${item.mobileOnly ? styles.mobileOnly : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link 
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.active : ''}`}
                  title={item.label}
                >
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                  </div>
                  <span className={`${styles.tooltip} ${hoveredItem === item.id ? styles.tooltipVisible : ''}`}>
                    {item.label}
                  </span>
                  <span className={styles.mobileLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <nav className={styles.navBottom}>
        <ul className={styles.navList}>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li 
                key={item.id} 
                className={`${styles.navItem} ${item.showOnMobile === false ? styles.hideOnMobile : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link 
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.active : ''}`}
                  title={item.label}
                >
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                    {item.id === 'notifications' && todayNotifications.length > 0 && !active && (
                      <span className={styles.notificationBadge}>
                        {todayNotifications.length > 9 ? '9+' : todayNotifications.length}
                      </span>
                    )}
                  </div>
                  <span className={`${styles.tooltip} ${hoveredItem === item.id ? styles.tooltipVisible : ''}`}>
                    {item.label}
                  </span>
                  <span className={styles.mobileLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
