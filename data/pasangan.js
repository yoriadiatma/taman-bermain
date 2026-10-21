// pasangan.js — isi kartu untuk game Pasangan Kilat.
// Kartu hitungan dan pecahan dibuat otomatis oleh js/games/pasangan/kartu.js;
// file ini berisi daftar pasangan yang ditulis tangan. Guru boleh menambah pasangan
// dengan format yang sama. Setiap teks/emoji harus unik di dalam satu daftar.

// Pasangan emoji ↔ kata, per kelas.
export const KATA_EMOJI = {
  4: [ // benda sehari-hari
    ['🍎', 'apel'], ['🍌', 'pisang'], ['📚', 'buku'], ['🚲', 'sepeda'], ['🏫', 'sekolah'], ['🌈', 'pelangi'],
    ['🕌', 'masjid'], ['⚽', 'bola'], ['🐟', 'ikan'], ['🌙', 'bulan'], ['⭐', 'bintang'], ['🌳', 'pohon'],
    ['✏️', 'pensil'], ['🎒', 'tas'], ['⏰', 'jam'], ['☂️', 'payung'], ['🥛', 'susu'], ['🍚', 'nasi'],
    ['🐄', 'sapi'], ['🐓', 'ayam'], ['🔑', 'kunci'], ['🌧️', 'hujan'],
  ],
  5: [ // kata kerja dan perasaan
    ['😴', 'tidur'], ['🏃', 'berlari'], ['📖', 'membaca'], ['✍️', 'menulis'], ['🍳', 'memasak'], ['🏊', 'berenang'],
    ['🚴', 'bersepeda'], ['🎨', 'melukis'], ['🙏', 'berdoa'], ['😊', 'senang'], ['😢', 'sedih'], ['😡', 'marah'],
    ['😨', 'takut'], ['😲', 'terkejut'], ['🤔', 'berpikir'], ['🥶', 'kedinginan'], ['🥵', 'kepanasan'],
    ['🧹', 'menyapu'], ['🎤', 'bernyanyi'],
  ],
  6: [ // alat sains dan peristiwa alam
    ['🔭', 'teleskop'], ['🔬', 'mikroskop'], ['🧲', 'magnet'], ['🌡️', 'termometer'], ['🧭', 'kompas'], ['🔋', 'baterai'],
    ['💡', 'lampu'], ['⚖️', 'timbangan'], ['🧪', 'tabung reaksi'], ['🔍', 'kaca pembesar'], ['🌋', 'gunung berapi'], ['⚡', 'petir'],
    ['🌍', 'bumi'], ['☄️', 'komet'], ['🌪️', 'angin puting beliung'], ['🌊', 'ombak'], ['⏱️', 'stopwatch'], ['📏', 'penggaris'],
  ],
};

// Hewan & tumbuhan ↔ cirinya. Setiap ciri hanya cocok untuk satu nama di daftar ini.
// TODO verifikasi: ciri-ciri diambil dari materi IPA SD yang umum; mohon dicek guru.
export const HEWAN_TUMBUHAN = [
  ['🐸 Katak', 'Hidup di dua alam (amfibi)'],
  ['🐟 Ikan', 'Bernapas dengan insang'],
  ['🦇 Kelelawar', 'Mamalia yang bisa terbang'],
  ['🐳 Paus', 'Mamalia yang hidup di laut'],
  ['🦋 Kupu-kupu', 'Mengalami metamorfosis sempurna'],
  ['🦗 Jangkrik', 'Mengalami metamorfosis tidak sempurna'],
  ['🦎 Bunglon', 'Bisa mengubah warna kulitnya'],
  ['🐝 Lebah', 'Menghasilkan madu'],
  ['🌵 Kaktus', 'Daunnya berubah menjadi duri'],
  ['🐄 Sapi', 'Herbivora: pemakan tumbuhan'],
  ['🐅 Harimau', 'Karnivora: pemakan daging'],
  ['🐔 Ayam', 'Omnivora: pemakan tumbuhan dan hewan'],
  ['🍄 Jamur', 'Pengurai sisa makhluk hidup'],
  ['🥔 Kentang', 'Berkembang biak dengan umbi batang'],
  ['🍌 Pisang', 'Berkembang biak dengan tunas'],
  ['🍓 Stroberi', 'Berkembang biak dengan geragih'],
  ['🐢 Kura-kura', 'Punya tempurung keras untuk melindungi diri'],
  ['🐫 Unta', 'Tahan lama tidak minum di gurun'],
  ['🌾 Padi', 'Tumbuhan penghasil beras'],
];
