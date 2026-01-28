import apiService from './api.service';

export const getUrlMetadata = async (url: string) => {
  try {
    const response = await apiService.post('/metadata', { url });
    return response.data;
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return {
      title: null,
      description: null,
      image: null,
      favicon: null,
    };
  }
};
