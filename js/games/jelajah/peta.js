// peta.js — bentuk pulau (sederhana), proyeksi, dan tampilan wilayah untuk Jelajah Nusantara.
//
// Bentuk pulau digambar sendiri dari beberapa titik [bujur, lintang] perkiraan, jadi hanya
// menyerupai bentuk aslinya. Peta ini bukan peta berskala dan tidak untuk mengukur jarak.

// Proyeksi sederhana (equirectangular): 1 derajat = SKALA satuan.
export const BUJUR_0 = 94.5;
export const LINTANG_0 = 6.5;
export const SKALA = 20;
export const LEBAR = (141.5 - BUJUR_0) * SKALA; // 940
export const TINGGI = (LINTANG_0 + 11) * SKALA; // 350

export const proyeksi = ([bujur, lintang]) => [(bujur - BUJUR_0) * SKALA, (LINTANG_0 - lintang) * SKALA];

// Pulau-pulau Indonesia, dikelompokkan per wilayah (warna peta).
export const PULAU = [
  { wilayah: 'sumatra', nama: 'Sumatra', titik: [[95.25, 5.6], [95.9, 5.55], [96.6, 5.25], [97.2, 5.2], [97.95, 4.5], [98.7, 3.8], [99.8, 3.0], [100.8, 2.2], [101.45, 1.7], [102.1, 1.45], [102.9, 0.8], [103.3, 0.0], [103.5, -0.8], [103.9, -1.1], [104.4, -1.7], [104.9, -2.3], [105.6, -3.0], [105.85, -4.0], [105.85, -5.0], [105.75, -5.85], [105.3, -5.6], [104.6, -5.9], [103.95, -5.2], [103.0, -4.3], [102.25, -3.8], [101.1, -2.6], [100.55, -1.35], [100.3, -0.9], [99.3, 0.3], [98.8, 1.7], [97.8, 2.3], [97.2, 3.25], [96.1, 4.15], [95.55, 4.65]] },
  { wilayah: 'sumatra', nama: 'Nias', titik: [[97.2, 1.45], [97.55, 1.15], [97.9, 0.6], [97.6, 0.5], [97.3, 0.95]] },
  { wilayah: 'sumatra', nama: 'Siberut', titik: [[98.6, -1.1], [99.2, -1.3], [99.1, -1.6], [98.7, -1.5]] },
  { wilayah: 'sumatra', nama: 'Bangka', titik: [[105.15, -1.95], [105.6, -1.55], [106.0, -1.6], [106.25, -2.1], [106.75, -2.9], [106.6, -3.1], [106.0, -3.0], [105.7, -2.6], [105.2, -2.1]] },
  { wilayah: 'sumatra', nama: 'Belitung', titik: [[107.6, -2.6], [108.2, -2.6], [108.3, -3.1], [107.9, -3.25], [107.6, -3.0]] },
  { wilayah: 'sumatra', nama: 'Bintan', titik: [[104.2, 1.2], [104.65, 1.2], [104.65, 0.85], [104.4, 0.82], [104.2, 0.95]] },
  { wilayah: 'sumatra', nama: 'Batam', titik: [[103.85, 1.15], [104.1, 1.15], [104.1, 0.95], [103.85, 0.98]] },
  { wilayah: 'sumatra', nama: 'Lingga', titik: [[104.35, -0.05], [104.8, -0.1], [104.7, -0.4], [104.4, -0.3]] },
  { wilayah: 'sumatra', nama: 'Natuna', titik: [[107.95, 4.1], [108.4, 4.0], [108.2, 3.6], [107.9, 3.8]] },
  { wilayah: 'jawa', nama: 'Jawa', titik: [[105.2, -6.8], [105.85, -6.0], [106.15, -5.95], [106.8, -6.05], [107.0, -5.95], [107.8, -6.2], [108.35, -6.25], [108.6, -6.75], [109.0, -6.85], [109.7, -6.85], [110.4, -6.95], [110.65, -6.55], [110.9, -6.4], [111.15, -6.65], [111.4, -6.7], [112.05, -6.85], [112.65, -7.0], [112.75, -7.2], [112.9, -7.6], [113.2, -7.72], [114.0, -7.65], [114.45, -7.8], [114.4, -8.2], [114.55, -8.75], [113.5, -8.4], [112.5, -8.4], [111.5, -8.3], [111.1, -8.25], [110.3, -8.05], [109.0, -7.75], [108.65, -7.7], [108.0, -7.8], [107.4, -7.5], [106.5, -7.0], [105.5, -6.9]] },
  { wilayah: 'jawa', nama: 'Madura', titik: [[112.75, -6.9], [113.5, -6.88], [114.1, -6.95], [113.9, -7.15], [113.0, -7.2], [112.78, -7.1]] },
  { wilayah: 'nusa', nama: 'Bali', titik: [[114.45, -8.1], [115.2, -8.05], [115.7, -8.4], [115.15, -8.85], [114.6, -8.4]] },
  { wilayah: 'nusa', nama: 'Lombok', titik: [[115.85, -8.3], [116.4, -8.2], [116.7, -8.55], [116.5, -8.9], [115.85, -8.8]] },
  { wilayah: 'nusa', nama: 'Sumbawa', titik: [[116.8, -8.5], [117.5, -8.3], [118.2, -8.1], [119.0, -8.3], [119.1, -8.7], [118.0, -8.9], [117.0, -9.0]] },
  { wilayah: 'nusa', nama: 'Flores', titik: [[119.8, -8.4], [120.8, -8.3], [122.0, -8.4], [123.0, -8.2], [122.9, -8.6], [121.5, -8.9], [120.0, -8.8]] },
  { wilayah: 'nusa', nama: 'Sumba', titik: [[119.0, -9.4], [120.0, -9.4], [120.8, -10.1], [119.6, -9.9]] },
  { wilayah: 'nusa', nama: 'Timor (bagian Indonesia)', titik: [[123.4, -10.3], [123.8, -10.0], [124.3, -9.5], [124.95, -9.05], [125.05, -9.5], [124.4, -10.0], [123.9, -10.35]] },
  { wilayah: 'kalimantan', nama: 'Kalimantan', titik: [[109.65, 2.05], [109.3, 1.7], [109.0, 1.1], [108.9, 0.4], [109.2, -0.1], [109.6, -0.8], [110.1, -1.5], [110.05, -2.6], [110.25, -2.95], [111.0, -3.05], [111.7, -2.9], [112.3, -3.4], [113.1, -3.15], [114.0, -3.4], [114.5, -3.5], [114.6, -4.15], [115.25, -3.85], [116.0, -3.7], [116.3, -3.0], [116.5, -2.0], [116.6, -1.5], [116.85, -1.2], [117.3, -0.8], [117.5, -0.3], [117.6, 0.3], [118.0, 0.8], [118.95, 1.0], [118.2, 1.6], [117.85, 2.3], [117.6, 3.0], [117.75, 4.15], [116.6, 4.35], [115.85, 4.3], [115.6, 3.9], [115.5, 3.0], [114.8, 2.2], [114.6, 1.45], [113.7, 1.2], [113.0, 1.45], [112.4, 1.55], [111.9, 1.1], [111.2, 1.0], [110.5, 0.9], [109.95, 1.4]] },
  { wilayah: 'sulawesi', nama: 'Sulawesi', titik: [[125.25, 1.6], [124.8, 1.55], [124.3, 1.05], [123.4, 0.95], [122.4, 1.0], [121.5, 1.1], [120.85, 1.3], [120.3, 1.0], [119.85, 0.3], [119.75, -0.6], [119.45, -1.3], [119.2, -2.0], [118.85, -2.7], [118.85, -3.45], [119.5, -3.55], [119.6, -4.1], [119.4, -5.0], [119.45, -5.55], [120.0, -5.6], [120.45, -5.5], [120.35, -4.6], [120.4, -3.6], [120.3, -3.0], [120.75, -2.6], [121.2, -2.75], [121.6, -4.0], [121.9, -4.8], [122.6, -4.7], [122.75, -4.2], [122.4, -3.5], [122.2, -2.9], [121.95, -2.1], [122.6, -1.7], [123.2, -1.3], [123.5, -0.9], [122.85, -0.75], [122.0, -0.9], [121.2, -1.2], [120.75, -1.35], [120.2, -0.9], [120.15, -0.3], [120.6, 0.4], [121.5, 0.45], [122.5, 0.45], [123.1, 0.5], [124.0, 0.6], [124.6, 0.8], [125.2, 1.35]] },
  { wilayah: 'sulawesi', nama: 'Buton dan Muna', titik: [[122.75, -4.5], [123.2, -4.8], [123.05, -5.6], [122.6, -5.4], [122.65, -4.9]] },
  { wilayah: 'sulawesi', nama: 'Selayar', titik: [[120.42, -5.8], [120.58, -5.8], [120.55, -6.5], [120.42, -6.45]] },
  { wilayah: 'maluku', nama: 'Halmahera', titik: [[127.8, 2.2], [128.05, 1.8], [127.95, 1.3], [128.2, 1.05], [128.7, 1.55], [128.75, 1.0], [128.3, 0.65], [128.9, 0.35], [128.6, 0.05], [128.0, 0.35], [128.05, -0.3], [128.25, -0.8], [127.9, -0.75], [127.7, 0.0], [127.7, 0.5], [127.45, 0.85], [127.45, 1.4]] },
  { wilayah: 'maluku', nama: 'Morotai', titik: [[128.2, 2.6], [128.6, 2.5], [128.5, 2.05], [128.2, 2.15]] },
  { wilayah: 'maluku', nama: 'Ternate', titik: [[127.28, 0.86], [127.4, 0.86], [127.4, 0.74], [127.28, 0.74]] },
  { wilayah: 'maluku', nama: 'Bacan', titik: [[127.4, -0.4], [127.8, -0.5], [127.7, -0.8], [127.4, -0.75]] },
  { wilayah: 'maluku', nama: 'Obi', titik: [[127.5, -1.4], [128.0, -1.4], [128.0, -1.7], [127.5, -1.7]] },
  { wilayah: 'maluku', nama: 'Kepulauan Sula', titik: [[124.4, -1.7], [126.2, -1.7], [126.2, -2.0], [124.6, -2.0]] },
  { wilayah: 'maluku', nama: 'Seram', titik: [[128.0, -2.85], [129.5, -2.75], [130.85, -3.1], [130.75, -3.5], [129.5, -3.45], [128.2, -3.35]] },
  { wilayah: 'maluku', nama: 'Ambon', titik: [[127.95, -3.6], [128.35, -3.55], [128.35, -3.8], [128.0, -3.75]] },
  { wilayah: 'maluku', nama: 'Buru', titik: [[126.0, -3.15], [126.8, -3.05], [127.25, -3.4], [126.95, -3.85], [126.2, -3.85], [125.95, -3.5]] },
  { wilayah: 'maluku', nama: 'Kepulauan Aru', titik: [[134.2, -5.6], [134.8, -5.8], [134.7, -6.9], [134.1, -6.6]] },
  { wilayah: 'maluku', nama: 'Kepulauan Tanimbar', titik: [[131.0, -7.3], [131.7, -7.1], [131.5, -8.0], [131.0, -8.0]] },
  { wilayah: 'papua', nama: 'Papua', titik: [[130.95, -0.9], [131.3, -0.5], [132.0, -0.35], [132.9, -0.45], [133.5, -0.7], [134.05, -0.85], [134.2, -1.8], [134.4, -2.6], [134.8, -3.2], [135.3, -3.35], [135.8, -3.2], [136.2, -2.5], [136.4, -2.2], [137.2, -1.6], [138.0, -1.7], [138.9, -2.0], [139.7, -2.3], [140.7, -2.45], [141.0, -2.6], [141.0, -9.1], [140.4, -8.6], [139.4, -8.15], [138.8, -8.4], [138.0, -8.4], [137.7, -7.7], [138.1, -7.0], [137.8, -6.0], [137.3, -5.3], [136.8, -4.85], [135.9, -4.5], [135.0, -4.35], [134.3, -4.0], [133.6, -3.85], [132.9, -4.05], [132.8, -3.5], [132.3, -2.95], [132.0, -2.75], [132.7, -2.45], [133.5, -2.3], [132.6, -2.0], [131.9, -1.6], [131.3, -1.4]] },
  { wilayah: 'papua', nama: 'Waigeo', titik: [[130.5, -0.1], [131.3, -0.2], [131.0, -0.45], [130.5, -0.4]] },
  { wilayah: 'papua', nama: 'Biak', titik: [[135.4, -0.75], [136.2, -0.85], [136.4, -1.1], [135.8, -1.25], [135.4, -1.1]] },
  { wilayah: 'papua', nama: 'Yapen', titik: [[135.9, -1.65], [136.9, -1.65], [136.8, -1.9], [135.9, -1.85]] },
];

