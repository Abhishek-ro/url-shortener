import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeMetadata(url: string) {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'BoltLinkBot/1.0' },
      maxRedirects: 5,
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

    let favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '/favicon.ico';

    // Convert relative favicon URL to absolute
    if (favicon && favicon.startsWith('/')) {
      const base = new URL(url);
      favicon = `${base.origin}${favicon}`;
    }

    return { title, description, favicon };
  } catch (err) {
    console.warn(
      `⚠️  Metadata scrape failed for ${url}:`,
      (err as any).message,
    );
    return { title: null, description: null, favicon: null };
  }
}
