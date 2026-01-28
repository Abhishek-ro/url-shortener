import { Request, Response } from 'express';
import {
  createShortLink,
  findLinkByCode,
  incrementClick,
  getAllLinks,
  deleteLink,
  updateLink,
  getTopLinks,
  getRecentClicks,
} from '../services/link.service';

import { pushAnalytics } from '../utils/queue';
import { getCachedLink, setCachedLink, deleteCachedLink } from '../utils/cache';
import redis from '../config/redis';

export async function shortenUrl(req: Request, res: Response) {
  try {
    const {
      url,
      isProtected,
      password,
      isExpiring,
      expiresAt,
      isRateLimited,
      maxClicksPerMin,
    } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    if (isProtected && !password)
      return res
        .status(400)
        .json({ error: 'Password required for protected links' });
    if (isExpiring && !expiresAt)
      return res.status(400).json({ error: 'Expiration date required' });
    if (expiresAt && new Date(expiresAt) <= new Date())
      return res
        .status(400)
        .json({ error: 'Expiration date must be in the future' });

    console.log('Creating link with options:', {
      isProtected,
      password: password ? '***' : null,
      isExpiring,
      isRateLimited,
    });

    const userId = (req as any).user?.userId || null;

    const link = await createShortLink(url, {
      userId,
      isProtected: isProtected || false,
      password: isProtected ? password : null,
      isExpiring: isExpiring || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isRateLimited: isRateLimited || false,
      maxClicksPerMin: maxClicksPerMin || 100,
    });

    console.log('Link created:', {
      id: link.id,
      isProtected: link.isProtected,
      hasPassword: !!link.password,
    });

    return res.json(link);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function redirectUrl(req: Request, res: Response) {
  try {
    const code = req.params.code as string;

    console.log(`🔗 Redirecting public link: ${code}`);

    const cached = await getCachedLink(code);
    if (cached) {
      console.log('⚡CACHE HIT - Link data:', {
        isProtected: cached.isProtected,
      });

      if (cached.isProtected) {
        console.log(
          '🔐 Link is password protected - redirecting to verification page',
        );
        const verifyUrl = `http://localhost:3000/verify?code=${code}`;
        return res.redirect(302, verifyUrl);
      }

      if (
        cached.isExpiring &&
        cached.expiresAt &&
        new Date(cached.expiresAt) < new Date()
      ) {
        return res.status(410).send('This link has expired');
      }

      if (cached.isRateLimited && cached.maxClicksPerMin) {
        const clicksInLastMinute = await getRecentClicks(cached.id, 60);
        console.log(
          `📊 Rate limiting check: ${clicksInLastMinute}/${cached.maxClicksPerMin} clicks in last minute`,
        );
        if (clicksInLastMinute >= cached.maxClicksPerMin) {
          console.log('❌ Rate limit exceeded!');
          return res.redirect(`http://localhost:3000/rate-limit?code=${code}`);
        }
      }

      // Increment click counter in Redis (fast, non-blocking)
      await incrementClick(cached.id);

      // Record second-level rate-limit counter
      const now = Math.floor(Date.now() / 1000);
      await redis.incr(`rate:${cached.id}:${now}`);
      await redis.expire(`rate:${cached.id}:${now}`, 120);

      // Push analytics event (fire-and-forget)
      await pushAnalytics({
        linkId: cached.id,
        region: (req.headers['cf-ipcountry'] as string) || 'UNKNOWN',
        userAgent: req.headers['user-agent'] || null,
      });

      console.log(`✅ Redirecting to: ${cached.originalUrl}`);
      return res.redirect(302, cached.originalUrl);
    }

    const link = await findLinkByCode(code);
    if (!link) return res.status(404).send('Link not found');

    console.log('🐢CACHE MISS → DB HIT - Link data:', {
      isProtected: link.isProtected,
    });

    if (link.isProtected) {
      console.log(
        '🔐 Link is password protected - redirecting to verification page',
      );
      const verifyUrl = `http://localhost:3000/verify?code=${code}`;
      return res.redirect(302, verifyUrl);
    }

    if (
      link.isExpiring &&
      link.expiresAt &&
      new Date(link.expiresAt) < new Date()
    ) {
      return res.status(410).send('This link has expired');
    }

    if (link.isRateLimited && link.maxClicksPerMin) {
      const clicksInLastMinute = await getRecentClicks(link.id, 60);
      console.log(
        `📊 Rate limiting check: ${clicksInLastMinute}/${link.maxClicksPerMin} clicks in last minute`,
      );
      if (clicksInLastMinute >= link.maxClicksPerMin) {
        console.log('❌ Rate limit exceeded!');
        return res.redirect(`http://localhost:3000/rate-limit?code=${code}`);
      }
    }

    await setCachedLink(code, link);

    // Increment click counter in Redis (fast, non-blocking)
    await incrementClick(link.id);

    // Record second-level rate-limit counter
    const now = Math.floor(Date.now() / 1000);
    await redis.incr(`rate:${link.id}:${now}`);
    await redis.expire(`rate:${link.id}:${now}`, 120);

    // Push analytics event (fire-and-forget)
    await pushAnalytics({
      linkId: link.id,
      region: (req.headers['cf-ipcountry'] as string) || 'UNKNOWN',
      userAgent: req.headers['user-agent'] || null,
    });

    const isAjax =
      req.headers['x-requested-with'] === 'XMLHttpRequest' ||
      (req.query && req.query.xhr === '1');
    console.log('   isAjax request:', isAjax);
    console.log(`✅ Redirecting to: ${link.originalUrl}`);
    if (isAjax) {
      return res.json({ redirect: link.originalUrl });
    }
    return res.redirect(link.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}

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

export async function getLinks(req: Request, res: Response) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500); // Cap at 500
    const offset = Number(req.query.offset) || 0;
    const links = await getAllLinks(limit, offset);
    return res.json({ data: links, limit, offset, count: links.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

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

export async function getRateLimitStatus(req: Request, res: Response) {
  try {
    const rawCode = req.params.code;
    const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
    const link = await findLinkByCode(code);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const clicksInLastMinute = await getRecentClicks(link.id, 60);

    return res.json({
      shortCode: link.shortCode,
      isRateLimited: link.isRateLimited,
      maxClicksPerMin: link.maxClicksPerMin,
      clicksInLastMinute,
      totalClicks: link.clicks,
      canAccess:
        !link.isRateLimited || clicksInLastMinute < link.maxClicksPerMin,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
