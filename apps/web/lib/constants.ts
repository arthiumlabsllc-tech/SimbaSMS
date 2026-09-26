// Shared constants and types for SimbaSMS frontend
// Inlined from @simbasms/shared for Vercel deployment compatibility

export const SUPPORTED_SERVICES = [
  'gmail',
  'openai',
  'whatsapp',
  'telegram',
  'tinder',
  'twitter',
  'facebook',
  'instagram',
  'tiktok',
  'snapchat',
  'discord',
  'signal',
  'wechat',
  'line',
  'viber',
  'kakao',
  'grab',
  'uber',
] as const;

export const SUPPORTED_COUNTRIES = [
  'US', 'GB', 'NG', 'GH', 'ZA', 'KE', 'IN', 'PH', 'ID', 'BR',
  'MX', 'AR', 'CO', 'PE', 'CL', 'DE', 'FR', 'ES', 'IT', 'NL',
  'BE', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'SK', 'HU', 'RO',
  'BG', 'HR', 'RS', 'UA', 'TR', 'RU', 'CN', 'JP', 'KR', 'AU',
  'NZ', 'CA', 'TH', 'VN', 'MY', 'SG',
] as const;

export const SERVICE_LABELS: Record<string, string> = {
  gmail: 'Gmail',
  openai: 'OpenAI',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  tinder: 'Tinder',
  twitter: 'Twitter/X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  discord: 'Discord',
  signal: 'Signal',
  wechat: 'WeChat',
  line: 'LINE',
  viber: 'Viber',
  kakao: 'KakaoTalk',
  grab: 'Grab',
  uber: 'Uber',
};

export const COUNTRY_LABELS: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', NG: 'Nigeria', GH: 'Ghana',
  ZA: 'South Africa', KE: 'Kenya', IN: 'India', PH: 'Philippines',
  ID: 'Indonesia', BR: 'Brazil', MX: 'Mexico', AR: 'Argentina',
  DE: 'Germany', FR: 'France', ES: 'Spain', IT: 'Italy',
  CA: 'Canada', AU: 'Australia', JP: 'Japan', KR: 'South Korea',
  CN: 'China', RU: 'Russia', TR: 'Turkey', TH: 'Thailand',
  VN: 'Vietnam', MY: 'Malaysia', SG: 'Singapore',
};
