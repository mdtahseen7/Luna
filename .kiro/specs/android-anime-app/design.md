


## Data Models

### Core Domain Models

```kotlin
// Anime Models
data class Anime(
    val id: Int,
    val malId: Int?,
    val title: AnimeTitle,
    val coverImage: CoverImage,
    val bannerImage: String?,
    val format: String?,
    val status: String?,
    val episodes: Int?,
    val genres: List<String>,
    val averageScore: Int?,
    val season: String?,
    val seasonYear: Int?,
    val duration: Int?,
    val description: String?,
    val studios: List<Studio>,
    val nextAiringEpisode: NextAiringEpisode?
)

data class AnimeTitle(
    val romaji: String,
    val english: String?,
    val native: String?
)

data class CoverImage(
    val large: String,
    val extraLarge: String?
)

data class AnimeDetails(
    val anime: Anime,
    val characters: List<Character>,
    val relations: List<AnimeRelation>,
    val recommendations: List<Anime>,
    val trailer: Trailer?
)

// Episode Models
data class Episode(
    val id: String,
    val number: Int,
    val title: String?,
    val image: String?,
    val description: String?,
    val animeSession: String? = null  // For AnimePahe
)

data class EpisodeSources(
    val sources: List<VideoSource>,
    val subtitles: List<SubtitleTrack>,
    val skipTimes: SkipTimes?,
    val headers: Map<String, String>?
)

data class VideoSource(
    val url: String,
    val quality: String,
    val type: SourceType  // HLS, MP4, IFRAME
)

data class SubtitleTrack(
    val url: String,
    val label: String,
    val language: String,
    val isDefault: Boolean
)

data class SkipTimes(
    val opening: TimeRange?,
    val ending: TimeRange?
)

data class TimeRange(
    val start: Long,
    val end: Long
)

// User Models
data class User(
    val id: Int,
    val name: String,
    val avatar: String?,
    val bannerImage: String?,
    val createdAt: Long
)

data class AuthToken(
    val accessToken: String,
    val expiresAt: Long
)

data class UserLists(
    val watching: List<MediaListEntry>,
    val completed: List<MediaListEntry>,
    val planning: List<MediaListEntry>,
    val dropped: List<MediaListEntry>,
    val paused: List<MediaListEntry>
)

// Watch History Models
data class WatchProgress(
    val animeId: Int,
    val episodeNum: Int,
    val position: Long,
    val duration: Long,
    val provider: String,
    val subType: String,
    val updatedAt: Long
)

data class ContinueWatchingItem(
    val animeId: Int,
    val animeTitle: String,
    val coverImage: String,
    val episodeNum: Int,
    val episodeTitle: String?,
    val progress: Float,  // 0.0 to 1.0
    val provider: String,
    val subType: String
)

// Settings Model
data class AppSettings(
    val heroTrailer: Boolean = true,
    val autoSkip: Boolean = false,
    val autoPlay: Boolean = false,
    val autoNext: Boolean = true,
    val muteAudio: Boolean = false,
    val videoLoadMode: VideoLoadMode = VideoLoadMode.IDLE,
    val titleLanguage: TitleLanguage = TitleLanguage.ROMAJI
)

enum class VideoLoadMode { IDLE, VISIBLE, EAGER }
enum class TitleLanguage { ROMAJI, ENGLISH, NATIVE }
enum class Provider { KAIDO, HIANIME, ANIMEPAHE, MEGAPLAY }
enum class SubType { SUB, DUB }
enum class SourceType { HLS, MP4, IFRAME }
```

### API Response Models

```kotlin
// AniList GraphQL Response Models
@Serializable
data class AniListResponse<T>(
    val data: T?,
    val errors: List<AniListError>?
)

@Serializable
data class AniListError(
    val message: String,
    val status: Int?
)

// Provider API Response Models
@Serializable
data class KaidoEpisodesResponse(
    val data: List<KaidoEpisode>
)

@Serializable
data class KaidoSourcesResponse(
    val data: KaidoSourceData
)

@Serializable
data class KaidoSourceData(
    val sources: List<KaidoSource>,
    val subtitles: List<KaidoSubtitle>?,
    val intro: KaidoSkipTime?,
    val outro: KaidoSkipTime?
)
```


