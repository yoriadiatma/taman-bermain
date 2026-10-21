// ungkapan.js — kalimat sapaan dan ucapan yang dipakai di semua game.
// Silakan ubah atau tambah kalimat di sini; semua game mengambil dari daftar ini.

export const sapaan = nama => `Assalamu'alaikum, ${nama}!`;

// Saat jawaban benar.
export const PUJIAN = [
  'Alhamdulillah, benar!',
  'MasyaAllah, hebat!',
  'Barakallah, pintar sekali!',
  'Benar! Terus semangat belajar!',
  'Alhamdulillah, kamu berhasil!',
];

// Saat jawaban belum tepat. Tidak menghukum: ajak mencoba lagi.
export const SEMANGAT = [
  'Belum tepat, ayo coba lagi!',
  'Tidak apa-apa, coba sekali lagi ya.',
  'Hampir! Pelan-pelan saja, kamu pasti bisa.',
  'Sabar ya, lihat petunjuknya lalu coba lagi.',
];

// Saat memulai permainan.
export const MULAI = [
  'Bismillah, ayo mulai!',
  'Bismillah, semangat belajar!',
];
