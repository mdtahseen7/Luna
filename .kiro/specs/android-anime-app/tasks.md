# Implementation Plan: Android Anime Streaming App

## Overview

This implementation plan breaks down the Android app development into incremental tasks. The app will be built using Kotlin with Jetpack Compose, following Clean Architecture with MVVM pattern. Each task builds on previous work, ensuring no orphaned code.

## Tasks

- [x] 1. Project Setup and Core Infrastructure
  - [x] 1.1 Create new Android project with Kotlin and Jetpack Compose
    - Create project in `android-anime-app/` folder
    - Configure build.gradle with required dependencies (Hilt, Retrofit, Room, Coil, ExoPlayer, Apollo GraphQL, Kotlinx Serialization, Navigation Compose)
    - Set up module structure: app, data, domain, presentation
    - Configure ProGuard rules and build variants
    - _Requirements: 10.1, 10.2_

  - [x] 1.2 Set up dependency injection with Hilt
    - Create Application class with @HiltAndroidApp
    - Create NetworkModule for Retrofit and OkHttp
    - Create DatabaseModule for Room
    - Create RepositoryModule for binding implementations
    - _Requirements: All (infrastructure)_

  - [x] 1.3 Create core domain models
    - Implement Anime, AnimeTitle, CoverImage, AnimeDetails data classes
    - Implement Episode, EpisodeSources, VideoSource, SubtitleTrack data classes
    - Implement Provider enum, SubType enum
    - Implement User, UserLists, ListEntry data classes
    - Implement WatchProgress, ContinueWatchingItem data classes
    - Implement AppSettings with VideoLoadMode and TitleLanguage enums
    - _Requirements: 14.1, 14.2_

  - [x] 1.4 Write property test for data model serialization round-trip
    - **Property 1: Data Serialization Round-Trip**
    - **Validates: Requirements 14.1, 14.2, 14.3**

- [x] 2. Data Layer - Local Storage
  - [x] 2.1 Set up Room database
    - Create AppDatabase with entities
    - Implement AnimeCacheEntity, WatchHistoryEntity, EpisodeCacheEntity
    - Create DAOs for each entity
    - _Requirements: 11.1, 6.1_

  - [x] 2.2 Implement DataStore for settings and auth
    - Create SettingsDataStore for AppSettings persistence
    - Create AuthDataStore for token storage
    - Implement settings read/write operations
    - _Requirements: 9.2, 9.4, 7.2_

  - [x] 2.3 Write property test for settings persistence round-trip
    - **Property 3: Settings Persistence Round-Trip**
    - **Validates: Requirements 9.2, 9.4**

- [x] 3. Data Layer - Remote APIs
  - [x] 3.1 Set up AniList GraphQL client
    - Configure Apollo GraphQL client
    - Create GraphQL query files for trending, popular, top100, seasonal, upcoming
    - Create query for anime details with characters, relations, recommendations
    - Create query for advanced search with filters
    - Create query for airing schedule
    - Create mutations for updating user list
    - _Requirements: 1.1, 1.2, 2.2, 2.5, 3.1, 3.2, 13.1_

  - [x] 3.2 Implement provider API services
    - Create Retrofit service for Kaido API (episodes, sources)
    - Create Retrofit service for HiAnime API (episodes, sources)
    - Create Retrofit service for AnimePahe API (episodes, sources)
    - Create mapping service for AniList ID to provider ID mapping
    - _Requirements: 4.2, 4.3, 5.1_

  - [x] 3.3 Implement remote data sources
    - Create AniListRemoteDataSource with all queries
    - Create ProviderRemoteDataSource for episode/source fetching
    - Implement error mapping to AppError types
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 4. Repository Implementations
  - [x] 4.1 Implement AnimeRepository
    - Implement getTrendingAnime, getPopularAnime, getTop100Anime, getSeasonalAnime
    - Implement getUpcomingAnime, getAnimeDetails, getAiringSchedule
    - Implement searchAnime with filters
    - Implement caching strategy with Room
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.2, 2.5, 3.1, 11.1, 11.2_

  - [x] 4.2 Implement EpisodeRepository
    - Implement getEpisodes with provider selection
    - Implement getEpisodeSources with provider and subType
    - Implement provider fallback logic
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_

  - [x] 4.3 Implement UserRepository
    - Implement login/logout with OAuth flow
    - Implement getCurrentUser, getUserWatchingList, getUserLists
    - Implement updateProgress, addToList mutations
    - Implement getNotifications with pagination
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 6.2, 6.4, 8.1_

  - [x] 4.4 Write property test for authentication state consistency
    - **Property 2: Authentication State Consistency**
    - **Validates: Requirements 7.2, 7.6**

  - [x] 4.5 Implement WatchHistoryRepository
    - Implement saveProgress to Room database
    - Implement getProgress for resume functionality
    - Implement getContinueWatching for home screen
    - _Requirements: 5.7, 5.8, 6.1, 6.3_

  - [x] 4.6 Write property test for watch progress persistence
    - **Property 4: Watch Progress Persistence**
    - **Validates: Requirements 5.7, 5.8, 6.1**

  - [x] 4.7 Implement SettingsRepository
    - Implement settings Flow for reactive updates
    - Implement updateSetting for individual settings
    - Implement getSettings for initial load
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5. Checkpoint - Core Data Layer Complete
  - Ensure all repository tests pass
  - Verify data flows correctly between layers
  - Ask the user if questions arise