## API Integration

### AniList GraphQL Queries

The app will use the same GraphQL queries as the web app:

```kotlin
// AniList API Service
interface AniListApi {
    @POST(".")
    suspend fun query(@Body request: GraphQLRequest): AniListResponse<JsonObject>
}

// GraphQL Queries (same as web app)
object AniListQueries {
    val TRENDING = """
        query(${'$'}page: Int, ${'$'}perPage: Int) {
            Page(page: ${'$'}page, perPage: ${'$'}perPage) {
                media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
                    id malId title { romaji english native }
                    coverImage { large extraLarge } bannerImage
                    format status episodes genres averageScore
                    season seasonYear duration description
                    studios { nodes { name } }
                    nextAiringEpisode { episode airingAt timeUntilAiring }
                }
            }
        }
    """.trimIndent()
    
    val ANIME_INFO = """
        query(${'$'}id: Int) {
            Media(id: ${'$'}id, type: ANIME) {
                id malId title { romaji english native }
                coverImage { large extraLarge } bannerImage
                format status episodes genres averageScore
                season seasonYear duration description
                studios { nodes { name } }
                nextAiringEpisode { episode airingAt timeUntilAiring }
                characters { edges { node { id name { full } image { large } } role } }
                relations { edges { node { id title { romaji english } coverImage { large } } relationType } }
                recommendations { nodes { mediaRecommendation { id title { romaji english } coverImage { large } } } }
                trailer { id site }
            }
        }
    """.trimIndent()
    
    val ADVANCED_SEARCH = """
        query(${'$'}search: String, ${'$'}type: MediaType, ${'$'}seasonYear: Int, 
              ${'$'}season: MediaSeason, ${'$'}format: MediaFormat, ${'$'}sort: [MediaSort],
              ${'$'}genres: [String], ${'$'}page: Int) {
            Page(page: ${'$'}page, perPage: 20) {
                pageInfo { hasNextPage currentPage }
                media(search: ${'$'}search, type: ${'$'}type, seasonYear: ${'$'}seasonYear,
                      season: ${'$'}season, format: ${'$'}format, sort: ${'$'}sort, genre_in: ${'$'}genres) {
                    id title { romaji english } coverImage { large }
                    format status episodes averageScore seasonYear
                }
            }
        }
    """.trimIndent()
    
    val USER_WATCHING_LIST = """
        query(${'$'}userId: Int) {
            MediaListCollection(userId: ${'$'}userId, type: ANIME, status: CURRENT) {
                lists { status entries { id progress media { 
                    id title { romaji english } coverImage { large } episodes
                } } }
            }
        }
    """.trimIndent()
    
    val AIRING_SCHEDULE = """
        query(${'$'}page: Int, ${'$'}perPage: Int, ${'$'}from: Int, ${'$'}to: Int) {
            Page(page: ${'$'}page, perPage: ${'$'}perPage) {
                airingSchedules(airingAt_greater: ${'$'}from, airingAt_lesser: ${'$'}to, sort: TIME) {
                    episode airingAt timeUntilAiring
                    media { id title { romaji english } coverImage { large } format status episodes }
                }
            }
        }
    """.trimIndent()
}
```

### Episode Provider APIs

