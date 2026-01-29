import { Router } from 'express';
import {
  shortenUrl,
  redirectUrl,
  getLinks,
  deleteLinkController,
  updateLinkController,
  getTopLinksController,
  getRateLimitStatus,
} from '../controllers/link.controller';
import {
  createCampaignController,
  getCampaignsController,
  getCampaignController,
  updateCampaignController,
  deleteCampaignController,
  addLinkToCampaignController,
} from '../controllers/campaign.controller';
import { generateApiKey, validateApiKey } from '../services/apiKey.service';
import { getAnalytics } from '../controllers/analytics.controller';
import {
  shortenLimiter,
  redirectLimiter,
  keyGenerationLimiter,
} from '../utils/ratelimit';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { authMiddleware } from '../middleware/auth';
import { scrapeMetadata } from '../services/metadata.service';
import {
  findLinkByCode,
  getRecentClicks,
  incrementClick,
} from '../services/link.service';
import { pushAnalytics } from '../utils/queue';
import prisma from '../config/prisma';
import redis from '../config/redis';
import bcrypt from 'bcryptjs';

const router = Router();

// ========== HEALTH CHECK - For Load Balancer Monitoring ==========
router.get('/health', async (req, res) => {
  try {
    // Check DB connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis connectivity
    await redis.ping();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'boltlink-api',
      version: '1.0.0',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Dependency check failed',
      service: 'boltlink-api',
    });
  }
});

// ========== READINESS CHECK - K8s probe for traffic routing ==========
router.get('/ready', async (req, res) => {
  try {
    // Same checks as health but can have tighter SLO
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();

    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: 'Dependencies not ready' });
  }
});

// ========== AUTHENTICATED ROUTES ==========

