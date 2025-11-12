import { NextRequest, NextResponse } from 'next/server';

function toAbsoluteUrl(maybeUrl: string, base: string): string | null {
  try {
    if (!maybeUrl) return null;
    return new URL(maybeUrl, base).toString();
  } catch {
    return null;
  }
}

function extractMetaImage(html: string, baseUrl: string): string | null {
  // Try Open Graph
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (ogMatch?.[1]) {
    const abs = toAbsoluteUrl(ogMatch[1], baseUrl);
    if (abs) return abs;
  }
  // Try Twitter
  const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
  if (twMatch?.[1]) {
    const abs = toAbsoluteUrl(twMatch[1], baseUrl);
    if (abs) return abs;
  }
  return null;
}

function extractFavicon(html: string, baseUrl: string): string | null {
  const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
  for (const rel of rels) {
    const re = new RegExp(`<link[^>]+rel=["']${rel.replace(' ', '\\s+')}["'][^>]*href=["']([^"']+)["']`, 'i');
    const m = html.match(re) || html.match(new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]*rel=["']${rel.replace(' ', '\\s+')}["']`, 'i'));
    if (m?.[1]) {
      const abs = toAbsoluteUrl(m[1], baseUrl);
      if (abs) return abs;
    }
  }
  // Default to /favicon.ico
  const fallback = toAbsoluteUrl('/favicon.ico', baseUrl);
  return fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('url');
  if (!target) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(target, { signal: controller.signal, headers: { 'user-agent': 'Mozilla/5.0 (PreviewBot)' } });
    clearTimeout(id);

    if (!res.ok) {
      // Fallback to mShots directly if site blocks HTML fetch
      const shot = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(target)}?w=1200&h=630`;
      return NextResponse.json({ imageUrl: shot, source: 'mshots' });
    }
    const html = await res.text();

    const meta = extractMetaImage(html, target);
    if (meta) {
      return NextResponse.json({ imageUrl: meta, source: 'og' });
    }

    const icon = extractFavicon(html, target);
    if (icon) {
      return NextResponse.json({ imageUrl: icon, source: 'favicon' });
    }

    const shot = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(target)}?w=1200&h=630`;
    return NextResponse.json({ imageUrl: shot, source: 'mshots' });
  } catch (e) {
    const shot = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(target)}?w=1200&h=630`;
    return NextResponse.json({ imageUrl: shot, source: 'mshots' });
  }
}