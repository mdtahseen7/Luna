export async function CombineEpisodeMeta(episodeData, imageData) {
  if (!imageData || imageData.length === 0) {
    console.log('[CombineEpisodeMeta] No image data available');
    return episodeData;
  }

  const episodeImages = {};

  // Build a map of episode numbers to their metadata
  imageData.forEach((image) => {
    const episodeNum = image.number || image.episode;
    if (episodeNum) {
      episodeImages[episodeNum] = image;
    }
  });

  console.log(`[CombineEpisodeMeta] Processing ${imageData.length} metadata entries`);
  console.log(`[CombineEpisodeMeta] Episode range in metadata: ${Math.min(...Object.keys(episodeImages).map(Number))}-${Math.max(...Object.keys(episodeImages).map(Number))}`);

  let totalProcessed = 0;
  let totalMatched = 0;

  for (const providerEpisodes of episodeData) {
    const episodesArray = Array.isArray(providerEpisodes.episodes)
      ? providerEpisodes.episodes
      : [...(providerEpisodes.episodes.sub || []), ...(providerEpisodes.episodes.dub || [])];

    console.log(`[CombineEpisodeMeta] Processing ${episodesArray.length} episodes for provider: ${providerEpisodes.providerId}`);

    for (const episode of episodesArray) {
      totalProcessed++;
      const episodeNum = episode.number;
      
      if (episodeImages[episodeNum]) {
        totalMatched++;
        const img = episodeImages[episodeNum].img || episodeImages[episodeNum].image;
        let title;
        
        if (typeof episodeImages[episodeNum]?.title === 'object') {
          const en = episodeImages[episodeNum]?.title?.en;
          const xJat = episodeImages[episodeNum]?.title?.['x-jat'];
          title = en || xJat || `EPISODE ${episodeNum}`;
        } else {
          title = episodeImages[episodeNum]?.title || '';
        }

        const description = episodeImages[episodeNum].description || episodeImages[episodeNum].overview || episodeImages[episodeNum].summary;
        Object.assign(episode, { img, title, description });
      }
    }
  }

  console.log(`[CombineEpisodeMeta] Matched ${totalMatched}/${totalProcessed} episodes with metadata`);
  return episodeData;
}

export function ProvidersMap(episodeData, defaultProvider = null, setDefaultProvider = () => { }) {
  let suboptions = [];
  let dubLength = 0;

  if (!defaultProvider) {
    // Set first available provider as default
    setDefaultProvider(episodeData[0]?.providerId);
  }
  
  // For AnimePahe and Kaido, default to 'sub'
  // Future: detect dub support from provider data
  suboptions.push('sub');
  
  return { suboptions, dubLength };
}