```kotlin
// Kaido/HiAnime API Service
interface KaidoApi {
    @GET("api/kaido/anime/{animeId}/episodes")
    suspend fun getKaidoEpisodes(@Path("animeId") animeId: String): KaidoEpisodesResponse
    
    @GET("api/kaido/sources/{episodeId}")
    suspend fun getKaidoSources(
        @Path("episodeId") episodeId: String,
        @Query("version") version: String,
        @Query("server") server: String = "vidcloud"
    ): KaidoSourcesResponse
    
    @GET("api/hianime/anime/{animeId}/episodes")
    suspend fun getHiAnimeEpisodes(@Path("animeId") animeId: String): KaidoEpisodesResponse
    
    @GET("api/hianime/sources/{episodeId}")
    suspend fun getHiAnimeSources(
        @Path("episodeId") episodeId: String,
        @Query("version") version: String,
        @Query("server") server: String = "hd-2"
    ): KaidoSourcesResponse
}

// AnimePahe API Service
interface AnimePaheApi {
    @GET("episodes")
    suspend fun getEpisodes(@Query("session") session: String): List<AnimePaheEpisode>
    
    @GET("sources")
    suspend fun getSources(
        @Query("anime_session") animeSession: String,
        @Query("episode_session") episodeSession: String
    ): List<AnimePaheSource>
}

// Mapping API Service (for provider ID mapping)
interface MappingApi {
    @GET("api/mappings")
    suspend fun getMappings(@Query("anilist_id") anilistId: Int): MappingsResponse
}

// AniSkip API Service
interface AniSkipApi {
    @GET("v2/skip-times/{malId}/{episode}")
    suspend fun getSkipTimes(
        @Path("malId") malId: Int,
        @Path("episode") episode: Int,
        @Query("types[]") types: List<String> = listOf("op", "ed")
    ): AniSkipResponse
}
```


## Data Models

### Core Domain Models

```kotlin
// Anime Models
data class Anime(
    val id: Int,
    val malId: Int?,
    val title: AnimeTitle,
    val coverImage: CoverImage,
    val bannerImage: String?,
    val format: AnimeFormat,
    val status: AnimeStatus,
    val episodes: Int?,
    val duration: Int?,
    val genres: List<String>,
    val averageScore: Int?,
    val season: AnimeSeason?,
    val seasonYear: Int?,
    val description: String?,
    val trailer: Trailer?,
    val studios: List<Studio>,
    val nextAiringEpisode: AiringEpisode?,
    val listProgress: Int? = null  // User's progress if logged in
)

data class AnimeTitle(
    val romaji: String,
    val english: String?,
    val native: String?
)

data class CoverImage(
    val large: String,
    val extraLarge: String?
)

data class AnimeDetails(
    val anime: Anime,
    val characters: List<Character>,
    val relations: List<AnimeRelation>,
    val recommendations: List<Anime>
)

// Episode Models
data class Episode(
    val id: String,
    val number: Int,
    val title: String?,
    val image: String?,
    val description: String?,
    val isWatched: Boolean = false,
    val animeSession: String? = null  // For AnimePahe provider
)

data class EpisodeSources(
    val sources: List<VideoSource>,
    val subtitles: List<SubtitleTrack>,
    val skipTimes: SkipTimes?
)

data class VideoSource(
    val url: String,
    val quality: String,
    val type: SourceType  // HLS, MP4, IFRAME
)

data class SubtitleTrack(
    val url: String,
    val label: String,
    val language: String,
    val isDefault: Boolean = false
)

data class SkipTimes(
    val opening: TimeRange?,
    val ending: TimeRange?
)

data class TimeRange(
    val start: Long,
    val end: Long
)

// Provider Models
enum class Provider(val displayName: String) {
    KAIDO("Server 1"),
    HIANIME("Server 2"),
    ANIMEPAHE("Server 3"),
    MEGAPLAY("Server 4")
}

enum class SubType { SUB, DUB }

// User Models
data class User(
    val id: Int,
    val name: String,
    val avatar: String?,
    val bannerImage: String?,
    val createdAt: Long
)

data class UserLists(
    val watching: List<ListEntry>,
    val completed: List<ListEntry>,
    val planning: List<ListEntry>,
    val dropped: List<ListEntry>,
    val paused: List<ListEntry>
)

data class ListEntry(
    val anime: Anime,
    val progress: Int,
    val status: ListStatus,
    val updatedAt: Long
)

// Watch History Models
data class WatchProgress(
    val animeId: Int,
    val episodeNum: Int,
    val position: Long,
    val duration: Long,
    val provider: Provider,
    val subType: SubType,
    val updatedAt: Long
)

data class ContinueWatchingItem(
    val animeId: Int,
    val animeTitle: String,
    val coverImage: String,
    val episodeNum: Int,
    val episodeTitle: String?,
    val progress: Float,  // 0.0 to 1.0
    val provider: Provider,
    val subType: SubType
)

// Schedule Models
data class ScheduleItem(
    val anime: Anime,
    val episode: Int,
    val airingAt: Long,
    val timeUntilAiring: Long
)

// Settings Model
data class AppSettings(
    val heroTrailer: Boolean = true,
    val autoSkip: Boolean = false,
    val autoPlay: Boolean = false,
    val autoNext: Boolean = true,
    val muteAudio: Boolean = false,
    val videoLoadMode: VideoLoadMode = VideoLoadMode.IDLE,
    val titleLanguage: TitleLanguage = TitleLanguage.ROMAJI
)

enum class VideoLoadMode { IDLE, VISIBLE, EAGER }
enum class TitleLanguage { ROMAJI, ENGLISH, NATIVE }
```

