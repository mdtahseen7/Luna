<div align="center">
  <a href="https://airin-revived.vercel.app" target="_blank">
    <img src="https://raw.githubusercontent.com/mdtahseen7/Luna/main/public/icon-512x512.png" alt="Luna Logo" width="140" height="140">
  </a>

  <h2 align="center">Luna</h3>

  <p align="center">
    An open-source anime streaming platform built with Next.js 14
  </p>
</div>

# About the Project

Experience ad-free anime streaming with seamless AniList integration for progress tracking. Powered by modern APIs including Consumet and Anify, Luna delivers a smooth viewing experience. Built with Next.js 14, NextUI, MongoDB, and Redis for optimal performance.

## Features

- 🚫 **Ad-Free Experience** - No interruptions, pure anime
- ⚡ **Lightning Fast** - Optimized page loads and streaming
- 📱 **PWA Support** - Install as an app on any device
- 📐 **Fully Responsive** - Perfect experience on all screen sizes
- 🎯 **Multi-Provider Support** - Multiple sources for reliability
- 🎬 **Smart Recommendations** - Discover new anime
- ▶️ **Advanced Player Features**
  - Auto-play next episode
  - Skip opening/ending buttons
  - Auto-play on load
  - Multiple quality options
- 🔄 **AniList Integration** - Track your progress automatically
- 📅 **Schedule Page** - See upcoming anime releases
- 🔥 **Trending Page** - Discover what's popular
- 🎨 **Purple Theme** - Modern, beautiful UI design

## Roadmap

- [x] Add Changelog
- [x] AniList episode tracking
- [x] Profile page
- [x] Schedule page
- [x] Trending page
- [x] Multiple proxy support
- [x] Notification system
- [ ] Download episodes
- [ ] Comment section
- [ ] Enhanced AniList user page
  - [ ] Detailed progress view
  - [ ] Full AniList stats import
- [ ] Scene search in catalog
- [ ] Manga reading support
  - [ ] Comick integration
  - [ ] MangaDex integration

## Environment Variables

Luna requires certain environment variables to function properly. Create a `.env.local` file in the root directory:

### Required Variables

```env

##Kenjitsu-api
Huge Thanks to Kenjitsu-api, it played a major role in making this site up, you can access it here - [Kenjitsu-api](https://github.com/middlegear/kenjitsu)

## MongoDB (Required)
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/luna?retryWrites=true&w=majority"
# Get free MongoDB Atlas: https://www.mongodb.com/cloud/atlas

## NextAuth Configuration (Required)
NEXTAUTH_SECRET="your-secret-here"
# Generate with: openssl rand -base64 32
# Or online: https://generate-secret.vercel.app/32

NEXTAUTH_URL="http://localhost:3000"
# For development: http://localhost:3000
# For production: https://your-domain.com

## AniList OAuth (Required for user features)
GRAPHQL_ENDPOINT="https://graphql.anilist.co"
ANILIST_CLIENT_ID="your-client-id"
ANILIST_CLIENT_SECRET="your-client-secret"
# Get credentials: https://anilist.co/settings/developer
# Redirect URL: https://your-domain.com/api/auth/callback/AniListProvider
```

### Optional Variables

```env
## Redis (Highly Recommended for caching)
REDIS_URL="rediss://default:password@host:port"
# Free providers:
# - Upstash: https://upstash.com/
# - Aiven: https://aiven.io/
# - Redis Cloud: https://redis.com/try-free/

## Proxy Configuration (Optional - for bypassing geo-restrictions)
NEXT_PUBLIC_PROXY_URI="https://your-proxy-url.com"
# Use if streaming sources are blocked in your region
# Can use multiple proxies (comma-separated)

## Custom API Endpoints (Optional)
ZORO_URI="https://your-aniwatch-api.com"
# Host your own: https://github.com/ghoshRitesh12/aniwatch-api
# Provides additional anime sources
# Don't add trailing slash
```

### Setting Up AniList OAuth

1. Go to [AniList Developer Settings](https://anilist.co/settings/developer)
2. Create a new Client
3. Set the Redirect URL to: `https://your-domain.com/api/auth/callback/AniListProvider`
   - For local development: `http://localhost:3000/api/auth/callback/AniListProvider`
4. Copy the Client ID and Client Secret to your `.env.local`

### Environment Variable Tips

- Never commit `.env.local` to version control
- Use different values for development and production
- Redis significantly improves performance (caches API responses)
- Without Redis, the app will work but make more API calls
- Multiple proxies can be configured for better reliability

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn or bun
- MongoDB database (local or Atlas)
- (Optional) Redis instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdtahseen7/airin-revived.git
   cd airin-revived
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Generate favicons and icons (optional)**
   ```bash
   npm run generate-icons
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mdtahseen7/airin-revived)

1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Deploy with Docker

1. **Create your `.env.local` file with all required variables**

2. **Build and run with Docker:**
   ```bash
   docker build -t luna .
   docker run -d -p 3000:3000 --env-file .env.local luna
   ```

3. **Or use Docker Compose:**
   ```yaml
   version: "3.8"
   services:
     luna:
       container_name: luna
       build: .
       ports:
         - "3000:3000"
       env_file:
         - .env.local
       restart: unless-stopped
   ```

   ```bash
   docker-compose up -d
   ```

### Deploy Full Stack (with MongoDB and Redis)

Use the included `docker-compose.yml` for a complete setup:

```bash
docker-compose up -d
```

This will start:
- Luna application
- MongoDB instance
- Redis instance
- (Optional) Consumet API

Access Luna at `http://localhost:3000`

## Self-Hosting Notice

> [!CAUTION]
> Self-hosting is **strictly for personal use only**. Commercial use is **prohibited**. Adding advertisements may result in **takedown measures**. Please comply with all applicable laws and respect intellectual property rights.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** NextUI, Tailwind CSS
- **Authentication:** NextAuth.js with AniList OAuth
- **Database:** MongoDB
- **Cache:** Redis
- **Video Player:** Vidstack
- **APIs:** Consumet, Kenjitsu, Anify, AniList GraphQL
- **Animation:** Framer Motion

## Contributing

Contributions make the open-source community amazing! Any contributions are **greatly appreciated**.

To contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Don't forget to ⭐ the project!

## License

This project is open source. Please use responsibly and for personal use only.

## Contact

Project Link: [https://github.com/mdtahseen7/airin-revived](https://github.com/mdtahseen7/airin-revived)

Live Demo: [https://airin-revived.vercel.app](https://airin-revived.vercel.app)

## Acknowledgments

- Original Airin project
- AniList for their amazing API
- Consumet and Anify for streaming sources
- All contributors and supporters
