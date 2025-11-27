HentaiTV API Documentation

Documentation for the HentaiTV API search and streaming endpoints.

Base URL: https://{your-api-domain}

Endpoints

1. Search Videos

Search for videos using a keyword.

Endpoint: /api/hen/hentaitv/search/:query/:page

Method: GET

Parameter

Type

Required

Description

query

string

Yes

Search term

page

integer

No

Page number (optional)

Response Schema:

{
  "status": "success",
  "data": {
    "provider": "hentaitv",
    "type": "search",
    "results": [
      {
        "title": "Reika wa Karei na Boku no Joou The Animation Episode 2",
        "id": "reika-wa-karei-na-boku-no-joou-the-animation-episode-2",
        "image": "[https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-2.jpg](https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-2.jpg)",
        "views": 183373
      },
      {
        "title": "Reika wa Karei na Boku no Joou The Animation Episode 1",
        "id": "reika-wa-karei-na-boku-no-joou-the-animation-episode-1",
        "image": "[https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-1.jpg](https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-1.jpg)",
        "views": 273214
      }
    ],
    "totalPages": 1,
    "currentPage": 1,
    "hasNextPage": false,
    "totalResults": 2
  }
}


2. Get Video Sources (Watch)

Get the streaming sources for a specific video by ID.

Endpoint: /api/hen/hentaitv/watch/:id

Method: GET

Parameter

Type

Required

Description

id

string

Yes

The Video ID (e.g., reika-wa-karei-na-boku-no-joou-the-animation-episode-2)

Response Schema:

{
  "status": "success",
  "data": {
    "results": {
      "id": "reika-wa-karei-na-boku-no-joou-the-animation-episode-2",
      "name": "Reika wa Karei na Boku no Joou The Animation Episode 2",
      "poster": "[https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-2.jpg](https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-2.jpg)",
      "sources": [
        {
          "src": "[https://nhplayer.com/v/9STh5AAxiA6aCp6/](https://nhplayer.com/v/9STh5AAxiA6aCp6/)",
          "format": "iframe"
        },
        {
          "src": "[https://r2.1hanime.com/reika-wa-karei-na-boku-no-joou-the-animation-2.mp4](https://r2.1hanime.com/reika-wa-karei-na-boku-no-joou-the-animation-2.mp4)",
          "format": "mp4"
        }
      ]
    }
  }
}


3. Get Trending Videos

Retrieve videos that are currently trending.

Endpoint: /api/hen/hentaitv/trending

Method: GET

Parameter

Type

Required

Description

None

-

-

-

Response Schema:

{
  "status": "success",
  "data": {
    "provider": "hentaitv",
    "type": "trending",
    "results": [
      {
        "title": "Reika wa Karei na Boku no Joou The Animation Episode 2",
        "id": "reika-wa-karei-na-boku-no-joou-the-animation-episode-2",
        "image": "[https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-2.jpg](https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-2.jpg)",
        "views": 183414
      },
      {
        "title": "Reika wa Karei na Boku no Joou The Animation Episode 1",
        "id": "reika-wa-karei-na-boku-no-joou-the-animation-episode-1",
        "image": "[https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-1.jpg](https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-1.jpg)",
        "views": 273276
      },
      {
        "title": "Choro Mesu Days Episode 1",
        "id": "choro-mesu-days-episode-1",
        "image": "[https://hentai.tv/wp-content/uploads/2025/11/Choro-Mesu-Days-Episode-1.jpg](https://hentai.tv/wp-content/uploads/2025/11/Choro-Mesu-Days-Episode-1.jpg)",
        "views": 299927
      }
    ]
  }
}


4. Get Recent Videos

Retrieve the most recently added videos.

Endpoint: /api/hen/hentaitv/recent

Method: GET

Parameter

Type

Required

Description

None

-

-

-

Response Schema:

{
  "status": "success",
  "data": {
    "provider": "hentaitv",
    "type": "recent",
    "results": [
      {
        "id": "reika-wa-karei-na-boku-no-joou-the-animation-episode-2",
        "title": "Reika wa Karei na Boku no Joou The Animation Episode 2",
        "image": "[https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-2.jpg](https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-2.jpg)",
        "views": "183,415"
      },
      {
        "id": "reika-wa-karei-na-boku-no-joou-the-animation-episode-1",
        "title": "Reika wa Karei na Boku no Joou The Animation Episode 1",
        "image": "[https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-1.jpg](https://hentai.tv/wp-content/uploads/2025/11/Reika-wa-Karei-na-Boku-no-Joou-The-Animation-Episode-1.jpg)",
        "views": "273,279"
      },
      {
        "id": "choro-mesu-days-episode-1",
        "title": "Choro Mesu Days Episode 1",
        "image": "[https://hentai.tv/wp-content/uploads/2025/11/Choro-Mesu-Days-Episode-1.jpg](https://hentai.tv/wp-content/uploads/2025/11/Choro-Mesu-Days-Episode-1.jpg)",
        "views": "299,929"
      }
    ]
  }
}