### Database Entities (Room)

```kotlin
@Entity(tableName = "anime_cache")
data class AnimeCacheEntity(
    @PrimaryKey val id: Int,
    val data: String,  // JSON serialized Anime
    val cachedAt: Long
)

@Entity(tableName = "watch_history")
data class WatchHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val animeId: Int,
    val episodeNum: Int,
    val position: Long,
    val duration: Long,
    val provider: String,
    val subType: String,
    val animeTitle: String,
    val coverImage: String,
    val episodeTitle: String?,
    val updatedAt: Long
)

@Entity(tableName = "episode_cache")
data class EpisodeCacheEntity(
    @PrimaryKey val cacheKey: String,  // "{animeId}_{provider}"
    val data: String,  // JSON serialized List<Episode>
    val cachedAt: Long
)
```


## API Integration

### AniList GraphQL API

The app will use Apollo GraphQL client to communicate with AniList API at `https://graphql.anilist.co`.

```kotlin
// GraphQL Queries
val TRENDING_QUERY = """
    query($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
            media(type: ANIME, sort: TRENDING_DESC) {
                id
                idMal
                title { romaji english native }
                coverImage { large extraLarge }
                bannerImage
                format
                status
                episodes
                duration
                genres
                averageScore
                season
                seasonYear
                description
                nextAiringEpisode { episode airingAt timeUntilAiring }
                studios(isMain: true) { nodes { name } }
            }
        }
    }
"""

val ANIME_DETAILS_QUERY = """
    query($id: Int) {
        Media(id: $id, type: ANIME) {
            id
            idMal
            title { romaji english native }
            coverImage { large extraLarge }
            bannerImage
            format
            status
            episodes
            duration
            genres
            averageScore
            season
            seasonYear
            description
            trailer { id site }
            nextAiringEpisode { episode airingAt timeUntilAiring }
            studios { nodes { name } }
            characters(sort: ROLE, perPage: 10) {
                nodes { id name { full } image { large } }
            }
            relations { edges { relationType node { id title { romaji } coverImage { large } } } }
            recommendations(perPage: 10) { nodes { mediaRecommendation { id title { romaji } coverImage { large } } } }
        }
    }
"""

val ADVANCED_SEARCH_QUERY = """
    query($search: String, $type: MediaType, $seasonYear: Int, $season: MediaSeason, 
          $format: MediaFormat, $genres: [String], $sort: [MediaSort], $page: Int) {
        Page(page: $page, perPage: 20) {
            pageInfo { hasNextPage currentPage }
            media(search: $search, type: $type, seasonYear: $seasonYear, season: $season,
                  format: $format, genre_in: $genres, sort: $sort) {
                id title { romaji english } coverImage { large }
                format status episodes averageScore seasonYear
            }
        }
    }
"""
```

### Episode Provider APIs

