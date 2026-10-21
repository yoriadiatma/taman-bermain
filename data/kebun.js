// kebun.js — data tanaman dan hewan untuk game Kebun Ceria.
//
// Lama tumbuh, harga, dan jumlah hasil adalah aturan permainan (bukan data pertanian sungguhan).
// Teks `info` adalah pengetahuan IPA dasar.
// TODO verifikasi: mohon cek kalimat `info` dan nama tahap tumbuh oleh guru IPA.

export const TANAMAN = {
  bayam: {
    nama: 'Bayam', emoji: '🥬', hargaBenih: 2, hasil: 4, hargaJual: 2, hariPerTahap: 1,
    tahap: ['Benih', 'Kecambah', 'Tanaman muda', 'Daun lebat'],
    gambar: { daun: '#2f9e44', buah: null, bentuk: 'daun' },
    info: 'Bayam dipanen daunnya. Daun berwarna hijau karena mengandung klorofil (zat hijau daun) untuk fotosintesis.',
  },
  jagung: {
    nama: 'Jagung', emoji: '🌽', hargaBenih: 3, hasil: 6, hargaJual: 3, hariPerTahap: 2,
    tahap: ['Benih', 'Kecambah', 'Tanaman muda', 'Berbunga', 'Tongkol matang'],
    gambar: { daun: '#5c940d', buah: '#fcc419', bentuk: 'tongkol' },
    info: 'Jagung termasuk tumbuhan berbiji tunggal (monokotil). Bijinya tersusun rapat pada tongkol.',
  },
  wortel: {
    nama: 'Wortel', emoji: '🥕', hargaBenih: 3, hasil: 6, hargaJual: 2, hariPerTahap: 2,
    tahap: ['Benih', 'Kecambah', 'Tanaman muda', 'Daun lebat', 'Akar membesar'],
    gambar: { daun: '#37b24d', buah: '#f76707', bentuk: 'umbi' },
    info: 'Bagian wortel yang kita makan adalah akarnya, yang menyimpan cadangan makanan.',
  },
  tomat: {
    nama: 'Tomat', emoji: '🍅', hargaBenih: 4, hasil: 8, hargaJual: 3, hariPerTahap: 2,
    tahap: ['Benih', 'Kecambah', 'Tanaman muda', 'Berbunga', 'Berbuah'],
    gambar: { daun: '#2b8a3e', buah: '#e03131', bentuk: 'bulat' },
    info: 'Buah tomat tumbuh dari bunga yang sudah diserbuki. Di dalam buahnya ada banyak biji.',
  },
  padi: {
    nama: 'Padi', emoji: '🌾', hargaBenih: 4, hasil: 8, hargaJual: 3, hariPerTahap: 2,
    tahap: ['Benih', 'Kecambah', 'Tanaman muda', 'Berbunga', 'Bulir menguning'],
    gambar: { daun: '#74b816', buah: '#f2c94c', bentuk: 'bulir' },
    info: 'Padi tumbuh baik di sawah yang berair. Bulir padi (gabah) diolah menjadi beras, makanan pokok kita.',
  },
  cabai: {
    nama: 'Cabai', emoji: '🌶️', hargaBenih: 5, hasil: 10, hargaJual: 3, hariPerTahap: 2,
    tahap: ['Benih', 'Kecambah', 'Tanaman muda', 'Berbunga', 'Berbuah'],
    gambar: { daun: '#2f9e44', buah: '#c92a2a', bentuk: 'panjang' },
    info: 'Rasa pedas cabai berasal dari zat bernama kapsaisin.',
  },
};

export const HEWAN = {
  ayam: {
    nama: 'Ayam', harga: 15, makanan: 'jagung', jumlahMakan: 1, produk: 'telur', jumlahProduk: 1, maks: 3,
    jenisMakan: 'Omnivora', makanApa: 'memakan biji-bijian dan juga serangga kecil',
    info: 'Ayam termasuk omnivora: memakan biji-bijian dan juga serangga kecil. Ayam berkembang biak dengan bertelur.',
  },
  kambing: {
    nama: 'Kambing', harga: 30, makanan: 'rumput', jumlahMakan: 1, produk: 'susu', jumlahProduk: 1, maks: 2,
    jenisMakan: 'Herbivora', makanApa: 'memakan rumput dan dedaunan',
    info: 'Kambing termasuk herbivora (pemakan tumbuhan). Kambing menyusui anaknya, jadi termasuk mamalia.',
  },
  sapi: {
    nama: 'Sapi', harga: 45, makanan: 'rumput', jumlahMakan: 2, produk: 'susu', jumlahProduk: 2, maks: 2,
    jenisMakan: 'Herbivora', makanApa: 'memakan rumput',
    info: 'Sapi termasuk herbivora (pemakan tumbuhan) dan mamalia karena menyusui anaknya.',
  },
};

// Barang lain di gudang.
export const BARANG_KEBUN = {
  telur: { nama: 'Telur', emoji: '🥚', hargaJual: 4 },
  susu: { nama: 'Susu', emoji: '🥛', hargaJual: 6 },
  rumput: { nama: 'Rumput', emoji: '🌿', hargaJual: 0 },
  sisa: { nama: 'Sisa tanaman', emoji: '🍂', hargaJual: 0 },
  kompos: { nama: 'Kompos', emoji: '♻️', hargaJual: 0 },
};

export const INFO_KOMPOS = 'Sisa tanaman diuraikan oleh pengurai seperti jamur dan bakteri menjadi kompos yang menyuburkan tanah.';
export const INFO_HUJAN = 'Hujan turun! Air hujan berasal dari awan, hasil penguapan dan pengembunan dalam siklus air. Semua tanaman tersiram.';
