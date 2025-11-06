Kaido Anime API Documentation

This document outlines the available endpoints for the Kaido API, including descriptions, example usage, and response schemas.

Search and Discovery

Home

Endpoint: GET /api/kaido/home

Description: Retrieve a collection of trending, top, airing, completed, recently added, and popular anime.

Example: /api/kaido/home

Response Schema:

{
 "data": [
 {
 "spotlight": "string",
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "duration": "string",
 "releaseDate": "string",
 "quality": "string",
 "synopsis": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "trending": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string"
 }
 ],
 "topAiring": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "type": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "mostPopular": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "type": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "favourites": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "type": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "recentlyCompleted": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "type": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "recentlyUpdated": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "duration": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "recentlyAdded": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "duration": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "topAnime": {
 "daily": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "weekly": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "monthly": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ]
 },
 "topUpcoming": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "duration": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ]
}


Search Anime

Endpoint: GET /api/kaido/anime/search

Description: Search for anime based on a query string.

Query Parameters:

q (string, required): The search query for the anime title. Default: ''.

page (number, optional): The page number of results to return. Default: 1.

Example: /api/kaido/anime/search?q=bleach&page=1

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "data": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "type": "string",
 "duration": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ]
}


Search Suggestions

Endpoint: GET /api/kaido/anime/suggestions

Description: Retrieve search suggestions based on a query string.

Query Parameters:

q (string, required): The search query for suggestions. Default: ''.

Example: /api/kaido/anime/suggestions?q=one%20piece

Response Schema:

{
 "data": [
 {
 "id": "string",
 "name": "string",
 "posterImage": "string",
 "url": "string",
 "type": "string",
 "rating": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ]
}


Anime Lists

Endpoint: GET /api/kaido/anime/category/:category

Description: Retrieve a list of anime filtered by categories such as subbed, dubbed, favorites, popularity, or airing status.

Path Parameters:

category (string, required): Category: subbed, dubbed, favourites, popular, airing.

Query Parameters:

page (number, optional): The page number of results to return. Default: 1.

Example: /api/kaido/anime/category/airing?page=1

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "data": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "duration": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ]
}


Recent Anime

Endpoint: GET /api/kaido/anime/recent/:status

Description: Retrieve a list of recently completed, added, or updated anime.

Path Parameters:

status (string, required): Status: completed, added, updated.

Query Parameters:

page (number, optional): The page number of results to return. Default: 1.

Example: /api/kaido/anime/recent/completed?page=1

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "data": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "duration": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ]
}


Anime Details

Anime Information

Endpoint: GET /api/kaido/anime/:id

Description: Retrieve detailed information about a specific anime, including provider episodes. The id is obtained from search results or provider mappings.

Path Parameters:

id (string, required): The unique identifier of the anime.

Example: /api/kaido/anime/bleach-thousand-year-blood-war-the-conflict-19322

Response Schema:

{
 "data": {
 "id": "string",
 "name": "string",
 "japanese": "string",
 "romaji": "string",
 "quality": "string",
 "rating": "string",
 "producers": "string",
 "altnames": "string",
 "releaseDate": "string",
 "status": "string",
 "score": "string",
 "anilistId": "number",
 "malId": "number",
 "posterImage": "string",
 "genres": ["string"],
 "studios": ["string"],
 "synopsis": "string",
 "episodes": {
 "dub": "number",
 "sub": "number"
 },
 "totalEpisodes": "number",
 "type": "string",
 "duration": "string"
 },
 "providerEpisodes": [
 {
 "episodeId": "string",
 "title": "string",
 "romaji": "string",
 "episodeNumber": "number"
 }
 ],
 "characters": [
 {
 "id": "string",
 "name": "string",
 "posterImage": "string",
 "role": "string",
 "voiceActor": {
 "id": "string",
 "name": "string",
 "posterImage": "string",
 "language": "string"
 }
 }
 ],
 "recommendedAnime": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "duration": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "relatedAnime": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "mostPopular": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "type": "string",
 "posterImage": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ],
 "relatedSeasons": [
 {
 "id": "string",
 "name": "string",
 "season": "string",
 "seasonPoster": "string"
 }
 ],
 "promotionVideos": [
 {
 "url": "string",
 "title": "string",
 "thumbnail": "string"
 }
 ]
}