- [x] 6. Navigation and App Shell
  - [x] 6.1 Set up Navigation Compose
    - Create NavHost with all screen destinations
    - Define navigation routes and arguments
    - Implement bottom navigation bar (Home, Catalog, Schedule, Profile)
    - Implement navigation drawer/sidebar
    - _Requirements: 10.1, 10.2, 10.6_

  - [x] 6.2 Create MainActivity and app shell
    - Set up Hilt entry point
    - Implement Scaffold with bottom nav and drawer
    - Handle deep links for OAuth callback
    - _Requirements: 10.1, 10.2_

- [x] 7. Home Screen Implementation
  - [x] 7.1 Create HomeViewModel
    - Implement state management for all home sections
    - Fetch trending, popular, top100, seasonal, upcoming data
    - Fetch user watching list if logged in
    - Fetch recent episodes and schedule
    - Implement refresh functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 7.2 Create Home Screen UI components
    - Implement HeroSection with auto-scrolling carousel
    - Implement AnimeSection for horizontal scrollable lists
    - Implement AnimeCard composable
    - Implement RecentEpisodesSection
    - Implement ScheduleSection
    - Implement VerticalAnimeList for Top 100 and Seasonal
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

  - [x] 7.3 Implement HomeScreen composable
    - Wire up all sections with ViewModel state
    - Implement pull-to-refresh
    - Implement loading and error states
    - Handle navigation to anime details
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 10.4_

  - [x] 7.4 Write property test for currently watching section visibility
    - **Property 14: Currently Watching Section Visibility**
    - **Validates: Requirements 1.3**

- [x] 8. Search and Catalog Implementation
  - [x] 8.1 Create SearchViewModel and CatalogViewModel
    - Implement debounced search with 500ms delay
    - Implement filter state management (year, season, format, genres, sort)
    - Implement pagination with infinite scroll
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

  - [x] 8.2 Create Search Screen UI
    - Implement search input with keyboard focus
    - Implement search results list with AnimeCard
    - Display cover, title, episodes, rating, format, year, status
    - Handle empty results state
    - _Requirements: 2.1, 2.2, 2.3, 2.7_

  - [x] 8.3 Write property test for search results display
    - **Property 8: Search Results Contain Required Fields**
    - **Validates: Requirements 2.3**

  - [x] 8.4 Create Catalog Screen UI
    - Implement filter chips/dropdowns for all filter types
    - Implement results grid with pagination
    - Wire up filter changes to API calls
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 8.5 Write property test for filter application
    - **Property 9: Filter Application Correctness**
    - **Validates: Requirements 2.5**

