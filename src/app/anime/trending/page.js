import React from 'react'
import Catalog from '@/components/catalogcomponent/Catalog'
import Navbarcomponent from '@/components/navbar/Navbar'

export const metadata = {
  title: "Airin - Trending Anime",
  description: "Discover the most trending anime right now on Airin.",
  openGraph: {
    title: "Airin - Trending Anime",
    description: "Discover the most trending anime right now on Airin.",
  },
  twitter: {
    card: "summary",
    title: "Airin - Trending Anime",
    description: "Discover the most trending anime right now on Airin.",
  },
}

export default function TrendingPage({ searchParams }) {
  // Force sortby to TRENDING_DESC
  const trendingSearchParams = { ...searchParams, sortby: 'TRENDING_DESC' };

  return (
    <div>
      <Navbarcomponent/>
        <div className='max-w-[94%] xl:max-w-[88%] mx-auto mt-[70px]'>
          <h1 className="text-3xl font-bold text-white mb-6 border-l-4 border-red-500 pl-3">Trending Anime</h1>
          <Catalog searchParams={trendingSearchParams} hideFilters={true}/>
        </div>
    </div>
  )
}
