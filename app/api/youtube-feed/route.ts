import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CHANNEL_ID = "UCrvIQ6LRPfqgCG5X7eMItWA";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_DURATION_MS = 20 * 60 * 1000; // 20 minutes cache
const CACHE_FILE = path.join(process.cwd(), "youtube-shorts-cache.json");

interface VideoItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnailUrl: string;
}

interface CacheData {
  videos: VideoItem[];
  shorts: VideoItem[];
  timestamp: number;
}

let memoryCache: CacheData | null = null;

async function loadShortsCache(): Promise<Record<string, boolean>> {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveShortsCache(cache: Record<string, boolean>) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (_e) {
  }
}

async function checkIsShort(id: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${id}`, {
      method: "HEAD",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

export async function GET() {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json(memoryCache);
  }

  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: 1200 } // Next.js level cache (20 mins)
    });

    if (!res.ok) {
      throw new Error("Failed to fetch RSS feed");
    }

    const xml = await res.text();
    const entries = xml.split("<entry>");
    entries.shift(); // Remove content before first entry

    const allItems: VideoItem[] = [];

    for (const entry of entries) {
      const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
      const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
      
      if (idMatch && titleMatch) {
        const id = idMatch[1];
        allItems.push({
          id,
          title: titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1"),
          url: `https://www.youtube.com/watch?v=${id}`,
          publishedAt: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
          thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`
        });
      }
    }

    // Load persistent file cache for shorts classification
    const shortsCache = await loadShortsCache();
    let cacheUpdated = false;

    // Classify into videos and shorts (utilizing file cache to avoid checking already classified videos)
    const classifications = await Promise.all(
      allItems.map(async (item) => {
        if (item.id in shortsCache) {
          return { item, isShort: shortsCache[item.id] };
        }
        const isShort = await checkIsShort(item.id);
        shortsCache[item.id] = isShort;
        cacheUpdated = true;
        return { item, isShort };
      })
    );

    if (cacheUpdated) {
      await saveShortsCache(shortsCache);
    }

    const videos: VideoItem[] = [];
    const shorts: VideoItem[] = [];

    for (const { item, isShort } of classifications) {
      if (isShort) {
        // Update URL to short format
        item.url = `https://www.youtube.com/shorts/${item.id}`;
        shorts.push(item);
      } else {
        videos.push(item);
      }
    }

    // Keep only latest 8 of each as per requirements
    const result: CacheData = {
      videos: videos.slice(0, 8),
      shorts: shorts.slice(0, 8),
      timestamp: now
    };

    memoryCache = result;
    return NextResponse.json(result);
  } catch (_error: any) {
    // Return stale cache if available on failure
    if (memoryCache) {
      return NextResponse.json(memoryCache);
    }
    return NextResponse.json({ error: "Failed to load YouTube feed" }, { status: 500 });
  }
}