- [x] 9. Anime Details Screen Implementation
  - [x] 9.1 Create AnimeDetailsViewModel
    - Fetch anime details with characters, relations, recommendations
    - Fetch episodes from available providers
    - Manage provider and subType selection state
    - Handle add to list functionality
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2_

  - [x] 9.2 Create Anime Details UI components
    - Implement AnimeBanner with parallax effect
    - Implement AnimeHeader with title, score, actions
    - Implement AnimeInfoSection (genres, status, episodes, duration, etc.)
    - Implement ExpandableDescription
    - Implement NextAiringSection with countdown
    - Implement CharactersSection
    - Implement RelationsSection and RecommendationsSection
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 9.3 Create Episode Section UI
    - Implement ProviderSelector chips
    - Implement SubType toggle (Sub/Dub)
    - Implement EpisodeList with pagination/chunking
    - Implement EpisodeCard with watched indicator
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 9.4 Write property test for anime details display completeness
    - **Property 5: Anime Details Display Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 9.5 Write property test for episode list display
    - **Property 6: Episode List Display Correctness**
    - **Validates: Requirements 4.1, 4.5**

  - [x] 9.6 Write property test for provider selection
    - **Property 7: Provider Selection Updates Episodes**
    - **Validates: Requirements 4.2, 4.3**

- [x] 10. Checkpoint - Browse Features Complete
  - Ensure home, search, catalog, and details screens work
  - Verify navigation between screens
  - Ask the user if questions arise

- [ ] 11. Video Player Implementation
  - [x] 11.1 Create WatchViewModel
    - Manage video source loading from providers
    - Handle subtitle track selection
    - Manage skip times state
    - Track playback position and save progress
    - Handle episode completion and auto-next
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 11.2 Implement ExoPlayer video player
    - Set up ExoPlayer with HLS and MP4 support
    - Implement custom player controls
    - Add subtitle track support
    - Implement seek gestures (double-tap to seek)
    - Handle fullscreen mode
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 11.3 Implement skip times functionality
    - Display "Skip Opening" button at correct times
    - Display "Skip Ending" button at correct times
    - Implement auto-skip when enabled
    - _Requirements: 5.4, 5.5_

  - [x] 11.4 Write property test for skip times button visibility
    - **Property 11: Skip Times Button Visibility**
    - **Validates: Requirements 5.4**

  - [x] 11.5 Write property test for auto-skip behavior
    - **Property 12: Auto-Skip Behavior**
    - **Validates: Requirements 5.5**

  - [x] 11.6 Implement auto-next episode
    - Detect episode completion
    - Load and play next episode when auto-next enabled
    - _Requirements: 5.6_

  - [x] 11.7 Write property test for auto-next episode
    - **Property 13: Auto-Next Episode**
    - **Validates: Requirements 5.6**

  - [x] 11.8 Implement IframePlayer for AnimePahe/MegaPlay
    - Create WebView-based player for iframe sources
    - Handle JavaScript and media playback
    - _Requirements: 5.1_

  - [ ] 11.9 Create Watch Screen UI
    - Integrate video player component
    - Display episode info below player
    - Show episode list with provider selector
    - Handle error states with server suggestions
    - _Requirements: 5.1, 5.2, 5.9_

- [ ] 12. Watch Progress and History
  - [ ] 12.1 Implement progress saving
    - Save position every 5 seconds during playback
    - Save to local Room database
    - Sync to AniList when logged in
    - _Requirements: 5.7, 6.1, 6.2, 6.4_

  - [ ] 12.2 Implement resume functionality
    - Load saved position when returning to episode
    - Resume from saved position (minus 3 seconds buffer)
    - Reset if watched > 90%
    - _Requirements: 5.8_

  - [ ] 12.3 Implement Continue Watching section
    - Query recent watch history
    - Display on home screen
    - Navigate to watch screen with correct state
    - _Requirements: 6.3_

- [ ] 13. Checkpoint - Video Playback Complete
  - Ensure video plays from all providers
  - Verify skip times and auto-next work
  - Verify progress saving and resume
  - Ask the user if questions arise

