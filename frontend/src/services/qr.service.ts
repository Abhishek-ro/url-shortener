import QRCode from 'qrcode';

export interface QRConfig {
  fgColor?: string;
  bgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  size?: number;
}

export const generateQRCode = async (
  url: string,
  config?: QRConfig,
): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: config?.level || 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: config?.size || 300,
      color: {
        dark: config?.fgColor || '#000000',
        light: config?.bgColor || '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};
