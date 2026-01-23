import { Router } from 'express';
import {
  shortenUrl,
  redirectUrl,
  getLinks,
  deleteLinkController,
  updateLinkController,
  getTopLinksController,
} from '../controllers/link.controller';
import { generateApiKey } from '../services/apiKey.service';
import { getAnalytics } from '../controllers/analytics.controller';
import { shortenLimiter, redirectLimiter } from '../utils/ratelimit';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { scrapeMetadata } from '../services/metadata.service';





const router = Router();
router.post('/shorten',apiKeyAuth, shortenLimiter, shortenUrl);
router.post('/generate-key', async (req, res) => {
  const key = await generateApiKey();
  res.json({ apiKey: key });
});

router.get('/links',apiKeyAuth, getLinks);
router.get('/analytics/:code',apiKeyAuth, getAnalytics);
router.delete('/links/:id', apiKeyAuth,deleteLinkController);
router.patch('/links/:id', apiKeyAuth,updateLinkController);
router.get('/top-links', getTopLinksController);
router.post('/metadata', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'URL missing' });

  const data = await scrapeMetadata(url);

  res.json(data);
});


router.get('/:code', redirectLimiter, redirectUrl);

// redirect (must be last)
router.get('/:code', redirectUrl);

export default router;
