import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Metadata {
  title: string | null;
  description: string | null;
  favicon: string | null;
  url: string;
}

export async function scrapeMetadata(url: string): Promise<Metadata> {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'BoltLinkBot/1.0' },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      null;

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      null;

    const favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '/favicon.ico';

    return {
      title,
      description,
      favicon: absoluteUrl(url, favicon),
      url,
    };
  } catch {
    return {
      title: null,
      description: null,
      favicon: null,
      url,
    };
  }
}

function absoluteUrl(base: string, path: string | undefined) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  try {
    return new URL(path, base).href;
  } catch {
    return null;
  }
}
