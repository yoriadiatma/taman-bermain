// misi.js — misi belajar di Blok Petualang.
// Setiap misi punya syarat di dalam game; beberapa misi diakhiri soal IPA dari bank soal,
// dan misi bangun memakai soal luas/keliling yang dibuat dari ukuran bangunannya.

// Topik IPA di bank soal (data/soal/ipa.js) yang cocok untuk tiap misi, per kelas.
// Jika topik tidak ada untuk kelas itu, mesin soal otomatis memakai kelas lain.
const TOPIK = {
  tumbuhan: { 4: ['Bagian Tumbuhan', 'Fotosintesis'], 5: ['Ekosistem'], 6: ['Perkembangbiakan Tumbuhan'] },
  air: { 4: ['Perubahan Wujud'], 5: ['Siklus Air'], 6: ['Siklus Air', 'Perubahan Wujud'] },
  cahaya: { 4: ['Energi'], 5: ['Cahaya'], 6: ['Listrik'] },
  logam: { 4: ['Gaya'], 5: ['Perpindahan Kalor'], 6: ['Listrik'] },
};

// Ukuran dinding untuk misi bangun, makin besar untuk kelas yang lebih tinggi.
const UKURAN_DINDING = { 4: [[3, 2], [4, 3]], 5: [[4, 3], [6, 3]], 6: [[5, 4], [7, 4]] };

const n = (obj, k) => obj?.[k] ?? 0;

/** Daftar misi untuk kelas tertentu. cek(catatan) => true jika syarat terpenuhi. */
export function daftarMisi(kelas) {
  const k = [4, 5, 6].includes(kelas) ? kelas : 4;
  const [[l1, t1], [l2, t2]] = UKURAN_DINDING[k];
  return [
    {
      id: 'kayu', judul: 'Penebang Pohon', teks: 'Tebang pohon dan kumpulkan 4 kayu. Tahan ketukan pada batang pohon.',
      cek: c => n(c.ditambang, 'kayu') >= 4, soal: { mapel: 'ipa', topik: TOPIK.tumbuhan[k] }, xp: 20,
    },
    {
      id: 'meja', judul: 'Tukang Kayu', teks: 'Buat meja kerja di menu 🔨 Buat, lalu taruh di dunia.',
      cek: c => n(c.ditaruh, 'meja kerja') >= 1, xp: 15,
    },
    {
      id: 'beliung', judul: 'Siap Menambang', teks: 'Buat beliung kayu di dekat meja kerja. Dengan beliung kamu bisa menambang batu.',
      cek: c => n(c.dibuat, 'beliung kayu') >= 1, xp: 15,
    },
    {
      id: 'air', judul: 'Penjelajah Air', teks: 'Temukan air, lalu berenanglah di dalamnya.',
      cek: c => !!c.pernahAir, soal: { mapel: 'ipa', topik: TOPIK.air[k] }, xp: 20,
    },
    {
      id: 'dinding1', judul: 'Dinding Pertama', jenis: 'bangun', lebar: l1, tinggi: t1, tanya: 'luas',
      teks: `Bangun dinding papan penuh selebar ${l1} blok dan setinggi ${t1} blok.`, xp: 25,
    },
    {
      id: 'dinding2', judul: 'Ahli Keliling', jenis: 'bangun', lebar: l2, tinggi: t2, tanya: 'keliling',
      teks: `Bangun dinding papan penuh selebar ${l2} blok dan setinggi ${t2} blok.`, xp: 25,
    },
    {
      id: 'obor', judul: 'Penerang Gua', teks: 'Buat obor dari tongkat dan batu bara, lalu taruh obor di dunia.',
      cek: c => n(c.ditaruh, 'obor') >= 1, soal: { mapel: 'ipa', topik: TOPIK.cahaya[k] }, xp: 20,
    },
    {
      id: 'besi', judul: 'Pencari Besi', teks: 'Tambang 1 bijih besi. Kamu butuh beliung batu.',
      cek: c => n(c.ditambang, 'bijih besi') >= 1, soal: { mapel: 'ipa', topik: TOPIK.logam[k] }, xp: 25,
    },
    {
      id: 'peti', judul: 'Pemburu Harta', teks: 'Temukan peti terkunci di dalam gua, lalu jawab soalnya untuk membuka.',
      cek: c => n(c, 'petiDibuka') >= 1, xp: 20, hadiah: [['emas', 1]],
    },
    {
      id: 'rumah', judul: 'Rumah Impian', jenis: 'rumah', teks: 'Buat rumah kecil (butuh 16 papan, 1 kaca, 1 pintu), lalu taruh di atas tanah yang rata.',
      cek: c => n(c.ditaruh, 'rumah kecil') >= 1, xp: 40,
    },
    {
      id: 'emas', judul: 'Penambang Emas', teks: 'Tambang 1 bijih emas jauh di dalam tanah. Kamu butuh beliung besi.',
      cek: c => n(c.ditambang, 'bijih emas') >= 1, xp: 30,
    },
  ];
}

