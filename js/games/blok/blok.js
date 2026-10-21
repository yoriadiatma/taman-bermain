// blok.js — daftar jenis blok Blok Petualang.
// Kolom `id` dipakai di array dunia (Uint8Array), jadi jangan mengubah nomor yang sudah ada;
// tambahkan blok baru di akhir daftar.

export const B = {
  UDARA: 0,
  RUMPUT: 1,
  TANAH: 2,
  BATU: 3,
  KAYU: 4,
  DAUN: 5,
  AIR: 6,
  PASIR: 7,
  BATU_BARA: 8,
  BIJIH_BESI: 9,
  BIJIH_EMAS: 10,
  BATUAN_DASAR: 11,
};

// padat: tidak bisa ditembus pemain. cair: bisa direnangi.
// tembusCahaya: tidak membuat blok di bawahnya gelap (daun, batang pohon, air).
// Kayu dan daun pohon tidak padat: pemain berjalan di depan pohon, seperti latar.
export const BLOK = {
  [B.UDARA]: { nama: 'Udara', padat: false },
  [B.RUMPUT]: { nama: 'Rumput', padat: true },
  [B.TANAH]: { nama: 'Tanah', padat: true },
  [B.BATU]: { nama: 'Batu', padat: true },
  [B.KAYU]: { nama: 'Kayu', padat: false, tembusCahaya: true },
  [B.DAUN]: { nama: 'Daun', padat: false, tembusCahaya: true },
  [B.AIR]: { nama: 'Air', padat: false, cair: true, tembusCahaya: true },
  [B.PASIR]: { nama: 'Pasir', padat: true },
  [B.BATU_BARA]: { nama: 'Bijih Batu Bara', padat: true },
  [B.BIJIH_BESI]: { nama: 'Bijih Besi', padat: true },
  [B.BIJIH_EMAS]: { nama: 'Bijih Emas', padat: true },
  [B.BATUAN_DASAR]: { nama: 'Batuan Dasar', padat: true },
};

export const padat = id => !!BLOK[id]?.padat;
export const cair = id => !!BLOK[id]?.cair;
export const tembusCahaya = id => !BLOK[id]?.padat || !!BLOK[id]?.tembusCahaya;
export const namaBlok = id => BLOK[id]?.nama ?? '?';
