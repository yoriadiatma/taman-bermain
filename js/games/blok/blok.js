// blok.js — daftar jenis blok Blok Petualang.
// Nomor id dipakai di array dunia (Uint8Array) dan di data simpanan, jadi jangan
// mengubah nomor yang sudah ada; tambahkan blok baru di akhir daftar.

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
  PAPAN: 12,
  MEJA_KERJA: 13,
  TUNGKU: 14,
  KACA: 15,
  OBOR: 16,
  PINTU: 17,
  PETI: 18, // peti harta terkunci di dalam gua
};

// padat        : tidak bisa ditembus pemain
// cair         : bisa direnangi
// tembusCahaya : tidak membuat blok di bawahnya gelap
// keras        : lama menambang (detik) dengan tangan atau alat yang cocok
// beliung      : tingkat beliung minimal (0 = tangan, 1 = kayu, 2 = batu, 3 = besi); null = tidak bisa ditambang
// jenis        : 'batu' dipercepat oleh beliung
// hasil        : id barang yang didapat ('' = tidak ada)
// cahaya       : jari-jari cahaya (obor)
// Kayu dan daun pohon tidak padat: pemain berjalan di depan pohon, seperti latar.
export const BLOK = {
  [B.UDARA]: { nama: 'Udara', padat: false, beliung: null },
  [B.RUMPUT]: { nama: 'Rumput', padat: true, keras: 0.6, beliung: 0, hasil: 'tanah' },
  [B.TANAH]: { nama: 'Tanah', padat: true, keras: 0.6, beliung: 0, hasil: 'tanah' },
  [B.BATU]: { nama: 'Batu', padat: true, keras: 2.4, beliung: 1, jenis: 'batu', hasil: 'batu' },
  [B.KAYU]: { nama: 'Kayu', padat: false, tembusCahaya: true, keras: 1.2, beliung: 0, hasil: 'kayu' },
  [B.DAUN]: { nama: 'Daun', padat: false, tembusCahaya: true, keras: 0.25, beliung: 0, hasil: 'daun' },
  [B.AIR]: { nama: 'Air', padat: false, cair: true, tembusCahaya: true, beliung: null },
  [B.PASIR]: { nama: 'Pasir', padat: true, keras: 0.5, beliung: 0, hasil: 'pasir' },
  [B.BATU_BARA]: { nama: 'Bijih Batu Bara', padat: true, keras: 2.8, beliung: 1, jenis: 'batu', hasil: 'batu bara' },
  [B.BIJIH_BESI]: { nama: 'Bijih Besi', padat: true, keras: 3.4, beliung: 2, jenis: 'batu', hasil: 'bijih besi' },
  [B.BIJIH_EMAS]: { nama: 'Bijih Emas', padat: true, keras: 3.8, beliung: 3, jenis: 'batu', hasil: 'bijih emas' },
  [B.BATUAN_DASAR]: { nama: 'Batuan Dasar', padat: true, beliung: null },
  [B.PAPAN]: { nama: 'Papan', padat: true, keras: 1.0, beliung: 0, hasil: 'papan' },
  [B.MEJA_KERJA]: { nama: 'Meja Kerja', padat: true, keras: 1.2, beliung: 0, hasil: 'meja kerja' },
  [B.TUNGKU]: { nama: 'Tungku', padat: true, keras: 2.4, beliung: 1, jenis: 'batu', hasil: 'tungku' },
  [B.KACA]: { nama: 'Kaca', padat: true, tembusCahaya: true, keras: 0.5, beliung: 0, hasil: 'kaca' },
  [B.OBOR]: { nama: 'Obor', padat: false, tembusCahaya: true, keras: 0.1, beliung: 0, hasil: 'obor', cahaya: 6 },
  [B.PINTU]: { nama: 'Pintu', padat: false, tembusCahaya: true, keras: 0.8, beliung: 0, hasil: 'pintu' },
  [B.PETI]: { nama: 'Peti Terkunci', padat: true, keras: 0.3, beliung: 0, hasil: '' },
};

export const padat = id => !!BLOK[id]?.padat;
export const cair = id => !!BLOK[id]?.cair;
export const tembusCahaya = id => !BLOK[id]?.padat || !!BLOK[id]?.tembusCahaya;
export const namaBlok = id => BLOK[id]?.nama ?? '?';
/** Blok kosong yang boleh ditimpa saat menaruh blok. */
export const bisaDitimpa = id => id === B.UDARA || id === B.AIR;