/** Soal hitungan untuk misi bangun (format soal quiz.js). */
export function soalBangun(misi, kelas) {
  const { lebar: l, tinggi: t } = misi;
  if (misi.tanya === 'keliling') {
    return {
      id: `blok-misi-${misi.id}`, mapel: 'matematika', kelas, topik: 'Keliling dan Luas', tipe: 'angka',
      pertanyaan: `Dinding papan selebar ${l} blok dan setinggi ${t} blok. Berapa kelilingnya, jika setiap sisi blok panjangnya 1?`,
      jawaban: 2 * (l + t),
      petunjuk: `Keliling persegi panjang = 2 × (panjang + lebar) = 2 × (${l} + ${t}).`,
      penjelasan: `2 × (${l} + ${t}) = 2 × ${l + t} = ${2 * (l + t)}.`,
    };
  }
  return {
    id: `blok-misi-${misi.id}`, mapel: 'matematika', kelas, topik: 'Keliling dan Luas', tipe: 'angka',
    pertanyaan: `Kamu akan membangun dinding papan selebar ${l} blok dan setinggi ${t} blok. Berapa papan yang dibutuhkan?`,
    jawaban: l * t,
    petunjuk: `Luas persegi panjang = panjang × lebar = ${l} × ${t}.`,
    penjelasan: `${l} × ${t} = ${l * t} papan. Itulah luas dinding dalam satuan blok.`,
  };
}

/** Soal luas untuk misi rumah. */
export function soalRumah(kelas) {
  return {
    id: 'blok-misi-rumah', mapel: 'matematika', kelas, topik: 'Keliling dan Luas', tipe: 'angka',
    pertanyaan: 'Rumah kecilmu selebar 6 blok dan setinggi 5 blok. Berapa luas bagian depan rumah itu (dalam satuan blok)?',
    jawaban: 30,
    petunjuk: 'Luas = lebar × tinggi.',
    penjelasan: '6 × 5 = 30 blok.',
  };
}

/** Soal mengeja nama barang: huruf diacak per kata. */
export function soalEja(nama, kelas, acak = Math.random) {
  const kecil = nama.toLowerCase();
  const kata = kecil.split(' ');
  const acakKata = w => {
    const h = [...w];
    for (let percobaan = 0; percobaan < 10; percobaan++) {
      for (let i = h.length - 1; i > 0; i--) {
        const j = Math.floor(acak() * (i + 1));
        [h[i], h[j]] = [h[j], h[i]];
      }
      if (h.join('') !== w || w.length < 2) break;
    }
    return h.join(' ').toUpperCase();
  };
  return {
    id: `blok-eja-${kecil.replace(/\s+/g, '-')}`, mapel: 'bahasa', kelas, topik: 'Ejaan', tipe: 'teks',
    pertanyaan: `Susun huruf ini menjadi nama barang yang benar:\n${kata.map(acakKata).join('   /   ')}`,
    jawaban: kecil,
    petunjuk: `Nama barang ini terdiri atas ${kata.length} kata, huruf pertamanya ${kecil[0].toUpperCase()}.`,
    penjelasan: `Ejaan yang benar: "${kecil}".`,
  };
}

export const xpKeLevel = xp => 1 + Math.floor(xp / 60);
