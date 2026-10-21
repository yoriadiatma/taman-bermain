// resep.js — resep membuat barang (crafting) dan soal hitungan untuk setiap resep.
//
// Membuat barang adalah bagian dari belajar: sebelum barang jadi, anak menghitung
// jumlah bahan atau hasilnya (perkalian/pembagian).

export const RESEP = [
  { id: 'papan', hasil: 'papan', jumlah: 2, bahan: [['kayu', 1]], stasiun: null },
  { id: 'tongkat', hasil: 'tongkat', jumlah: 4, bahan: [['papan', 2]], stasiun: null },
  { id: 'meja kerja', hasil: 'meja kerja', jumlah: 1, bahan: [['papan', 4]], stasiun: null },
  { id: 'obor', hasil: 'obor', jumlah: 4, bahan: [['tongkat', 1], ['batu bara', 1]], stasiun: null },
  { id: 'pintu', hasil: 'pintu', jumlah: 1, bahan: [['papan', 2]], stasiun: 'meja' },
  { id: 'beliung kayu', hasil: 'beliung kayu', jumlah: 1, bahan: [['papan', 3], ['tongkat', 2]], stasiun: 'meja' },
  { id: 'beliung batu', hasil: 'beliung batu', jumlah: 1, bahan: [['batu', 3], ['tongkat', 2]], stasiun: 'meja' },
  { id: 'tungku', hasil: 'tungku', jumlah: 1, bahan: [['batu', 8]], stasiun: 'meja' },
  { id: 'besi', hasil: 'besi', jumlah: 1, bahan: [['bijih besi', 1], ['batu bara', 1]], stasiun: 'tungku' },
  { id: 'emas', hasil: 'emas', jumlah: 1, bahan: [['bijih emas', 1], ['batu bara', 1]], stasiun: 'tungku' },
  { id: 'kaca', hasil: 'kaca', jumlah: 1, bahan: [['pasir', 1], ['batu bara', 1]], stasiun: 'tungku' },
  { id: 'beliung besi', hasil: 'beliung besi', jumlah: 1, bahan: [['besi', 3], ['tongkat', 2]], stasiun: 'meja' },
  { id: 'rumah kecil', hasil: 'rumah kecil', jumlah: 1, bahan: [['papan', 16], ['kaca', 1], ['pintu', 1]], stasiun: 'meja' },
];

export const NAMA_STASIUN = { meja: 'Meja Kerja', tungku: 'Tungku' };

/** Berapa kali resep ini bisa dibuat dengan isi tas sekarang. */
export function maksKali(resep, inv) {
  return Math.min(...resep.bahan.map(([id, n]) => Math.floor(inv.jumlah(id) / n)));
}

const acak = n => Math.floor(Math.random() * n);

/**
 * Buat soal hitungan (format soal quiz.js, tipe 'angka') untuk membuat resep `kali` kali.
 * Bentuk soal dipilih acak; kelas 5–6 juga mendapat soal pembagian.
 */
export function soalResep(resep, kali, kelas, nama) {
  const [bahan, perBahan] = resep.bahan[acak(resep.bahan.length)];
  const hasil = nama(resep.hasil);
  const namaBahan = nama(bahan);
  const bentuk = [
    () => ({
      pertanyaan: `Sekali membuat ${hasil} butuh ${perBahan} ${namaBahan}. Kamu ingin membuat ${kali} kali. Berapa ${namaBahan} yang dibutuhkan?`,
      jawaban: perBahan * kali,
      petunjuk: `Kalikan: ${perBahan} × ${kali}.`,
      penjelasan: `${perBahan} × ${kali} = ${perBahan * kali} ${namaBahan}.`,
    }),
    () => ({
      pertanyaan: `Sekali membuat menghasilkan ${resep.jumlah} ${hasil}. Jika kamu membuat ${kali} kali, berapa ${hasil} yang kamu dapat?`,
      jawaban: resep.jumlah * kali,
      petunjuk: `Kalikan: ${resep.jumlah} × ${kali}.`,
      penjelasan: `${resep.jumlah} × ${kali} = ${resep.jumlah * kali} ${hasil}.`,
    }),
  ];
  if (kelas >= 5 && kali > 1) {
    bentuk.push(() => ({
      pertanyaan: `Kamu punya ${perBahan * kali} ${namaBahan}. Sekali membuat ${hasil} butuh ${perBahan} ${namaBahan}. Berapa kali kamu bisa membuat ${hasil}?`,
      jawaban: kali,
      petunjuk: `Bagi: ${perBahan * kali} : ${perBahan}.`,
      penjelasan: `${perBahan * kali} : ${perBahan} = ${kali} kali.`,
    }));
  }
  const s = bentuk[acak(bentuk.length)]();
  return { id: `blok-resep-${resep.id}`, mapel: 'matematika', kelas, topik: 'Perkalian dan Pembagian', tipe: 'angka', ...s };
}
