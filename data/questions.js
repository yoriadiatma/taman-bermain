// questions.js — bank soal Taman Game Belajar (kelas 4–6, Kurikulum Merdeka).
//
// Soal dibagi per mapel di folder data/soal/. Guru boleh menambah soal dengan
// format yang sama di file mapel yang sesuai. Kolom `mapel` diisi otomatis di sini.
//
// Format satu soal:
// {
//   id: 'mtk4-01',            // unik di seluruh bank
//   kelas: 4,                 // 4, 5, atau 6
//   topik: 'Pecahan',         // ditampilkan di statistik Mode Guru
//   tipe: 'pilihan',          // 'pilihan' | 'angka' | 'teks' | 'urutan'
//   pertanyaan: '...',
//   pilihan: ['A', 'B', 'C'], // hanya untuk tipe 'pilihan'
//   jawaban: 'B',             // pilihan: teks pilihan yang benar
//                             // angka: number, mis. 3.75 (anak boleh mengetik "3,75")
//                             // teks: string, atau daftar jawaban yang diterima ['rendah', 'pendek']
//                             //       (huruf besar/kecil dan titik di akhir diabaikan)
//                             // urutan: daftar item dalam urutan yang benar (diacak saat tampil)
//   petunjuk: '...',          // muncul setelah jawaban pertama salah
//   penjelasan: '...',        // muncul setelah soal selesai
//   cek: true,                // opsional: soal perlu diverifikasi guru (tampil di Mode Guru)
// }

import matematika from './soal/matematika.js';
import bahasa from './soal/bahasa.js';
import ipa from './soal/ipa.js';
import nusantara from './soal/nusantara.js';
import pai from './soal/pai.js';

const beriMapel = (mapel, daftar) => daftar.map(s => ({ mapel, ...s }));

export const SOAL = [
  ...beriMapel('matematika', matematika),
  ...beriMapel('bahasa', bahasa),
  ...beriMapel('ipa', ipa),
  ...beriMapel('nusantara', nusantara),
  ...beriMapel('pai', pai),
];
