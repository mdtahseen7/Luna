Animekai API Summary

This document summarizes key endpoints for the Animekai API, including examples and response schemas, based on the Kenjitsu documentation.

1. Home

Retrieves a collection of trending, completed, recently added, and recently updated anime.

Endpoint:

GET /api/animekai/home


Example:

/api/animekai/home


Response Schema:

{
 "data": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "releaseDate": "string",
   "synopsis": "string",
   "rating": "string",
   "quality": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ],
 "trending": {
  "now": [
   {
    "id": "string",
    "name": "string",
    "romaji": "string",
    "posterImage": "string",
    "type": "string",
    "episodes": { "sub": "number", "dub": "number" },
    "totalEpisodes": "number"
   }
  ],
  "daily": [
   {
    "id": "string",
    "name": "string",
    "romaji": "string",
    "posterImage": "string",
    "type": "string",
    "episodes": { "sub": "number", "dub": "number" },
    "totalEpisodes": "number"
   }
  ],
  "weekly": [
   {
    "id": "string",
    "name": "string",
    "romaji": "string",
    "posterImage": "string",
    "type": "string",
    "episodes": { "sub": "number", "dub": "number" },
    "totalEpisodes": "number"
   }
  ],
  "monthly": [
   {
    "id": "string",
    "name": "string",
    "romaji": "string",
    "posterImage": "string",
    "type": "string",
    "episodes": { "sub": "number", "dub": "number" },
    "totalEpisodes": "number"
   }
  ]
 },
 "recentlyCompleted": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ],
 "recentlyAdded": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ],
 "recentlyUpdated": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ]
}


2. Search Anime

Searches for anime based on a query string.

Endpoint:

GET /api/animekai/anime/search


Example (Query: 'bleach', Page: 1):

/api/animekai/anime/search?q=bleach&page=1


Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "totalResults": "number",
 "data": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ]
}


3. Recent Anime

Retrieve a list of recently completed, added, or updated anime.

Endpoint:

GET /api/animekai/anime/recent/:status


Example (Status: completed, Format: TV, Page: 1):

/api/animekai/anime/recent/completed?format=TV&page=1


Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "totalResults": "number",
 "data": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ]
}


4. Top Airing

Retrieve a list of top airing anime based on format.

Endpoint:

GET /api/animekai/anime/top-airing


Example (Format: TV, Page: 1):

/api/animekai/anime/top-airing?format=TV&page=1


Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "totalResults": "number",
 "data": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ]
}


5. Anime Information

Retrieves detailed information for a specific anime by its ID.

Endpoint:

GET /api/animekai/anime/:id


Example:

/api/animekai/anime/bleach-thousand-year-blood-war-the-consflict-zev9


Response Schema:

{
 "data": {
  "anilistId": "number",
  "malId": "number",
  "id": "string",
  "name": "string",
  "romaji": "string",
  "altnames": "string",
  "rating": "string",
  "posterImage": "string",
  "type": "string",
  "japanese": "string",
  "status": "string",
  "releaseDate": "string",
  "synopsis": "string",
  "score": "string",
  "genres": ["string"],
  "studios": ["string"],
  "producers": ["string"],
  "episodes": { "sub": "number", "dub": "number" },
  "totalEpisodes": "number"
 },
 "relatedSeasons": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "season": "string",
   "totalEpisodes": "number"
  }
 ],
 "recommendedAnime": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ],
 "relatedAnime": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ],
 "providerEpisodes": [
  {
   "episodeId": "string",
   "episodeNumber": "number",
   "hasDub": "boolean",
   "hasSub": "boolean",
   "title": "string"
  }
 ]
}


6. Episode Servers

Retrieves available streaming servers for a specific episode ID.

Endpoint:

GET /api/animekai/episode/:episodeId/servers


Example:

/api/animekai/episode/my-dress-up-darling-season-2-p8em-token-OtTy-KXluxvj0H0X1saU/servers


Response Schema:

{
 "data": {
  "sub": [
   { "severId": "string", "serverName": "string", "mediaId": "string" }
  ],
  "dub": [
   { "severId": "string", "serverName": "string", "mediaId": "string" }
  ],
  "raw": [
   { "severId": "string", "serverName": "string", "mediaId": "string" }
  ],
  "episodeNumber": "number"
 }
}


7. Embed Servers

Retrieve available embedable links for a specific episode.

Endpoint:

GET /api/animekai/episode/:episodeId/embed


Example (Version: sub, Server: server-1):

/api/animekai/episode/my-dress-up-darling-season-2-p8em-token-OtTy-KXluxvj0H0X1saU/embed?version=sub&server=server-1


Response Schema:

{
 "data": [
  {
   "url": "string",
   "intro": {
    "start": "number",
    "end": "number"
   },
   "outro": {
    "start": "number",
    "end": "number"
   }
  }
 ]
}


8. Watch Episode (Get Sources)

Retrieves streaming sources (like .m3u8 files) for a specific episode.

Endpoint:

GET /api/animekai/sources/:episodeId


Example (Version: sub, Server: server-1):

/api/animekai/sources/my-dress-up-darling-season-2-p8em-token-OtTy-KXluxvj0H0X1saU?version=sub&server=1


Response Schema:

{
 "headers": {
  "Referer": "string"
 },
 "data": {
  "intro": { "start": "number", "end": "number" },
  "outro": { "start": "number", "end": "number" },
  "subtitles": [
   {
    "file": "string",
    "label": "string",
    "kind": "string",
    "default": "boolean"
   },
   {
    "file": "string",
    "kind": "string"
   }
  ],
  "sources": [
   {
    "url": "string",
    "isM3u8": "boolean",
    "type": "string"
   }
  ]
 },
 "download": "string"
}


9. Category

Retrieve a list of anime by format.

Endpoint:

GET /api/animekai/anime/format/:format


Example (Format: TV, Page: 1):

/api/animekai/anime/format/TV?page=1


Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "totalResults": "number",
 "data": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type": "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ]
}


10. Genre

Retrieves a list of anime by a specific genre.

Endpoint:

GET /api/animekai/anime/genre/:genre


Example (Genre: action, Page: 1):

/api/animekai/anime/genre/action?page=1


Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "totalResults": "number",
 "data": [
  {
   "id": "string",
   "name": "string",
   "romaji": "string",
   "posterImage": "string",
   "type":F "string",
   "episodes": { "sub": "number", "dub": "number" },
   "totalEpisodes": "number"
  }
 ]
}
