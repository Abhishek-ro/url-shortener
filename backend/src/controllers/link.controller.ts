import { Request, Response } from 'express';
import {
  createShortLink,
  findLinkByCode,
  incrementClick,
  getAllLinks,
  deleteLink,
  updateLink,
  getTopLinks,
} from '../services/link.service';

import { pushAnalytics } from '../utils/queue';
import { getCachedLink, setCachedLink, deleteCachedLink } from '../utils/cache';

// ------------------------------
// CREATE SHORT URL
// ------------------------------
export async function shortenUrl(req: Request, res: Response) {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const link = await createShortLink(url);
    return res.json(link);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// ------------------------------
// REDIRECT + CACHE + QUEUE ANALYTICS
// ------------------------------
export async function redirectUrl(req: Request, res: Response) {
  try {
    const code = req.params.code as string;

    // 1️⃣ Check Redis first
    const cached = await getCachedLink(code);
    if (cached) {
      console.log('⚡CACHE HIT');

      await incrementClick(cached.id);

      await pushAnalytics({
        linkId: cached.id,
        region: (req.headers['cf-ipcountry'] as string) || 'UNKNOWN',
        userAgent: req.headers['user-agent'] || null,
      });

      return res.redirect(cached.originalUrl);
    }

    // 2️⃣ Cache miss → DB
    const link = await findLinkByCode(code);
    if (!link) return res.status(404).send('Link not found');

    console.log('🐢CACHE MISS → DB HIT');

    await setCachedLink(code, link);

    await incrementClick(link.id);

    await pushAnalytics({
      linkId: link.id,
      region: (req.headers['cf-ipcountry'] as string) || 'UNKNOWN',
      userAgent: req.headers['user-agent'] || null,
    });

    return res.redirect(link.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}

// ------------------------------
// GET TOP LINKS BY CLICKS
// ------------------------------
export async function getTopLinksController(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit) || 10;
    const links = await getTopLinks(limit);
    return res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// ------------------------------
// GET ALL LINKS
// ------------------------------
export async function getLinks(req: Request, res: Response) {
  try {
    const links = await getAllLinks();
    return res.json(links);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// ------------------------------
// DELETE LINK + CLEAR CACHE + ANALYTICS SAFE DELETE
// ------------------------------
export async function deleteLinkController(req: Request, res: Response) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const link = await deleteLink(id);

    if (link) {
      await deleteCachedLink(link.shortCode);
    }

    return res.json({ message: 'Link deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// ------------------------------
// UPDATE LINK + CLEAR CACHE
// ------------------------------
export async function updateLinkController(req: Request, res: Response) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ error: 'originalUrl required' });
    }

    const updated = await updateLink(id, { originalUrl });

    if (updated) {
      await deleteCachedLink(updated.shortCode);
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
