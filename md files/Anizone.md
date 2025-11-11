Here is a detailed list of all the endpoints, examples, and response schemas found in the Anizone API documentation.

1. Search Anime

This endpoint searches for anime based on a query string.

Endpoint:

GET /api/anizone/anime/search


Example (Query):

/api/anizone/anime/search?q=bleach


Response Schema:

{
 "data": [
   {
     "id": "string",
     "name": "string",
     "type": "string",
     "releaseDate": "string",
     "posterImage": "string",
     "genres": ["string"],
     "status": "string",
     "totalEpisodes": "number"
   }
 ]
}


2. Recent Updates

This endpoint retrieves data on recently aired episodes and newly added anime.

Endpoint:

GET /api/anizone/anime/recent


Example:

/api/anizone/anime/recent


Response Schema:

{
 "data": [
   {
     "episodeId": "string",
     "episodeNumber": "number",
     "title": "string",
     "thumbnail": "string",
     "teaser": "string",
     "airDate": "string"
   }
 ],
 "recentlyAdded": [
   {
     "id": "string",
     "name": "string",
     "posterImage": "string"
   }
 ]
}


3. Anime Information

This endpoint retrieves detailed information about a specific anime, including its episodes.

Endpoint:

GET /api/anizone/anime/:id


Example (Path Parameter):

/api/anizone/anime/bleach-sennen-kessen-hen-soukoku-tan-gwna8xmk


Response Schema:

{
 "data": {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "type": "string",
   "status": "string",
   "posterImage": "string",
   "coverImage": "string",
   "totalEpisodes": "number",
   "releaseDate": "number",
   "synopsis": "string",
   "genres": ["string"]
 },
 "providerEpisodes": [
   {
     "episodeId": "string",
     "thumbnail": "string",
     "teaser": "string",
     "title": "string",
     "description": "string",
     "airDate": "string"
   }
 ]
}


4. Watch Episode (Get Sources)

This endpoint retrieves streaming sources for a specific anime episode.

Endpoint:

GET /api/anizone/sources/:episodeId


Example (Path Parameter):

/api/anizone/sources/bleach-sennen-kessen-hen-soukoku-tan-gwna8xmk-episode-1


Response Schema:

{
 "headers": {
   "Referer": "string"
 },
 "data": {
   "subtitles": [
     {
       "url": "string",
       "lang": "string",
       "default": "boolean"
     }
   ],
   "sources": [
     {
       "url": "string",
       "isM3u8": "boolean",
       "type": "string"
     }
   ],
   "tracks": [
     {
       "url": "string",
       "type": "string"
     }
   ],
   "posterImage": "string"
 }
}