```kotlin
// Provider API Service
interface ProviderApiService {
    
    // Kaido API
    @GET("api/kaido/anime/{animeId}/episodes")
    suspend fun getKaidoEpisodes(@Path("animeId") animeId: String): EpisodesResponse
    
    @GET("api/kaido/sources/{episodeId}")
    suspend fun getKaidoSources(
        @Path("episodeId") episodeId: String,
        @Query("version") version: String = "sub",
        @Query("server") server: String = "vidcloud"
    ): SourcesResponse
    
    // HiAnime API
    @GET("api/hianime/anime/{animeId}/episodes")
    suspend fun getHiAnimeEpisodes(@Path("animeId") animeId: String): EpisodesResponse
    
    @GET("api/hianime/sources/{episodeId}")
    suspend fun getHiAnimeSources(
        @Path("episodeId") episodeId: String,
        @Query("version") version: String = "sub",
        @Query("server") server: String = "hd-2"
    ): SourcesResponse
    
    // AnimePahe API
    @GET("episodes")
    suspend fun getAnimePaheEpisodes(@Query("session") session: String): List<AnimePaheEpisode>
    
    @GET("sources")
    suspend fun getAnimePaheSources(
        @Query("anime_session") animeSession: String,
        @Query("episode_session") episodeSession: String
    ): List<AnimePaheSource>
}

// Mapping Service - Maps AniList IDs to provider IDs
interface MappingService {
    @GET("mappings")
    suspend fun getMappings(@Query("anilist_id") anilistId: Int): MappingsResponse
}
```

### Authentication Flow

```kotlin
// AniList OAuth Configuration
object AniListAuth {
    const val AUTH_URL = "https://anilist.co/api/v2/oauth/authorize"
    const val TOKEN_URL = "https://anilist.co/api/v2/oauth/token"
    const val CLIENT_ID = BuildConfig.ANILIST_CLIENT_ID
    const val CLIENT_SECRET = BuildConfig.ANILIST_CLIENT_SECRET
    const val REDIRECT_URI = "luna://auth/callback"
}

// Auth Manager
class AuthManager @Inject constructor(
    private val dataStore: DataStore<Preferences>,
    private val aniListApi: AniListApi
) {
    private val tokenKey = stringPreferencesKey("auth_token")
    
    val isLoggedIn: Flow<Boolean> = dataStore.data.map { it[tokenKey] != null }
    
    suspend fun getToken(): String? = dataStore.data.first()[tokenKey]
    
    suspend fun saveToken(token: String) {
        dataStore.edit { it[tokenKey] = token }
    }
    
    suspend fun clearToken() {
        dataStore.edit { it.remove(tokenKey) }
    }
    
    suspend fun exchangeCodeForToken(code: String): Result<String>
}
```


## UI Components

### Screen Composables

