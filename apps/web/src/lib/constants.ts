export const NAV_LINKS = [
  { href: '/', label: 'Trang chủ', icon: 'Home' },
  { href: '/kham-pha', label: 'Khám phá', icon: 'Compass' },
  { href: '/quet-di-san', label: 'Quét di sản', icon: 'Scan' },
  { href: '/thu-thach', label: 'Thử thách', icon: 'HelpCircle' },
  { href: '/ban-do', label: 'Bản đồ', icon: 'Map' },
  { href: '/dia-diem', label: 'Địa điểm', icon: 'MapPin' },
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