// Negara tetangga (abu-abu), sebagai pembanding letak.
export const TETANGGA = [
  { nama: 'Malaysia', label: [102.2, 3.6], titik: [[100.3, 6.5], [102.3, 6.2], [103.4, 4.8], [103.45, 3.6], [103.9, 2.6], [104.25, 1.4], [103.5, 1.3], [102.9, 1.8], [101.4, 2.8], [100.7, 3.9], [100.4, 5.3]] },
  { nama: 'Malaysia', label: [114.2, 3.2], titik: [[109.65, 2.05], [110.4, 1.75], [111.2, 1.65], [111.4, 2.4], [112.0, 2.9], [113.0, 3.2], [113.9, 4.4], [114.6, 4.7], [115.2, 5.0], [115.6, 5.5], [116.1, 6.0], [116.8, 6.9], [117.5, 6.5], [117.7, 5.9], [118.5, 5.6], [119.3, 5.3], [118.5, 4.6], [118.0, 4.3], [117.75, 4.15], [116.6, 4.35], [115.85, 4.3], [115.6, 3.9], [115.5, 3.0], [114.8, 2.2], [114.6, 1.45], [113.7, 1.2], [113.0, 1.45], [112.4, 1.55], [111.9, 1.1], [111.2, 1.0], [110.5, 0.9], [109.95, 1.4]] },
  { nama: 'Filipina', label: [125.3, 6.1], titik: [[124.0, 6.6], [125.0, 5.9], [125.6, 5.6], [126.2, 6.3], [126.3, 6.6]] },
  { nama: 'Timor Leste', label: [126.0, -8.75], titik: [[124.95, -9.05], [125.6, -8.6], [126.5, -8.45], [127.3, -8.4], [126.6, -8.9], [125.8, -9.2], [125.05, -9.5]] },
  { nama: 'Papua Nugini', label: [141.3, -5.5], titik: [[141.0, -2.6], [142.0, -3.1], [142.0, -9.3], [141.0, -9.1]] },
];

