export interface QRConfig {
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  size: number;
  margin: number;
  includeLogo?: boolean;
}

export interface QRResponse {
  qrCodeDataUrl: string;
  config: QRConfig;
}
