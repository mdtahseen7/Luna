import { getSchedule } from "@/lib/Anilistfunctions";
export const dynamic = 'force-dynamic';
import Link from "next/link";
import Image from "next/image";
import Navbarcomponent from "@/components/navbar/Navbar";

const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
  };
};

const formatDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const options = { weekday: 'long', month: 'numeric', day: 'numeric', year: 'numeric' };
  const dateString = target.toLocaleDateString('en-US', options); // e.g., "Thursday, 12/11/2025"
  
  // Custom formatting to match "Thursday (12/11/2025)"
  const dayName = target.toLocaleDateString('en-US', { weekday: 'long' });
  const datePart = target.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

  if (diffDays === 0) return `Today (${datePart})`;
  if (diffDays === 1) return `Tomorrow (${datePart})`;
  
  return `${dayName} (${datePart})`;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default async function SchedulePage() {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }

  const schedules = await Promise.all(
    days.map(async (day) => {
      const { start, end } = getDayBounds(day);
      const data = await getSchedule(1, 50, start, end);
      
      // Filter out TV_SHORT
      const filteredData = data.filter(item => item.media.format !== 'TV_SHORT');
      
      // Sort by time
      filteredData.sort((a, b) => a.airingAt - b.airingAt);
      return { date: day, data: filteredData };
    })
  );

  return (
    <>
      <Navbarcomponent />
      <div className="min-h-screen w-full px-4 md:px-10 py-8 mt-16">
        {schedules.map(({ date, data }, index) => (
          data.length > 0 && (
            <div key={index} className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-500 pl-3">
                {formatDate(date)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item) => (
                  <ScheduleCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </>
  );
}

function ScheduleCard({ item }) {
  const { media, episode, airingAt } = item;
  
  return (
    <Link href={`/anime/info/${media.id}`} className="block group">
      <div className="bg-black rounded-lg overflow-hidden flex h-[180px] hover:bg-[#111] transition-colors border border-white/10 hover:border-white/20">
        <div className="relative w-[130px] flex-shrink-0 h-full">
          <Image
            src={media.coverImage.extraLarge || media.coverImage.large}
            alt={media.title.english || media.title.romaji}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="p-4 flex flex-col flex-grow min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5"></div>
            <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
              {media.title.english || media.title.romaji}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-3 font-medium">
            <div className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
              Ep {episode}
            </div>
            <span className="bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {formatTime(airingAt)}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">{media.format || 'TV'}</span>
          </div>
          
          <div className="text-xs text-gray-400 line-clamp-3 leading-relaxed" 
               dangerouslySetInnerHTML={{ __html: media.description || 'No description available.' }} 
          />
        </div>
      </div>
    </Link>
  );
}