// Kotak tampilan tiap wilayah [bujurBarat, lintangUtara, bujurTimur, lintangSelatan] dan letak kapal (di laut).
export const TAMPILAN = {
  indonesia: { kotak: [94.4, 6.6, 142.3, -11.4], kapal: [112.0, -4.9] },
  sumatra: { kotak: [94.6, 6.0, 109.0, -6.3], kapal: [98.5, -2.8] },
  jawa: { kotak: [104.0, -5.3, 115.0, -9.2], kapal: [108.5, -8.5] },
  nusa: { kotak: [114.2, -7.6, 125.6, -10.9], kapal: [121.0, -10.0] },
  kalimantan: { kotak: [108.3, 4.6, 119.5, -4.6], kapal: [112.5, -4.2] },
  sulawesi: { kotak: [118.3, 2.0, 125.8, -6.2], kapal: [117.9, -4.5] },
  maluku: { kotak: [124.2, 3.0, 131.4, -4.4], kapal: [126.2, -1.0] },
  papua: { kotak: [129.8, 0.6, 141.5, -9.6], kapal: [136.0, -7.0] },
};

/** Titik di dalam poligon (ray casting). Koordinat [bujur, lintang]. */
export function diDalam([x, y], titik) {
  let dalam = false;
  for (let i = 0, j = titik.length - 1; i < titik.length; j = i++) {
    const [xi, yi] = titik[i];
    const [xj, yj] = titik[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dalam = !dalam;
  }
  return dalam;
}

/** Pulau tempat sebuah titik berada, atau null jika di laut. */
export const pulauDi = pos => PULAU.find(p => diDalam(pos, p.titik)) || null;

/** Atribut `d` path SVG dari daftar titik [bujur, lintang]. */
export function jalurSvg(titik) {
  return titik.map((t, i) => {
    const [x, y] = proyeksi(t);
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join('') + 'Z';
}

/** Kotak tampilan (satuan SVG) untuk sebuah wilayah, dilebarkan agar sesuai rasio layar (lebar/tinggi). */
export function kotakTampilan(id, rasio) {
  const [b, u, t, s] = (TAMPILAN[id] ?? TAMPILAN.indonesia).kotak;
  const [x1, y1] = proyeksi([b, u]);
  const [x2, y2] = proyeksi([t, s]);
  let w = x2 - x1;
  let h = y2 - y1;
  const cx = x1 + w / 2;
  const cy = y1 + h / 2;
  if (w / h < rasio) w = h * rasio; else h = w / rasio;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** Batasi tampilan agar tidak terlalu jauh dari peta dan tidak terlalu dekat/jauh. */
export function batasiTampilan(v, rasio) {
  const wMaks = Math.max(LEBAR, TINGGI * rasio) * 1.15;
  const wMin = 60;
  const w = Math.min(wMaks, Math.max(wMin, v.w));
  const h = w / rasio;
  const cx = Math.min(LEBAR, Math.max(0, v.x + v.w / 2));
  const cy = Math.min(TINGGI, Math.max(0, v.y + v.h / 2));
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/**
 * Arah mata angin sebuah provinsi dibanding provinsi lain di wilayahnya.
 * Mengembalikan mis. 'utara', 'barat daya', atau 'tengah'.
 */
export function arahDalamWilayah(pos, semuaPos) {
  const xs = semuaPos.map(p => p[0]);
  const ys = semuaPos.map(p => p[1]);
  // Dibandingkan dengan titik tengah kotak semua pin, dan rentang terpanjang (agar pulau memanjang seperti Jawa tetap masuk akal).
  const tengah = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const rentang = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
  const dx = (pos[0] - tengah[0]) / rentang;
  const dy = (pos[1] - tengah[1]) / rentang;
  const ambang = 0.18;
  const uS = dy > ambang ? 'utara' : dy < -ambang ? 'selatan' : '';
  const bT = dx > ambang ? 'timur' : dx < -ambang ? 'barat' : '';
  if (uS && bT) return { 'utara-barat': 'barat laut', 'utara-timur': 'timur laut', 'selatan-barat': 'barat daya', 'selatan-timur': 'tenggara' }[`${uS}-${bT}`];
  return uS || bT || 'tengah';
}
