Kenjitsu Anilist API Summary

This document outlines the available endpoints, examples, and response schemas for the Kenjitsu Anilist API.

Search and Discovery

Search Anime

Endpoint: GET /api/anilist/anime/search

Description: Search for anime based on a query string.

Example: /api/anilist/anime/search?q=bleach&page=1&perPage=20

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "total": "number",
 "lastPage": "number",
 "perPage": "number",
 "data": [
 {
 "malId": "number",
 "anilistId": "number",
 "image": "string",
 "color": "string",
 "bannerImage": "string",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string"
 },
 "trailer": {
 "id": "string | null",
 "site": "string | null",
 "thumbnail": "string | null"
 },
 "format": "string",
 "status": "string",
 "duration": "number | null",
 "score": "number",
 "genres": ["string"],
 "episodes": "number | null",
 "synopsis": "string",
 "season": "string | null",
 "releaseDate": "string | null",
 "endDate": "string | null",
 "studio": "string | null",
 "producers": ["string"]
 }
 ]
}


Top Anime

Endpoint: GET /api/anilist/anime/top/:category

Description: Retrieve a list of top or popular anime based on category (airing, trending, upcoming, rating, popular).

Example: /api/anilist/anime/top/popular?format=TV&page=1&perPage=20

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "total": "number",
 "lastPage": "number",
 "perPage": "number",
 "data": [
 {
 "malId": "number",
 "anilistId": "number",
 "image": "string",
 "bannerImage": "string",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string"
 },
 "trailer": {
 "id": "string | null",
 "site": "string | null",
 "thumbnail": "string | null"
 },
 "format": "string",
 "status": "string",
 "duration": "number | null",
 "score": "number",
 "genres": ["string"],
 "episodes": "number | null",
 "synopsis": "string",
 "season": "string | null",
 "releaseDate": "string | null",
 "endDate": "string | null",
 "studio": "string | null",
 "producers": ["string"]
 }
 ]
}


Seasonal Anime

Endpoint: GET /api/anilist/seasons/:season/:year

Description: Retrieve anime for a specific season (SPRING, SUMMER, FALL, WINTER) and year.

Example: /api/anilist/seasons/WINTER/2020?format=TV&page=1&perPage=20

Response Schema:

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "total": "number",
 "lastPage": "number",
 "perPage": "number",
 "data": [
 {
 "malId": "number",
 "anilistId": "number",
 "image": "string",
 "bannerImage": "string",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string"
 },
 "trailer": {
 "id": "string | null",
 "site": "string | null",
 "thumbnail": "string | null"
 },
 "format": "string",
 "status": "string",
 "duration": "number | null",
 "score": "number",
 "genres": ["string"],
 "episodes": "number | null",
 "synopsis": "string",
 "season": "string | null",
 "releaseDate": "string | null",
 "endDate": "string | null",
 "studio": "string | null",
 "producers": ["string"]
 }
 ]
}


Anime Details

Anime Information

Endpoint: GET /api/anilist/anime/:id

Description: Retrieve detailed information about a specific anime using its Anilist ID.

Example: /api/anilist/anime/176496

Response Schema:

{
 "data": {
 "malId": "number",
 "anilistId": "number",
 "image": "string",
 "color": "string",
 "bannerImage": "string",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string"
 },
 "trailer": {
 "id": "string | null",
 "site": "string | null",
 "thumbnail": "string | null"
 },
 "format": "string",
 "status": "string",
 "duration": "number | null",
 "score": "number",
 "genres": ["string"],
 "episodes": "number | null",
 "synopsis": "string",
 "season": "string | null",
 "releaseDate": "string | null",
 "endDate": "string | null",
 "studio": "string | null",
 "producers": ["string"]
 }
}


Characters

Endpoint: GET /api/anilist/anime/:id/characters

Description: Retrieve the characters of a specific anime using its Anilist ID.

Example: /api/anilist/anime/176496/characters

Response Schema:

