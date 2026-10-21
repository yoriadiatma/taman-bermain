// bidak.js — gambar bidak catur dengan SVG (tanpa file gambar).
// Semua bidak digambar di kotak 45x45 dari bentuk sederhana.

const WARNA = {
  w: { isi: '#fbfbf8', garis: '#1f2430', detail: '#1f2430' },
  b: { isi: '#2b2f3a', garis: '#0b0d12', detail: '#f1f3f5' },
};

const ALAS = '<rect x="9" y="35" width="27" height="5" rx="1.5"/>';

const BENTUK = {
  p: () => `
    <circle cx="22.5" cy="12.5" r="5.5"/>
    <ellipse cx="22.5" cy="21" rx="7" ry="2.5"/>
    <path d="M17 23 L28 23 L31 35 L14 35 Z"/>
    ${ALAS}`,
  r: () => `
    <path d="M11 9 L15 9 L15 12 L19 12 L19 9 L26 9 L26 12 L30 12 L30 9 L34 9 L34 17 L11 17 Z"/>
    <rect x="14" y="17" width="17" height="14"/>
    <rect x="11" y="31" width="23" height="4"/>
    ${ALAS}`,
  b: d => `
    <circle cx="22.5" cy="6" r="2.5"/>
    <path d="M22.5 8 C30 13, 30 22, 22.5 26 C15 22, 15 13, 22.5 8 Z"/>
    <line x1="25.5" y1="13" x2="20" y2="19" stroke="${d}" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="15" y="26" width="15" height="3" rx="1"/>
    <path d="M17 29 L28 29 L30 35 L15 35 Z"/>
    ${ALAS}`,
  n: d => `
    <path d="M14 35 L31 35 L30 29 C30 21, 33 17, 31 12 C29 7, 24 5, 20 6 L18 3 L16 7
      C12 9, 8 14, 8 19 L11 22 L17 19 C18 23, 15 26, 14 30 Z"/>
    <circle cx="18" cy="11.5" r="1.4" fill="${d}" stroke="none"/>
    ${ALAS}`,
  q: () => `
    <circle cx="10" cy="12" r="2.2"/><circle cx="16" cy="9" r="2.2"/><circle cx="22.5" cy="7" r="2.2"/>
    <circle cx="29" cy="9" r="2.2"/><circle cx="35" cy="12" r="2.2"/>
    <path d="M10 13 L14 25 L16 10 L19.5 23 L22.5 8 L25.5 23 L29 10 L31 25 L35 13 L32 31 L13 31 Z"/>
    <rect x="11" y="31" width="23" height="4"/>
    ${ALAS}`,
  k: () => `
    <rect x="21" y="2" width="3" height="10"/>
    <rect x="17.5" y="5" width="10" height="3"/>
    <ellipse cx="22.5" cy="15" rx="4" ry="3"/>
    <path d="M12 31 C9 22, 15 15, 22.5 18 C30 15, 36 22, 33 31 Z"/>
    <rect x="11" y="31" width="23" height="4"/>
    ${ALAS}`,
};

const cache = new Map();

/** String SVG untuk bidak FEN ('P', 'n', ...). */
export function svgBidak(bidak) {
  if (!cache.has(bidak)) {
    const w = bidak === bidak.toUpperCase() ? 'w' : 'b';
    const c = WARNA[w];
    cache.set(bidak, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" aria-hidden="true">
      <g fill="${c.isi}" stroke="${c.garis}" stroke-width="1.5" stroke-linejoin="round">${BENTUK[bidak.toLowerCase()](c.detail)}</g></svg>`);
  }
  return cache.get(bidak);
}
