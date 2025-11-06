Animepahe

Overview

Search and Discovery: Search for anime and retrieve recently updated episodes.

Anime Details: Fetch detailed information about specific anime, including episode data.

Episode and Streaming: Access episode lists, streaming servers, and sources for specific anime episodes.

Search and Discovery

Search Anime

Endpoint

GET /api/animepahe/anime/search



Description

Search for anime based on a query string.

Query Parameters

Parameter

Type

Description

Required?

Default

q

string

The search query for the anime title (max: 1000 characters).

Yes

''

Example

/api/animepahe/anime/search?q=bleach



📄 Response Schema

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "perPage": "number",
 "totalResults": "number",
 "lastPage": "number",
 "data": [
  {
   "id": "string",
   "name": "string",
   "type": "string",
   "posterImage": "string",
   "totalEpisodes": "number"
  }
 ]
}



Recent Updates

Endpoint

GET /api/animepahe/episodes/recent



Description

Retrieve data on recently aired or added episodes.

Query Parameters

Parameter

Type

Description

Required?

Default

page

number

The page number of results to return.

No

1

Example

/api/animepahe/episodes/recent?page=1



📄 Response Schema

{
 "hasNextPage": "boolean",
 "currentPage": "number",
 "perPage": "number",
 "totalResults": "number",
 "lastPage": "number",
 "data": [
  {
   "episodeId": "string",
   "title": "string",
   "thumbnail": "string",
   "episodeNumber": "number"
  }
 ]
}



Anime Details

Anime Information

Endpoint

GET /api/animepahe/anime/:id



Description

Retrieve detailed information about a specific anime, including provider episodes. The id is obtained from search results or provider mappings.

Path Parameters

Parameter

Type

Description

Required?

id

string

The unique identifier of the anime.

Yes

Example

/api/animepahe/anime/d73ac2e4-cf2f-b467-ad0e-947e647701e3



📄 Response Schema

{
 "data": {
  "anilistId": "number",
  "malId": "number",
  "id": "string",
  "name": "string",
  "romaji": "string",
  "posterImage": "string",
  "altnames": "string | null",
  "japanese": "string | null",
  "type": "string",
  "status": "string",
  "releaseDate": "string",
  "studios": "string | null",
  "synopsis": "string",
  "score": "number | null",
  "producers": "string | null",
  "episodes": {
   "sub": "number | null",
   "dub": "number | null"
  },
  "totalEpisodes": "number",
  "duration": "string",
  "genres": ["string"]
 },
 "providerEpisodes": [
  {
   "episodeId": "string",
   "title": "string",
   "thumbnail": "string",
   "episodeNumber": "number"
  }
 ]
}



Episode and Streaming

Episodes

Endpoint

GET /api/animepahe/anime/:id/episodes



Description

Retrieve a list of episodes for a specific anime. The id is obtained from search results or provider mappings.

Path Parameters

Parameter

Type

Description

Required?

id

string

The unique identifier of the anime.

Yes

Example

/api/animepahe/anime/d73ac2e4-cf2f-b467-ad0e-947e647701e3/episodes



Read Me

📄 Response Schema

{
 "data": [
  {
   "episodeId": "string",
   "title": "string",
   "thumbnail": "string",
   "episodeNumber": "number"
  }
 ]
}



Episode Servers

Endpoint

GET /api/animepahe/episode/:episodeId/servers



Description

Retrieve available streaming servers for a specific episode. The episodeId is obtained from the episodes endpoint.

Path Parameters

Parameter

Type

Description

Required?

episodeId

string

The unique identifier of the episode.

Yes

Example

/api/animepahe/episode/pahe-d73ac2e4-cf2f-b467-ad0e-947e647701e3-$session$-be9a662fe586baa7ece799673df739b723b2437f8dd38c581465a11d15b3ecae/servers



📄 Response Schema

{
    "data": {
        "sub": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
        "dub": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
        "raw": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
        "episodeNumber": "number"
    },
    "download": {
        "sub": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
        "dub": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
        "raw": [{ "severId": "number", "serverName": "string", "mediaId": "string" }],
        "episodeNumber": "number"
    }
}


Watch Episode

Endpoint

GET /api/animepahe/sources/:episodeId


Description

Retrieve streaming sources for a specific anime episode. The episodeId is obtained from the episodes endpoint.

Path Parameters

Parameter

Type

Description

Required?

episodeId

string

The unique identifier of the episode.

Yes

Query Parameters

Parameter

Type

Description

Required?

Default

version

string

Language preference: sub, dub, raw

No

sub

Example

/api/animepahe/sources/pahe-d73ac2e4-cf2f-b467-ad0e-947e647701e3-$session$-be9a662fe586baa7ece799673df739b723b2437f8dd38c581465a11d15b3ecae?version=sub


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
    "type": "string",
    "isM3u8": "boolean",
    "quality": "string"
   }
  ],
  "download": "string"
 }
}
