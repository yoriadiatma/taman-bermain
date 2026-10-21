// mapel.js — daftar mata pelajaran yang dipakai label kartu game dan bank soal.
// Kelas 4 = Fase B, kelas 5-6 = Fase C (Kurikulum Merdeka).

export const MAPEL = {
  matematika: { nama: 'Matematika', warna: '#1c6fd1' },
  bahasa: { nama: 'Bahasa Indonesia', warna: '#b8430c' },
  ipa: { nama: 'IPA', warna: '#237032' },
  nusantara: { nama: 'Pengetahuan Umum', warna: '#862e9c' },
  pai: { nama: 'Pendidikan Agama Islam', warna: '#0b7285' },
  // Label untuk game strategi (mis. catur); tidak punya soal di bank soal.
  logika: { nama: 'Logika & Strategi', warna: '#5f3dc4', tanpaSoal: true },
};

export const namaMapel = id => MAPEL[id]?.nama ?? id;

/** Mapel yang dipakai di bank soal. */
export const MAPEL_SOAL = Object.keys(MAPEL).filter(id => !MAPEL[id].tanpaSoal);