```kotlin
// Home Screen
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onAnimeClick: (Int) -> Unit,
    onSearchClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LazyColumn {
        // Hero Section with auto-scrolling carousel
        item { HeroSection(anime = uiState.trending.take(5), onClick = onAnimeClick) }
        
        // Continue Watching (if logged in and has history)
        if (uiState.continueWatching.isNotEmpty()) {
            item { 
                AnimeSection(
                    title = "Continue Watching",
                    items = uiState.continueWatching,
                    onItemClick = { /* Navigate to watch */ }
                )
            }
        }
        
        // Currently Watching from AniList
        if (uiState.userWatching.isNotEmpty()) {
            item { AnimeSection("Currently Watching", uiState.userWatching, onAnimeClick) }
        }
        
        // Recent Episodes
        item { RecentEpisodesSection(uiState.recentEpisodes, onAnimeClick) }
        
        // Trending, Popular, etc.
        item { AnimeSection("Trending Now", uiState.trending, onAnimeClick) }
        item { AnimeSection("Upcoming", uiState.upcoming, onAnimeClick) }
        item { AnimeSection("All Time Popular", uiState.popular, onAnimeClick) }
        
        // Schedule Section
        item { ScheduleSection(uiState.schedule, onAnimeClick) }
        
        // Vertical Lists
        item { 
            Row {
                VerticalAnimeList("Top 100", uiState.top100, onAnimeClick)
                VerticalAnimeList("Seasonal", uiState.seasonal, onAnimeClick)
            }
        }
    }
}

// Anime Details Screen
@Composable
fun AnimeDetailsScreen(
    viewModel: AnimeDetailsViewModel = hiltViewModel(),
    onEpisodeClick: (Episode) -> Unit,
    onAnimeClick: (Int) -> Unit,
    onBackClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    Scaffold(
        topBar = { DetailsTopBar(onBackClick) }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            // Banner and Cover
            item { AnimeBanner(uiState.anime) }
            
            // Title and Actions
            item { AnimeHeader(uiState.anime, uiState.userListStatus, viewModel::addToList) }
            
            // Info Section
            item { AnimeInfoSection(uiState.anime) }
            
            // Description
            item { ExpandableDescription(uiState.anime.description) }
            
            // Next Airing (if releasing)
            uiState.anime.nextAiringEpisode?.let {
                item { NextAiringSection(it) }
            }
            
            // Episode Section with Provider Selector
            item { 
                EpisodeSection(
                    episodes = uiState.episodes,
                    providers = uiState.availableProviders,
                    selectedProvider = uiState.selectedProvider,
                    subTypes = uiState.availableSubTypes,
                    selectedSubType = uiState.selectedSubType,
                    onProviderSelect = viewModel::selectProvider,
                    onSubTypeSelect = viewModel::selectSubType,
                    onEpisodeClick = onEpisodeClick
                )
            }
            
            // Characters
            item { CharactersSection(uiState.characters, onCharacterClick = {}) }
            
            // Relations
            item { RelationsSection(uiState.relations, onAnimeClick) }
            
            // Recommendations
            item { RecommendationsSection(uiState.recommendations, onAnimeClick) }
        }
    }
}

// Watch Screen with Video Player
@Composable
fun WatchScreen(
    viewModel: WatchViewModel = hiltViewModel(),
    onBackClick: () -> Unit,
    onEpisodeClick: (Episode) -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val playerState by viewModel.playerState.collectAsStateWithLifecycle()
    
    Column {
        // Video Player
        VideoPlayer(
            source = uiState.currentSource,
            subtitles = uiState.subtitles,
            skipTimes = uiState.skipTimes,
            settings = uiState.settings,
            playerState = playerState,
            onPositionChanged = viewModel::onPlaybackPositionChanged,
            onEpisodeCompleted = viewModel::onEpisodeCompleted,
            onSkipOpening = viewModel::skipOpening,
            onSkipEnding = viewModel::skipEnding,
            onError = viewModel::onPlayerError
        )
        
        // Episode Info
        EpisodeInfo(
            animeTitle = uiState.animeTitle,
            episodeNum = uiState.currentEpisode?.number
        )
        
        // Episode List
        EpisodeList(
            episodes = uiState.episodes,
            currentEpisode = uiState.currentEpisode,
            providers = uiState.providers,
            selectedProvider = uiState.selectedProvider,
            onProviderChange = viewModel::changeProvider,
            onEpisodeClick = onEpisodeClick
        )
    }
}
```

### Reusable Components

```kotlin
// Anime Card Component
@Composable
fun AnimeCard(
    anime: Anime,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier.width(140.dp)
    ) {
        Column {
            AsyncImage(
                model = anime.coverImage.large,
                contentDescription = anime.title.romaji,
                modifier = Modifier.aspectRatio(0.7f)
            )
            Text(
                text = anime.displayTitle,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

// Episode Card Component
@Composable
fun EpisodeCard(
    episode: Episode,
    isWatched: Boolean,
    onClick: () -> Unit
) {
    Card(onClick = onClick) {
        Row {
            AsyncImage(
                model = episode.image,
                contentDescription = "Episode ${episode.number}"
            )
            Column {
                Text("Episode ${episode.number}")
                episode.title?.let { Text(it, maxLines = 1) }
            }
            if (isWatched) {
                Icon(Icons.Default.Check, "Watched")
            }
        }
    }
}

// Provider Selector
@Composable
fun ProviderSelector(
    providers: List<Provider>,
    selected: Provider,
    onSelect: (Provider) -> Unit
) {
    Row {
        providers.forEach { provider ->
            FilterChip(
                selected = provider == selected,
                onClick = { onSelect(provider) },
                label = { Text(provider.displayName) }
            )
        }
    }
}
```


