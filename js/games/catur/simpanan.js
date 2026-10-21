// simpanan.js — data Catur yang disimpan per profil (lewat ctx.store).
//   'permainan'  : permainan berjalan { mode, tingkat, warnaPemain, fenAwal, langkah, putar, tercatat }
//   'pengaturan' : { langkahLegal, terancam }
//   'statistik'  : { duaPemain: {...}, komputer: { mudah: {...}, sedang: {...}, sulit: {...} } }
//   'puzzle'     : daftar id puzzle yang sudah selesai
//   'belajar'    : daftar id pelajaran Belajar Bidak yang sudah selesai

export const PENGATURAN_BAWAAN = { langkahLegal: true, terancam: false };
const HASIL_KOSONG = { menang: 0, kalah: 0, remis: 0 };

export const bacaPengaturan = store => ({ ...PENGATURAN_BAWAAN, ...store.get('pengaturan', {}) });
export const ubahPengaturan = (store, perubahan) => store.set('pengaturan', { ...bacaPengaturan(store), ...perubahan });

export function bacaStatistik(store) {
  const s = store.get('statistik', {});
  return {
    duaPemain: { selesai: 0, menangPutih: 0, menangHitam: 0, remis: 0, ...s.duaPemain },
    komputer: {
      mudah: { ...HASIL_KOSONG, ...s.komputer?.mudah },
      sedang: { ...HASIL_KOSONG, ...s.komputer?.sedang },
      sulit: { ...HASIL_KOSONG, ...s.komputer?.sulit },
    },
  };
}

export const simpanStatistik = (store, stat) => store.set('statistik', stat);

export const daftarSelesai = (store, kunci) => store.get(kunci, []);

export function tandaiSelesai(store, kunci, id) {
  const d = daftarSelesai(store, kunci);
  if (!d.includes(id)) store.set(kunci, [...d, id]);
}