{
 "data": {
 "malId": "number",
 "anilistId": "number",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string"
 },
 "characters": [
 {
 "role": "string",
 "id": "number",
 "name": "string",
 "image": "string",
 "voiceActors": [
 {
 "name": "string",
 "language": "string",
 "image": "string"
 }
 ]
 }
 ]
 }
}


Related Anime

Endpoint: GET /api/anilist/anime/:id/related

Description: Retrieve related anime for a specific anime using its Anilist ID.

Example: /api/anilist/anime/269/related

Response Schema:

{
 "data": [
 {
 "anilistId": "number",
 "malId": "number",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string"
 },
 "type": "string",
 "score": "number",
 "image": "string",
 "bannerImage": "string",
 "color": "string"
 }
 ]
}


Airing Schedules

Media Airing Schedule

Endpoint: GET /api/anilist/schedule/:id

Description: Retrieve the airing schedule for a specific anime using its Anilist ID.

Example: /api/anilist/schedule/178090

Response Schema:

{
 "data": {
 "malId": "number",
 "anilistId": "number",
 "image": "string",
 "color": "string",
 "bannerImage": "string",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string | null"
 },
 "status": "string",
 "format": "string",
 "duration": "number",
 "releaseDate": "string",
 "endDate": "string",
 "nextAiringEpisode": {
 "episode": "number",
 "id": "number",
 "airingAt": "number",
 "timeUntilAiring": "number"
 }
 }
}


Provider Integration

Provider ID

Endpoint: GET /api/anilist/mappings/:id

Description: Retrieve the provider-specific ID and anime information using the Anilist ID. (Provider: allanime, hianime, animepahe, anizone)

Example: /api/anilist/mappings/269?provider=hianime

Response Schema:

{
 "data": {
 "malId": "number",
 "anilistId": "number",
"image": "string",
 "color": "string",
 "bannerImage": "string",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string"
 },
 "trailer": {
 "id": "string | null",
 "site": "string | null",
 "thumbnail": "string | null"
 },
 "format": "string",
 "status": "string",
 "duration": "number | null",
 "score": "number",
 "genres": ["string"],
 "episodes": "number | null",
 "synopsis": "string",
 "season": "string | null",
 "releaseDate": "string | null",
 "endDate": "string | null",
 "studio": "string | null",
 "producers": ["string"],
 "provider": {
 "id": "string",
 "name": "string",
 "romaji": "string",
 "provider": "string",
 "score": "number | null"
 }
 }
}


Provider Episodes

Endpoint: GET /api/anilist/episodes/:id

Description: Retrieve provider-specific episodes and anime information using the Anilist ID. (Provider: allanime, hianime, animepahe, anizone)

Example: /api/anilist/episodes/269?provider=allanime

Response Schema:

{
 "data": {
 "malId": "number",
 "anilistId": "number",
 "image": "string",
 "color": "string",
 "bannerImage": "string",
 "title": {
 "romaji": "string",
 "english": "string | null",
 "native": "string"
 },
 "trailer": {
 "id": "string | null",
 "site": "string | null",
 "thumbnail": "string | null"
 },
 "format": "string",


Example     "status": "string",
"duration": "number | null",
"score": "number",
"genres": ["string"],
"episodes": "number | null",
"synopsis": "string",
"season": "string | null",
"releaseDate": "string | null",
"endDate": "string | null",
"studio": "string | null",
"producers": ["string"]
},
"providerEpisodes": [
{
"episodeId": "string",
"episodeNumber": "number",
"title": "string",
Example     "rating": "number | null",
"aired": "string",
"overview": "string",
"thumbnail": "string",
"provider": "string"
}
]
}
```

Streaming

Watch Episode

Endpoint: GET /api/anilist/sources/:episodeId

Description: Retrieve streaming sources for a specific anime episode. The episodeId must come from the /api/anilist/episodes/:anilistId endpoint.

Example: /api/anilist/sources/allanime-uP4dqHNypYeYtTnzP-episode-1?version=sub

Response Schema:

{
 "headers": {
 "Referer": "string"
 },
 "data": {
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
 "type": "string",
 "quality": "string"
 }
 ]
 }
}