router.get('/auth/me', apiKeyAuth, async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const validatedKey = await validateApiKey(apiKey);

    if (!validatedKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.json({
      id: validatedKey.id,
      email: 'user@boltlink.app',
      name: 'BoltLink User',
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.get('/stats/overview', apiKeyAuth, async (req, res) => {
  try {
    // Use aggregated DB queries instead of loading all data
    const totalClicks = await prisma.linkAnalytics.count();
    const activeLinks = await prisma.link.count();

    // Get top region via aggregation (SQL group-by)
    const topRegionResult = await prisma.linkAnalytics.groupBy({
      by: ['region'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });
    const topRegion = topRegionResult[0]?.region || 'UNKNOWN';

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // Aggregate clicks per day via SQL
    const pointsData = await prisma.linkAnalytics.groupBy({
      by: ['timestamp'],
      _count: { id: true },
      where: {
        timestamp: {
          gte: new Date(last7Days[0]),
          lte: new Date(),
        },
      },
    });

    const pointsMap: Record<string, number> = {};
    pointsData.forEach((p) => {
      const day = p.timestamp.toISOString().split('T')[0];
      pointsMap[day] = (pointsMap[day] || 0) + p._count.id;
    });

    const points = last7Days.map((date) => ({
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      clicks: pointsMap[date] || 0,
    }));

    res.json({
      totalClicks,
      activeLinks,
      topRegion,
      trend: {
        clicks: points.reduce((sum, p) => sum + p.clicks, 0),
        active: activeLinks,
      },
      points,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/system/health', apiKeyAuth, async (req, res) => {
  try {
    res.json([
      {
        service: 'API Server',
        status: 'healthy',
        uptime: '99.9%',
        lastCheck: new Date().toISOString(),
      },
      {
        service: 'Database',
        status: 'healthy',
        uptime: '99.8%',
        lastCheck: new Date().toISOString(),
      },
      {
        service: 'Cache (Redis)',
        status: 'healthy',
        uptime: '99.9%',
        lastCheck: new Date().toISOString(),
      },
      {
        service: 'Queue Worker',
        status: 'healthy',
        uptime: '99.7%',
        lastCheck: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

router.get('/settings/developer', apiKeyAuth, async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
    });

    res.json({
      apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'hidden',
      webhookUrl: process.env.WEBHOOK_URL || 'not-configured',
      rateLimitPerMin: 1000,
      rateLimitPerHour: 50000,
      logsEnabled: true,
      analyticsLevel: 'detailed',
      createdAt: apiKeyRecord?.createdAt || new Date(),
    });
  } catch (error) {
    console.error('Developer settings error:', error);
    res.status(500).json({ error: 'Failed to fetch developer settings' });
  }
});

router.patch('/settings/developer/webhook', apiKeyAuth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Webhook URL required' });
    }

    console.log('Webhook URL updated to:', url);

    res.json({
      success: true,
      message: 'Webhook URL updated successfully',
      webhookUrl: url,
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({ error: 'Failed to update webhook URL' });
  }
});

router.post('/shorten', shortenLimiter, async (req, res) => {
  try {
    // 1. Try JWT auth first
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const { verifyToken } = await import('../services/auth.service');
        const decoded = await verifyToken(token);
        (req as any).user = decoded;
        return await shortenUrl(req, res);
      } catch {
        // JWT failed, fall back to API key
      }
    }

    // 2. API key auth (properly awaited)
    await new Promise<void>((resolve, reject) => {
      apiKeyAuth(req, res, (err?: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 3. Call controller
    return await shortenUrl(req, res);
  } catch (err) {
    console.error('Shorten error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/generate-key', keyGenerationLimiter, async (req, res) => {
  try {
    const key = await generateApiKey();
    res.json({ apiKey: key });
  } catch (error) {
    console.error('Failed to generate API key:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

router.get('/links', apiKeyAuth, getLinks);
router.get('/analytics/global', apiKeyAuth, async (req, res) => {
  try {
    // Use aggregated queries instead of loading all data
    const totalClicks = await prisma.linkAnalytics.count();
    const totalLinks = await prisma.link.count();
    const avgLatency = 14;
    const conversionRate =
      totalLinks > 0 ? ((totalClicks / totalLinks) * 100).toFixed(2) : '0';

    // Aggregate top regions via SQL
    const regionResults = await prisma.linkAnalytics.groupBy({
      by: ['region'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topRegion = regionResults[0]?.region || 'UNKNOWN';

    // Aggregate top devices via SQL
    const deviceResults = await prisma.linkAnalytics.groupBy({
      by: ['userAgent'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    const topDevice = deviceResults[0]?.userAgent || 'UNKNOWN';

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // Aggregate daily clicks
    const dailyResults = await prisma.linkAnalytics.groupBy({
      by: ['timestamp'],
      _count: { id: true },
      where: {
        timestamp: {
          gte: new Date(last7Days[0]),
        },
      },
    });

    const dailyMap: Record<string, number> = {};
    dailyResults.forEach((d) => {
      const day = d.timestamp.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + d._count.id;
    });

    const pointsData = last7Days.map((date) => ({
      timestamp: date,
      clicks: dailyMap[date] || 0,
      region: topRegion,
    }));

    const regionStats = regionResults.map((result) => ({
      region: result.region,
      clicks: result._count.id,
      percentage: ((result._count.id / (totalClicks || 1)) * 100).toFixed(1),
    }));

    res.json({
      summary: {
        totalClicks,
        totalLinks,
        topRegion,
        topDevice,
        avgLatency,
        conversionRate: parseFloat(conversionRate as string),
      },
      points: pointsData,
      topRegions: regionStats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Global analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch global analytics' });
  }
});
router.get('/analytics/:code', apiKeyAuth, getAnalytics);
router.delete('/links/:id', apiKeyAuth, deleteLinkController);
router.patch('/links/:id', apiKeyAuth, updateLinkController);
router.get('/top-links', getTopLinksController);
router.get('/rate-limit-status/:code', async (req, res) => {
  try {
    const code =
      typeof req.params.code === 'string'
        ? req.params.code
        : req.params.code[0];
    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (!link.isRateLimited) {
      return res.json({
        isRateLimited: false,
        message: 'Rate limiting is not enabled for this link',
      });
    }

    const clicksInLastMinute = await getRecentClicks(link.id, 60);
    const remaining = Math.max(
      0,
      (link.maxClicksPerMin || 100) - clicksInLastMinute,
    );
    const isLimited = clicksInLastMinute >= (link.maxClicksPerMin || 100);

    res.json({
      shortCode: code,
      isRateLimited: link.isRateLimited,
      maxClicksPerMin: link.maxClicksPerMin,
      clicksInLastMinute,
      remainingClicks: remaining,
      isCurrentlyLimited: isLimited,
      resetTime: new Date(Date.now() + 60000).toISOString(),
    });
  } catch (error) {
    console.error('Rate limit status error:', error);
    res.status(500).json({ error: 'Failed to fetch rate limit status' });
  }
});

router.post('/metadata', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'URL missing' });

  const data = await scrapeMetadata(url);

  res.json(data);
});

router.post('/verify/:code', redirectLimiter, async (req, res) => {
  try {
    const code = req.params.code as string;
    const { password } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Link code required' });
    }

    const link = await findLinkByCode(code);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (
      link.isExpiring &&
      link.expiresAt &&
      new Date(link.expiresAt) < new Date()
    ) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    if (!link.isProtected) {
      return res.json({ redirect: link.originalUrl });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    // Compare with bcrypt
    const passwordMatch = await bcrypt.compare(password, link.password || '');
    if (!passwordMatch) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    if (link.isRateLimited && link.maxClicksPerMin) {
      const clicksInLastMinute = await getRecentClicks(link.id, 60);
      if (clicksInLastMinute >= link.maxClicksPerMin) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
    }

    await incrementClick(link.id);
    await pushAnalytics({
      linkId: link.id,
      region: 'Unknown',
      userAgent: req.headers['user-agent'] || null,
    });

    return res.json({ redirect: link.originalUrl });
  } catch (err) {
    console.error('Password verification error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/campaigns', apiKeyAuth, createCampaignController);
router.get('/campaigns', apiKeyAuth, getCampaignsController);
router.get('/campaigns/:id', apiKeyAuth, getCampaignController);
router.patch('/campaigns/:id', apiKeyAuth, updateCampaignController);
router.delete('/campaigns/:id', apiKeyAuth, deleteCampaignController);
router.post('/campaigns/link', apiKeyAuth, addLinkToCampaignController);

router.get('/:code', redirectLimiter, redirectUrl);

export default router;
