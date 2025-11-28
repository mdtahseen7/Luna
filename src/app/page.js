"use server"
import Animecard from '@/components/CardComponent/Animecards'
import Herosection from '@/components/home/Herosection'
import Navbarcomponent from '@/components/navbar/Navbar'
import { TrendingAnilist, PopularAnilist, Top100Anilist, SeasonalAnilist, UpcomingAnilist, UserWatchingList, AiringSchedule } from '@/lib/Anilistfunctions'
import React from 'react'
import { MotionDiv } from '@/utils/MotionDiv'
import VerticalList from '@/components/home/VerticalList'
import ContinueWatching from '@/components/home/ContinueWatching'
import RecentEpisodes from '@/components/home/RecentEpisodes'
import UserWatchingListComponent from '@/components/home/UserWatchingList'
import UpcomingSchedule from '@/components/home/UpcomingSchedule'
import { getAuthSession } from './api/auth/[...nextauth]/route'
import { redis } from '@/lib/rediscache'
// import { getWatchHistory } from '@/lib/EpHistoryfunctions'

async function getHomePage() {
  try {
    let cachedData;
    if (redis) {
      cachedData = await redis.get(`homepage_v4`); // Changed key to force refresh without TV_SHORT
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (Object.keys(parsedData).length === 0) { // Check if data is an empty object
          await redis.del(`homepage_v4`);
          cachedData = null;
        }
      }
    }
    if (cachedData) {
      const { herodata, populardata, top100data, seasonaldata, upcomingdata, scheduledata } = JSON.parse(cachedData);
      return { herodata, populardata, top100data, seasonaldata, upcomingdata, scheduledata };
    } else {
      const [herodata, populardata, top100data, seasonaldata, upcomingdata, scheduledata] = await Promise.all([
        TrendingAnilist(),
        PopularAnilist(),
        Top100Anilist(),
        SeasonalAnilist(),
        UpcomingAnilist(),
        AiringSchedule()
      ]);
      const cacheTime = 60 * 60 * 2;
      if (redis) {
        await redis.set(`homepage_v4`, JSON.stringify({ herodata, populardata, top100data, seasonaldata, upcomingdata, scheduledata }), "EX", cacheTime);
      }
      return { herodata, populardata, top100data, seasonaldata, upcomingdata, scheduledata };
    }
  } catch (error) {
    console.error("Error fetching homepage from anilist: ", error);
    return null;
  }
}

async function Home() {
  const session = await getAuthSession();
  const { herodata = [], populardata = [], top100data = [], seasonaldata = [], upcomingdata = [], scheduledata = [] } = await getHomePage();
  
  // Fetch user's currently watching anime from AniList if logged in
  let userWatchingData = [];
  if (session?.user?.token) {
    // Pass null for userId to let AniList infer user from token
    // This avoids issues where session.user.id is the MongoDB ID instead of AniList ID
    userWatchingData = await UserWatchingList(session.user.token, null);
  }
  // const history = await getWatchHistory();
  // console.log(history)

  return (
    <div>
      <Navbarcomponent home={true} />
      <Herosection data={herodata} />
      <div className='sm:max-w-[97%] md:max-w-[95%] lg:max-w-[90%] xl:max-w-[85%] mx-auto flex flex-col md:gap-11 sm:gap-7 gap-5 mt-8'>
        {/* Currently Watching section */}
        {/* {session?.user && (
          <div>
            <ContinueWatching session={session} />
          </div>
        )} */}
        {session?.user && userWatchingData.length > 0 && (
          <div>
            <UserWatchingListComponent data={userWatchingData} />
          </div>
        )}
        <div
        >
          <RecentEpisodes cardid="Recent Episodes" />
        </div>
        <div
        >
          <Animecard data={herodata} cardid="Trending Now" />
        </div>
        <div
        >
          <Animecard data={upcomingdata} cardid="Upcoming" />
        </div>
        <div
        >
          <Animecard data={populardata} cardid="All Time Popular" />
        </div>
        <div className='mt-8'>
          <div className='lg:flex lg:flex-row justify-between lg:gap-20'>
            <UpcomingSchedule
              data={scheduledata}
              id="Upcoming Schedule"
              startIndex={0}
            />
          </div>
        </div>
        <div className='mt-8'
        >
          <div className='lg:flex lg:flex-row justify-between lg:gap-20'>
            <VerticalList data={top100data} mobiledata={seasonaldata} id="Top 100 Anime" />
            <VerticalList data={seasonaldata} id="Seasonal Anime" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