## Video Player Implementation

### ExoPlayer Integration

```kotlin
// Video Player Component
@Composable
fun VideoPlayer(
    source: VideoSource?,
    subtitles: List<SubtitleTrack>,
    skipTimes: SkipTimes?,
    settings: AppSettings,
    playerState: PlayerState,
    onPositionChanged: (Long) -> Unit,
    onEpisodeCompleted: () -> Unit,
    onSkipOpening: () -> Unit,
    onSkipEnding: () -> Unit,
    onError: (Throwable) -> Unit
) {
    val context = LocalContext.current
    
    val exoPlayer = remember {
        ExoPlayer.Builder(context)
            .setSeekBackIncrementMs(10_000)
            .setSeekForwardIncrementMs(10_000)
            .build()
    }
    
    // Handle source changes
    LaunchedEffect(source) {
        source?.let {
            val mediaItem = when (it.type) {
                SourceType.HLS -> MediaItem.Builder()
                    .setUri(it.url)
                    .setMimeType(MimeTypes.APPLICATION_M3U8)
                    .build()
                SourceType.MP4 -> MediaItem.fromUri(it.url)
                SourceType.IFRAME -> null // Handle iframe separately
            }
            mediaItem?.let { item ->
                exoPlayer.setMediaItem(item)
                exoPlayer.prepare()
                if (settings.autoPlay) exoPlayer.play()
            }
        }
    }
    
    // Add subtitles
    LaunchedEffect(subtitles) {
        subtitles.forEach { track ->
            val subtitle = MediaItem.SubtitleConfiguration.Builder(Uri.parse(track.url))
                .setMimeType(MimeTypes.TEXT_VTT)
                .setLanguage(track.language)
                .setLabel(track.label)
                .setSelectionFlags(if (track.isDefault) C.SELECTION_FLAG_DEFAULT else 0)
                .build()
            // Add to media item
        }
    }
    
    // Track position for skip buttons and progress saving
    var currentPosition by remember { mutableLongStateOf(0L) }
    var showSkipOpening by remember { mutableStateOf(false) }
    var showSkipEnding by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            currentPosition = exoPlayer.currentPosition
            onPositionChanged(currentPosition)
            
            // Check skip times
            skipTimes?.let { times ->
                times.opening?.let { op ->
                    showSkipOpening = currentPosition in op.start..op.end
                    if (settings.autoSkip && showSkipOpening) {
                        exoPlayer.seekTo(op.end)
                    }
                }
                times.ending?.let { ed ->
                    showSkipEnding = currentPosition in ed.start..ed.end
                    if (settings.autoSkip && showSkipEnding) {
                        exoPlayer.seekTo(ed.end)
                    }
                }
            }
        }
    }
    
    // Handle completion
    DisposableEffect(Unit) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                if (state == Player.STATE_ENDED) {
                    onEpisodeCompleted()
                }
            }
            override fun onPlayerError(error: PlaybackException) {
                onError(error)
            }
        }
        exoPlayer.addListener(listener)
        onDispose {
            exoPlayer.removeListener(listener)
            exoPlayer.release()
        }
    }
    
    Box {
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = exoPlayer
                    useController = true
                }
            },
            modifier = Modifier.aspectRatio(16f / 9f)
        )
        
        // Skip Opening Button
        if (showSkipOpening) {
            Button(
                onClick = {
                    skipTimes?.opening?.let { exoPlayer.seekTo(it.end) }
                    onSkipOpening()
                },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
            ) {
                Text("Skip Opening")
            }
        }
        
        // Skip Ending Button
        if (showSkipEnding) {
            Button(
                onClick = {
                    skipTimes?.ending?.let { exoPlayer.seekTo(it.end) }
                    onSkipEnding()
                },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
            ) {
                Text("Skip Ending")
            }
        }
    }
}

// Iframe Player for AnimePahe/MegaPlay
@Composable
fun IframePlayer(
    url: String,
    modifier: Modifier = Modifier
) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false
                webChromeClient = WebChromeClient()
                loadUrl(url)
            }
        },
        modifier = modifier.aspectRatio(16f / 9f)
    )
}
```


