import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export async function scrapeMetadata(url: string) {
  try {
    const res = await fetch(url, { timeout: 8000 });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('title').text() || null;
    const description = $('meta[name="description"]').attr('content') || null;

    let favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      null;

    // convert relative favicon → absolute URL
    if (favicon && favicon.startsWith('/')) {
      const base = new URL(url);
      favicon = `${base.origin}${favicon}`;
    }

    return { title, description, favicon };
  } catch (err) {
    console.error('Metadata scrape failed:', err);
    return { title: null, description: null, favicon: null };
  }
}
