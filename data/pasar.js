// pasar.js — data untuk game Pasar Mini.
//
// Pecahan uang rupiah yang dipakai di game. Gambar uang di game dibuat dengan kode
// (lembaran/koin berwarna bertuliskan nominal), bukan tiruan desain uang asli.
// TODO verifikasi: daftar pecahan yang beredar dapat berubah; sesuaikan bila perlu.
export const PECAHAN = [
  { nilai: 100, jenis: 'koin' },
  { nilai: 200, jenis: 'koin' },
  { nilai: 500, jenis: 'koin' },
  { nilai: 1000, jenis: 'koin' },
  { nilai: 1000, jenis: 'kertas' },
  { nilai: 2000, jenis: 'kertas' },
  { nilai: 5000, jenis: 'kertas' },
  { nilai: 10000, jenis: 'kertas' },
  { nilai: 20000, jenis: 'kertas' },
  { nilai: 50000, jenis: 'kertas' },
  { nilai: 100000, jenis: 'kertas' },
];

// Barang dagangan. Harga adalah harga permainan (bukan harga pasar sebenarnya),
// dibuat kelipatan Rp500 agar mudah dihitung. Urutan menentukan kapan barang
// terbuka: makin tinggi level toko, makin banyak barang.
export const BARANG_PASAR = [
  { id: 'roti', nama: 'Roti', emoji: '🍞', harga: 3000 },
  { id: 'susu', nama: 'Susu', emoji: '🥛', harga: 5000 },
  { id: 'telur', nama: 'Telur', emoji: '🥚', harga: 2000 },
  { id: 'pisang', nama: 'Pisang', emoji: '🍌', harga: 1500 },
  { id: 'permen', nama: 'Permen', emoji: '🍬', harga: 500 },
  { id: 'apel', nama: 'Apel', emoji: '🍎', harga: 4000 },
  { id: 'jeruk', nama: 'Jeruk', emoji: '🍊', harga: 2500 },
  { id: 'tomat', nama: 'Tomat', emoji: '🍅', harga: 1000 },
  { id: 'pensil', nama: 'Pensil', emoji: '✏️', harga: 2000 },
  { id: 'buku', nama: 'Buku Tulis', emoji: '📒', harga: 4500 },
  { id: 'wortel', nama: 'Wortel', emoji: '🥕', harga: 3500 },
  { id: 'biskuit', nama: 'Biskuit', emoji: '🍪', harga: 6500 },
  { id: 'cokelat', nama: 'Cokelat', emoji: '🍫', harga: 7500 },
  { id: 'esteh', nama: 'Es Teh', emoji: '🥤', harga: 3000 },
  { id: 'sabun', nama: 'Sabun', emoji: '🧼', harga: 3500 },
  { id: 'ayam', nama: 'Ayam Goreng', emoji: '🍗', harga: 10000 },
  { id: 'ikan', nama: 'Ikan', emoji: '🐟', harga: 12000 },
  { id: 'beras', nama: 'Beras 1 kg', emoji: '🍚', harga: 14000 },
  { id: 'semangka', nama: 'Semangka', emoji: '🍉', harga: 15000 },
  { id: 'madu', nama: 'Madu', emoji: '🍯', harga: 25000 },
];

// Wajah pembeli (emoji tunggal, tanpa gabungan ZWJ agar tampil di banyak perangkat).
export const PEMBELI = [
  { emoji: '🧕', nama: 'Bu Aminah' },
  { emoji: '👳', nama: 'Pak Hasan' },
  { emoji: '👵', nama: 'Nenek Siti' },
  { emoji: '👴', nama: 'Kakek Umar' },
  { emoji: '👩', nama: 'Kak Rina' },
  { emoji: '👨', nama: 'Pak Budi' },
  { emoji: '👦', nama: 'Fajar' },
  { emoji: '👧', nama: 'Zahra' },
];