Episode and Streaming

Episodes

Endpoint: GET /api/kaido/anime/:id/episodes

Description: Retrieve a list of episodes for a specific anime. The id is obtained from search results or provider mappings.

Path Parameters:

id (string, required): The unique identifier of the anime.

Example: /api/kaido/anime/bleach-thousand-year-blood-war-the-conflict-19322/episodes

Response Schema:

{
 "data": [
 {
 "episodeId": "string",
 "title": "string",
 "romaji": "string",
 "episodeNumber": "number"
 }
 ]
}


Episode Servers

Endpoint: GET /api/kaido/episode/:episodeId/servers

Description: Retrieve available streaming servers for a specific episode. The episodeId is obtained from the episodes endpoint.

Path Parameters:

episodeId (string, required): The unique identifier of the episode.

Example: /api/kaido/episode/solo-leveling-18718-episode-119497/servers

Response Schema:

{
 "data": {
 "sub": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
 "dub": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
 "raw": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
 "episodeNumber": "number"
 }
}


Watch Episode

Endpoint: GET /api/kaido/sources/:episodeId

Description: Retrieve streaming sources for a specific anime episode. The episodeId is obtained from the episodes endpoint.

Path Parameters:

episodeId (string, required): The unique identifier of the episode.

Query Parameters:

version (string, optional): Language preference: sub, dub, raw. Default: sub.

server (string, optional): Streaming server: vidstreaming, vidcloud. Default: vidcloud.

Example: /api/kaido/sources/solo-leveling-18718-episode-119497?version=sub&server=vidcloud

Response Schema:

{
 "headers": {
 "Referer": "string"
 },
 "data": {
 "intro": {
 "start": "number",
 "end": "number"
 },
 "outro": {
 "start": "number",
 "end": "number"
 },
 "subtitles": [
 {
 "file": "string",
 "label": "string",
 "kind": "string",
 "default": "boolean"
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
 "syncData": {
 "anilistId": "number",
 "malId": "number",
 "name": "string"
 }
}


Categorized Lists

A-Z List

Endpoint: GET /api/kaido/anime/az-list/:sort

Description: Retrieve an alphabetical list of anime based on a starting character.

Path Parameters:

sort (string, required): The character to sort by (e.g., A, B, C).

Query Parameters:

page (number, optional): The page number of results to return. Default: 1.

Example: /api/kaido/anime/az-list/A?page=1

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "data": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "type": "string",
 "duration": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ]
}


Genre

Endpoint: GET /api/kaido/anime/genre/:genre

Description: Retrieve a list of anime by a specific genre.

Path Parameters:

genre (string, required): The genre of anime to retrieve.

Query Parameters:

page (number, optional): The page number of results to return. Default: `1".

Example: /api/kaido/anime/genre/action?page=1

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "data": [
 {
 "id": "string",
 "name": "string",


Two-Up: "romaji": "string",
"posterImage": "string",
"type": "string",
"duration": "string",
"episodes": {
"sub": "number",
"dub": "number"
},
"totalEpisodes": "number"
}
]
}
```

Category

Endpoint: GET /api/kaido/anime/format/:format

Description: Retrieve a list of anime by format.

Path Parameters:

format (string, required): Anime format: TV, MOVIE, SPECIALS, OVA, ONA.

Query Parameters:

page (number, optional): The page number of results to return. Default: 1.

Example: /api/kaido/anime/format/TV?page=1

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "lastPage": "number",
 "data": [
 {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "posterImage": "string",
 "type": "string",
 "duration": "string",
 "episodes": {
 "sub": "number",
 "dub": "number"
 },
 "totalEpisodes": "number"
 }
 ]
}