- [ ] 14. User Authentication and Profile
  - [ ] 14.1 Implement AniList OAuth flow
    - Create login screen with AniList button
    - Handle OAuth redirect with custom URI scheme
    - Exchange code for token
    - Store token securely
    - _Requirements: 7.1, 7.2_

  - [ ] 14.2 Create Profile Screen
    - Display user banner, avatar, name, join date
    - Display anime lists (Watching, Completed, Planning, etc.)
    - Implement list tabs with anime grids
    - Handle navigation to anime details
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ] 14.3 Implement logout functionality
    - Clear stored token
    - Clear user-specific cached data
    - Navigate to home screen
    - _Requirements: 7.6_

  - [ ] 14.4 Implement Notifications Screen
    - Fetch notifications from AniList
    - Display notification type, content, timestamp
    - Implement pagination on scroll
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 15. Settings Screen
  - [ ] 15.1 Create Settings Screen UI
    - Implement toggle switches for all settings
    - Homepage Trailer, AutoSkip, AutoPlay, AutoNext, Mute Audio
    - Implement video load mode selection (Idle, Visible, Eager)
    - Implement title language preference
    - _Requirements: 9.1, 9.3, 9.5_

  - [ ] 15.2 Wire settings to app behavior
    - Apply settings on app launch
    - React to setting changes in real-time
    - Persist changes immediately
    - _Requirements: 9.2, 9.4_

- [ ] 16. Schedule Screen
  - [ ] 16.1 Create ScheduleViewModel
    - Fetch airing schedule for current week
    - Group anime by day of week
    - _Requirements: 13.1, 13.2_

  - [ ] 16.2 Create Schedule Screen UI
    - Display day tabs or sections
    - Show anime cards with episode number and airing time
    - Handle navigation to anime details
    - _Requirements: 13.2, 13.3, 13.4_

  - [ ] 16.3 Write property test for schedule grouping
    - **Property 10: Schedule Grouping by Day**
    - **Validates: Requirements 13.2, 13.3**

- [ ] 17. Error Handling and Edge Cases
  - [ ] 17.1 Implement global error handling
    - Create ErrorHandler class
    - Map exceptions to AppError types
    - Display appropriate error UI
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ] 17.2 Implement session expiry handling
    - Detect 401 responses
    - Clear token and prompt re-authentication
    - _Requirements: 12.5_

  - [ ] 17.3 Write property test for session expiry handling
    - **Property 18: Session Expiry Handling**
    - **Validates: Requirements 12.5**

  - [ ] 17.4 Implement provider fallback UI
    - Show alternative server suggestions on failure
    - Allow easy provider switching
    - _Requirements: 12.3_

- [ ] 18. Offline Support and Caching
  - [ ] 18.1 Implement network connectivity monitoring
    - Create NetworkMonitor using ConnectivityManager
    - Expose connectivity state as Flow
    - _Requirements: 11.2_

  - [ ] 18.2 Implement offline mode
    - Display cached data when offline
    - Show offline indicator
    - Refresh stale data on reconnect
    - _Requirements: 11.2, 11.3_

  - [ ] 18.3 Write property test for offline cache availability
    - **Property 17: Cache Data Availability Offline**
    - **Validates: Requirements 11.1, 11.2**

  - [ ] 18.4 Implement image caching with Coil
    - Configure Coil disk cache
    - Display cached images offline
    - _Requirements: 11.4_

- [ ] 19. UI Polish and Accessibility
  - [ ] 19.1 Implement loading states
    - Add shimmer/skeleton loading for lists
    - Add loading indicators for data fetching
    - _Requirements: 10.5_

  - [ ] 19.2 Implement Go to Top button
    - Show FAB when scrolled down
    - Smooth scroll to top on click
    - _Requirements: 10.3_

  - [ ] 19.3 Write property test for navigation from anime card
    - **Property 15: Navigation from Anime Card**
    - **Validates: Requirements 1.6, 7.5, 13.4**

  - [ ] 19.4 Handle configuration changes
    - Preserve state on rotation
    - Handle theme changes
    - _Requirements: 15.5_

  - [ ] 19.5 Write property test for configuration change state preservation
    - **Property 16: Configuration Change State Preservation**
    - **Validates: Requirements 15.5**

- [ ] 20. Final Checkpoint - App Complete
  - Run all tests and ensure they pass
  - Verify all features work end-to-end
  - Test on multiple device sizes
  - Ask the user if questions arise

## Notes

- All tasks including property-based tests are required
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using Kotest
- Unit tests validate specific examples and edge cases
- If property tests take too long, they can be skipped and revisited later
