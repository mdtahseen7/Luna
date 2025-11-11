HiAnime API Documentation

Here is a complete list of all endpoints, examples, and their corresponding response schemas as detailed in the documentation.

1. Home

Endpoint

GET /api/hianime/home


Example

/api/hianime/home


📄 Response Schema

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


2. Search Anime

Endpoint

GET /api/hianime/anime/search


Example

/api/hianime/anime/search?q=bleach&page=1


📄 Response Schema

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


3. Search Suggestions

Endpoint

GET /api/hianime/anime/suggestions


Example

/api/hianime/anime/suggestions?q=one%20piece


📄 Response Schema

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


4. Anime Lists

Endpoint

GET /api/hianime/anime/category/:category


Example

/api/hianime/anime/category/airing?page=1


📄 Response Schema

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


5. Recent Anime

Endpoint

GET /api/hianime/anime/recent/:status


Example

/api/hianime/anime/recent/completed?page=1


📄 Response Schema

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


6. Anime Information

Endpoint

GET /api/hianime/anime/:id


Example

/api/hianime/anime/bleach-thousand-year-blood-war-the-conflict-19322


📄 Response Schema

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


7. Episodes

Endpoint

GET /api/hianime/anime/:id/episodes


Example

/api/hianime/anime/bleach-thousand-year-blood-war-the-conflict-19322/episodes


📄 Response Schema

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


8. Episode Servers

Endpoint

GET /api/hianime/episode/:episodeId/servers


Example

/api/hianime/episode/solo-leveling-18718-episode-119497/servers


📄 Response Schema

{
 "data": {
 "sub": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
 "dub": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
 "raw": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
 "episodeNumber": "number"
 }
}


9. Watch Episode

Endpoint

GET /api/hianime/sources/:episodeId


Example

/api/hianime/sources/solo-leveling-18718-episode-119497?version=sub&server=hd-2


📄 Response Schema

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


10. A-Z List

Endpoint

GET /api/hianime/anime/az-list/:sort


Example

/api/hianime/anime/az-list/A?page=1


📄 Response Schema

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


11. Genre

Endpoint

GET /api/hianime/anime/genre/:genre


Example

/api/hianime/anime/genre/action?page=1


📄 Response Schema

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


12. Category (Format)

Endpoint

GET /api/hianime/anime/format/:format


Example

/api/hianime/anime/format/TV?page=1


📄 Response Schema

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
