export async function CombineEpisodeMeta(episodeData, imageData) {
  const episodeImages = {};

  imageData.forEach((image) => {
    episodeImages[image.number || image.episode] = image;
  });

  for (const providerEpisodes of episodeData) {
    const episodesArray = Array.isArray(providerEpisodes.episodes)
      ? providerEpisodes.episodes
      : [...(providerEpisodes.episodes.sub || []), ...(providerEpisodes.episodes.dub || [])];

    for (const episode of episodesArray) {
      const episodeNum = episode.number;
      if (episodeImages[episodeNum]) {
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