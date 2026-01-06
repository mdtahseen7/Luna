import { NextResponse } from 'next/server';
import { fetchSeriesLogoUrl as fetchTvdbLogo } from '@/lib/tvdb';
import { fetchSeriesLogoUrl as fetchFanartLogo } from '@/lib/fanart';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || '';
    const yearParam = searchParams.get('year');
    const year = yearParam ? Number(yearParam) || undefined : undefined;

    if (!title.trim()) {
      return NextResponse.json({ logoUrl: null, error: 'Missing title' }, { status: 400 });
    }

    console.log(`API: request for "${title}" (${year || 'no year'})`);
    
    let logoUrl = null;

    // 1. Try Fanart.tv (via TMDB bridge) if keys are configured
    if (process.env.FANART_API_KEY && process.env.TMDB_API_KEY) {
        console.log('API: Using Fanart.tv provider');
        logoUrl = await fetchFanartLogo({ title, year });
    }

    // 2. Fallback to TVDB if Fanart failed or not configured, and TVDB key exists
    if (!logoUrl && process.env.TVDB_API_KEY) {
        console.log('API: Using TVDB provider (fallback)');
        logoUrl = await fetchTvdbLogo({ title, year });
    }

    console.log(`API: result for "${title}": ${logoUrl}`);

    return NextResponse.json({ logoUrl: logoUrl || null });
  } catch (error) {
    console.error('Error in /api/tvdb-logo:', error);
    return NextResponse.json({ logoUrl: null, error: 'Internal error' }, { status: 500 });
  }
}
