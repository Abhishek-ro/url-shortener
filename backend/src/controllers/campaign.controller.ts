import { Request, Response } from 'express';
import {
  createCampaign,
  getCampaignById,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
  addLinkToCampaign,
} from '../services/campaign.service';

export async function createCampaignController(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Campaign name required' });
    }

    const campaign = await createCampaign(name, description);
    return res.status(201).json(campaign);
  } catch (err) {
    console.error('Create campaign error:', err);
    return res.status(500).json({ error: 'Failed to create campaign' });
  }
}

export async function getCampaignsController(req: Request, res: Response) {
  try {
    const campaigns = await getAllCampaigns();
    return res.json(campaigns);
  } catch (err) {
    console.error('Get campaigns error:', err);
    return res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
}

export async function getCampaignController(req: Request, res: Response) {
  try {
    const id =
      typeof req.params.id === 'string' ? req.params.id : req.params.id[0];

    if (!id) {
      return res.status(400).json({ error: 'Campaign ID required' });
    }

    const campaign = await getCampaignById(id);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    return res.json(campaign);
  } catch (err) {
    console.error('Get campaign error:', err);
    return res.status(500).json({ error: 'Failed to fetch campaign' });
  }
}

export async function updateCampaignController(req: Request, res: Response) {
  try {
    const id =
      typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const { name, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Campaign ID required' });
    }

    const campaign = await updateCampaign(id, name, description);
    return res.json(campaign);
  } catch (err) {
    console.error('Update campaign error:', err);
    return res.status(500).json({ error: 'Failed to update campaign' });
  }
}

export async function deleteCampaignController(req: Request, res: Response) {
  try {
    const id =
      typeof req.params.id === 'string' ? req.params.id : req.params.id[0];

    if (!id) {
      return res.status(400).json({ error: 'Campaign ID required' });
    }

    await deleteCampaign(id);
    return res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    console.error('Delete campaign error:', err);
    return res.status(500).json({ error: 'Failed to delete campaign' });
  }
}

export async function addLinkToCampaignController(req: Request, res: Response) {
  try {
    const { campaignId, linkId } = req.body;

    if (!campaignId || !linkId) {
      return res
        .status(400)
        .json({ error: 'Campaign ID and Link ID required' });
    }

    const link = await addLinkToCampaign(campaignId, linkId);
    return res.json(link);
  } catch (err) {
    console.error('Add link to campaign error:', err);
    return res.status(500).json({ error: 'Failed to add link to campaign' });
  }
}
