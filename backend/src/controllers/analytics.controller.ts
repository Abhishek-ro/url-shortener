import { Request, Response } from 'express';
import { getAnalyticsForCode } from '../services/analytics.service';

export async function getAnalytics(req: Request, res: Response) {
  try {
    const code = req.params.code as string;

    const analytics = await getAnalyticsForCode(code);

    if (!analytics) {
      return res.status(404).json({ error: 'Link not found' });
    }

    return res.json(analytics);
  } catch (err) {
    console.error('Analytics Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