## Error Handling

### Error Types

```kotlin
sealed class AppError : Exception() {
    data class NetworkError(override val message: String) : AppError()
    data class ApiError(val code: Int, override val message: String) : AppError()
    object SessionExpired : AppError()
    data class ProviderError(val provider: Provider, override val message: String) : AppError()
    object NoSourcesAvailable : AppError()
    data class PlaybackError(override val message: String) : AppError()
}
```

### Error Handling Strategy

- Network errors: Show retry button with error message
- Provider errors: Suggest trying alternative servers
- Session expired: Redirect to login
- Playback errors: Show error and suggest changing server

## Testing Strategy

The app prioritizes working functionality over extensive testing. Testing approach:

1. **Real API Integration**: All data comes from real APIs (AniList, Kaido, HiAnime, AnimePahe)
2. **Manual Testing**: Primary validation through actual app usage
3. **Minimal Test Files**: Only essential integration tests to verify API connectivity
4. **No Mocks**: Tests use real endpoints to ensure production behavior matches

```kotlin
// Single test file: ApiConnectionTest.kt
@HiltAndroidTest
class ApiConnectionTest {
    @Test
    fun verifyAniListConnection() = runTest {
        val response = aniListApi.getTrending(1, 5)
        assertTrue(response.data != null)
    }
}
```

## Project Structure

```
luna-android/
├── app/
│   ├── src/main/
│   │   ├── java/com/luna/anime/
│   │   │   ├── MainActivity.kt
│   │   │   ├── LunaApplication.kt
│   │   │   ├── data/
│   │   │   │   ├── api/
│   │   │   │   │   ├── AniListApi.kt
│   │   │   │   │   ├── KaidoApi.kt
│   │   │   │   │   ├── AnimePaheApi.kt
│   │   │   │   │   └── MappingApi.kt
│   │   │   │   ├── local/
│   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   ├── WatchHistoryDao.kt
│   │   │   │   │   └── CacheDao.kt
│   │   │   │   ├── repository/
│   │   │   │   │   ├── AnimeRepositoryImpl.kt
│   │   │   │   │   ├── EpisodeRepositoryImpl.kt
│   │   │   │   │   ├── UserRepositoryImpl.kt
│   │   │   │   │   └── SettingsRepositoryImpl.kt
│   │   │   │   └── model/
│   │   │   │       └── (API response models)
│   │   │   ├── domain/
│   │   │   │   ├── model/
│   │   │   │   │   └── (Domain models)
│   │   │   │   └── repository/
│   │   │   │       └── (Repository interfaces)
│   │   │   ├── ui/
│   │   │   │   ├── navigation/
│   │   │   │   │   └── NavGraph.kt
│   │   │   │   ├── screens/
│   │   │   │   │   ├── home/
│   │   │   │   │   ├── details/
│   │   │   │   │   ├── watch/
│   │   │   │   │   ├── catalog/
│   │   │   │   │   ├── schedule/
│   │   │   │   │   ├── profile/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── search/
│   │   │   │   ├── components/
│   │   │   │   │   ├── AnimeCard.kt
│   │   │   │   │   ├── EpisodeCard.kt
│   │   │   │   │   ├── VideoPlayer.kt
│   │   │   │   │   └── (other components)
│   │   │   │   └── theme/
│   │   │   │       └── Theme.kt
│   │   │   ├── di/
│   │   │   │   ├── AppModule.kt
│   │   │   │   ├── NetworkModule.kt
│   │   │   │   └── DatabaseModule.kt
│   │   │   └── util/
│   │   │       ├── AuthManager.kt
│   │   │       └── Extensions.kt
│   │   └── res/
│   │       └── (resources)
│   └── build.gradle.kts
├── gradle/
└── build.gradle.kts
```
