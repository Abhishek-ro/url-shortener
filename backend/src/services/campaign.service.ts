import prisma from '../config/prisma';

export async function createCampaign(name: string, description?: string) {
  const campaign = await prisma.campaign.create({
    data: {
      name,
      description,
    },
    include: {
      links: true,
    },
  });

  return campaign;
}

export async function getCampaignById(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      links: {
        select: {
          id: true,
          clicks: true,
        },
      },
    },
  });

  if (!campaign) return null;

  const totalLinks = campaign.links.length;
  const totalClicks = campaign.links.reduce(
    (sum, link) => sum + link.clicks,
    0,
  );

  return {
    ...campaign,
    totalLinks,
    totalClicks,
  };
}

export async function getAllCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      links: {
        select: {
          id: true,
          clicks: true,
        },
      },
    },
  });

  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    createdAt: c.createdAt.toISOString(),
    totalLinks: c.links.length,
    totalClicks: c.links.reduce((sum, link) => sum + link.clicks, 0),
  }));
}

export async function updateCampaign(
  id: string,
  name?: string,
  description?: string,
) {
  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
    },
    include: {
      links: {
        select: {
          id: true,
          clicks: true,
        },
      },
    },
  });

  const totalLinks = campaign.links.length;
  const totalClicks = campaign.links.reduce(
    (sum, link) => sum + link.clicks,
    0,
  );

  return {
    ...campaign,
    totalLinks,
    totalClicks,
  };
}

export async function deleteCampaign(id: string) {
  return await prisma.campaign.delete({
    where: { id },
  });
}

export async function addLinkToCampaign(campaignId: string, linkId: string) {
  const link = await prisma.link.update({
    where: { id: linkId },
    data: {
      campaignId,
    },
  });

  return link;
}
