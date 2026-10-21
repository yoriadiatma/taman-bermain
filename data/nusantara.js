// nusantara.js — data provinsi untuk game Jelajah Nusantara.
//
// Format provinsi:
//   { id, nama, ibuKota, wilayah, pos: [bujur, lintang], label?, catatan?, cekIbuKota?,
//     rumahAdat?: { nama, ket?, cek? }, budaya?: [{ jenis, nama, ket?, cek? }], islam?: [{ jenis, nama, ket, tanya?, cek? }] }
// - pos      : letak pin di peta (dekat ibu kota, sedikit digeser ke darat). Perkiraan, bukan koordinat resmi.
// - label    : letak tulisan nama di peta: 'atas' | 'bawah' (bawaan) | 'kiri' | 'kanan'.
// - cek      : true = mohon diverifikasi guru (TODO verifikasi).
// - Kolom yang saya ragukan sengaja DIKOSONGKAN (tidak diisi), bukan dikarang. Guru boleh melengkapinya.
// - Nama budaya/sejarah harus unik di seluruh data (dicek di uji), supaya soal "berasal dari provinsi ..." tidak bermakna ganda.
//
// TODO verifikasi: semua isi `rumahAdat`, `budaya`, dan `islam` adalah materi umum IPS/sejarah SD,
// tetapi mohon tetap dicek guru, terutama butir bertanda `cek: true`.
// Data wilayah per 2024: 38 provinsi (pemekaran Papua 2022).

export const WILAYAH = {
  sumatra: { nama: 'Sumatra', warna: '#b2f2bb', garis: '#2b8a3e' },
  jawa: { nama: 'Jawa', warna: '#ffec99', garis: '#e67700' },
  nusa: { nama: 'Bali dan Nusa Tenggara', warna: '#ffc9c9', garis: '#c92a2a' },
  kalimantan: { nama: 'Kalimantan', warna: '#c3fae8', garis: '#087f5b' },
  sulawesi: { nama: 'Sulawesi', warna: '#d0bfff', garis: '#5f3dc4' },
  maluku: { nama: 'Kepulauan Maluku', warna: '#ffd8a8', garis: '#d9480f' },
  papua: { nama: 'Papua', warna: '#fcc2d7', garis: '#a61e4d' },
};

export const JENIS_BUDAYA = {
  tarian: 'Tarian',
  makanan: 'Makanan khas',
  kesenian: 'Kesenian',
  'alat-musik': 'Alat musik',
  kerajinan: 'Kerajinan',
  warisan: 'Warisan budaya',
  tradisi: 'Tradisi',
  tempat: 'Tempat terkenal',
  alam: 'Keindahan alam',
  hewan: 'Hewan khas',
};

export const JENIS_ISLAM = {
  kerajaan: 'Kerajaan Islam',
  masjid: 'Masjid bersejarah',
  tokoh: 'Tokoh',
  julukan: 'Julukan',
};

export const PROVINSI = [
  // ===================== SUMATRA (10) =====================
  {
    id: 'aceh', nama: 'Aceh', ibuKota: 'Banda Aceh', wilayah: 'sumatra', pos: [95.5, 5.38],
    rumahAdat: { nama: 'Rumoh Aceh' },
    budaya: [
      { jenis: 'tarian', nama: 'Tari Saman', ket: 'Ditarikan berbaris sambil bertepuk dengan gerakan yang sangat kompak.' },
      { jenis: 'makanan', nama: 'Mi Aceh' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Samudera Pasai', ket: 'Umumnya disebut sebagai kerajaan Islam pertama di Indonesia (sekitar abad ke-13).', cek: true },
      { jenis: 'kerajaan', nama: 'Kesultanan Aceh Darussalam', ket: 'Mencapai masa jaya ketika dipimpin Sultan Iskandar Muda.', cek: true },
      { jenis: 'masjid', nama: 'Masjid Raya Baiturrahman', ket: 'Masjid bersejarah di Banda Aceh. Masjid ini tetap berdiri ketika tsunami tahun 2004.' },
      { jenis: 'julukan', nama: 'Serambi Mekah', ket: 'Aceh dijuluki Serambi Mekah karena Islam sangat kuat di daerah ini sejak dahulu.' },
    ],
  },
  {
    id: 'sumut', nama: 'Sumatera Utara', ibuKota: 'Medan', wilayah: 'sumatra', pos: [98.67, 3.5],
    rumahAdat: { nama: 'Rumah Bolon' },
    budaya: [
      { jenis: 'tarian', nama: 'Tari Tor-Tor' },
      { jenis: 'kerajinan', nama: 'Kain Ulos', ket: 'Kain tenun khas Batak.' },
      { jenis: 'alam', nama: 'Danau Toba', ket: 'Danau vulkanik terbesar di Indonesia.' },
    ],
  },
  {
    id: 'sumbar', nama: 'Sumatera Barat', ibuKota: 'Padang', wilayah: 'sumatra', pos: [100.5, -0.85],
    rumahAdat: { nama: 'Rumah Gadang', ket: 'Atapnya melengkung runcing seperti tanduk kerbau.' },
    budaya: [
      { jenis: 'makanan', nama: 'Rendang' },
      { jenis: 'tarian', nama: 'Tari Piring' },
    ],
    islam: [
      { jenis: 'tokoh', nama: 'Tuanku Imam Bonjol', tanya: 'Tuanku Imam Bonjol, ulama dan pahlawan nasional pemimpin Perang Padri, berasal dari provinsi ...', ket: 'Tuanku Imam Bonjol adalah ulama dan pahlawan nasional dari Sumatera Barat yang memimpin Perang Padri.' },
    ],
  },
  {
    id: 'riau', nama: 'Riau', ibuKota: 'Pekanbaru', wilayah: 'sumatra', pos: [101.45, 0.5],
    rumahAdat: { nama: 'Rumah Selaso Jatuh Kembar', cek: true },
    budaya: [
      { jenis: 'tradisi', nama: 'Pacu Jalur', ket: 'Lomba mendayung perahu panjang di Sungai Kuantan.', cek: true },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Siak Sri Inderapura', ket: 'Istana Siak peninggalan kesultanan ini masih berdiri di Kabupaten Siak.', cek: true },
    ],
  },
  {
    id: 'kepri', nama: 'Kepulauan Riau', ibuKota: 'Tanjungpinang', wilayah: 'sumatra', pos: [104.45, 1.0], label: 'kanan',
    catatan: 'Provinsi ini terdiri atas banyak pulau, antara lain Bintan, Batam, Lingga, dan Natuna.',
    rumahAdat: { nama: 'Rumah Belah Bubung', cek: true },
    islam: [
      { jenis: 'masjid', nama: 'Masjid Sultan Riau Pulau Penyengat', ket: 'Masjid bersejarah peninggalan Kesultanan Riau-Lingga di Pulau Penyengat.', cek: true },
    ],
  },
  {
    id: 'jambi', nama: 'Jambi', ibuKota: 'Jambi', wilayah: 'sumatra', pos: [103.6, -1.6],
    rumahAdat: { nama: 'Rumah Kajang Leko', cek: true },
    budaya: [
      { jenis: 'tempat', nama: 'Candi Muaro Jambi', ket: 'Kompleks candi peninggalan masa Hindu-Buddha di tepi Sungai Batanghari.' },
    ],
  },
  {
    id: 'sumsel', nama: 'Sumatera Selatan', ibuKota: 'Palembang', wilayah: 'sumatra', pos: [104.7, -3.0],
    rumahAdat: { nama: 'Rumah Limas' },
    budaya: [
      { jenis: 'makanan', nama: 'Pempek' },
      { jenis: 'tempat', nama: 'Jembatan Ampera', ket: 'Jembatan di atas Sungai Musi, Palembang.' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Palembang Darussalam', ket: 'Kesultanan Islam yang berpusat di Palembang.', cek: true },
    ],
  },
  {
    id: 'babel', nama: 'Kepulauan Bangka Belitung', ibuKota: 'Pangkalpinang', wilayah: 'sumatra', pos: [106.05, -2.2], label: 'kanan',
    catatan: 'Terdiri atas dua pulau utama: Pulau Bangka dan Pulau Belitung. Daerah ini terkenal sebagai penghasil timah.',
    // Rumah adat sengaja dikosongkan (sumber berbeda-beda). TODO verifikasi bila guru ingin menambah.
  },
  {
    id: 'bengkulu', nama: 'Bengkulu', ibuKota: 'Bengkulu', wilayah: 'sumatra', pos: [102.4, -3.7], label: 'kiri',
    rumahAdat: { nama: 'Rumah Bubungan Lima', cek: true },
    budaya: [
      { jenis: 'tradisi', nama: 'Tabot', ket: 'Upacara tradisional tahunan di Bengkulu.', cek: true },
    ],
    catatan: 'Bunga Rafflesia arnoldii (bunga bangkai raksasa) banyak ditemukan di hutan Bengkulu.',
  },
  {
    id: 'lampung', nama: 'Lampung', ibuKota: 'Bandar Lampung', wilayah: 'sumatra', pos: [105.2, -5.35],
    rumahAdat: { nama: 'Nuwo Sesat', cek: true },
    budaya: [
      { jenis: 'kerajinan', nama: 'Kain Tapis', ket: 'Kain tenun bersulam benang emas khas Lampung.' },
      { jenis: 'tempat', nama: 'Taman Nasional Way Kambas', ket: 'Tempat perlindungan gajah sumatra.' },
    ],
  },

  // ===================== JAWA (6) =====================
  {
    id: 'banten', nama: 'Banten', ibuKota: 'Serang', wilayah: 'jawa', pos: [106.15, -6.2], label: 'kiri',
    rumahAdat: { nama: 'Rumah Baduy', cek: true },
    budaya: [
      { jenis: 'kesenian', nama: 'Debus', ket: 'Seni pertunjukan bela diri tradisional Banten.' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Banten', ket: 'Kesultanan Islam yang menjadi pusat perdagangan lada.' },
      { jenis: 'masjid', nama: 'Masjid Agung Banten', ket: 'Masjid peninggalan Kesultanan Banten dengan menara yang khas.' },
      { jenis: 'tokoh', nama: 'Sultan Ageng Tirtayasa', tanya: 'Sultan Ageng Tirtayasa, pahlawan nasional yang melawan VOC, memimpin kesultanan di provinsi ...', ket: 'Sultan Ageng Tirtayasa memimpin Kesultanan Banten dan melawan VOC.' },
    ],
  },
  {
    // TODO verifikasi: sesuai UU No. 2 Tahun 2024 nama provinsi ini berubah menjadi "Daerah Khusus Jakarta"
    // setelah ibu kota negara resmi dipindahkan. Status ibu kota negara mohon dicek guru.
    id: 'dki', nama: 'DKI Jakarta', ibuKota: 'Jakarta', wilayah: 'jawa', pos: [106.85, -6.27], label: 'atas',
    catatan: 'Jakarta adalah ibu kota negara Indonesia. Ibu Kota Nusantara (IKN) sedang dibangun di Kalimantan Timur.', cekIbuKota: true,
    rumahAdat: { nama: 'Rumah Kebaya', ket: 'Rumah adat suku Betawi.' },
    budaya: [
      { jenis: 'kesenian', nama: 'Ondel-ondel' },
      { jenis: 'makanan', nama: 'Kerak Telor' },
      { jenis: 'tempat', nama: 'Monumen Nasional (Monas)' },
    ],
    islam: [
      { jenis: 'masjid', nama: 'Masjid Istiqlal', ket: 'Masjid negara Republik Indonesia, terletak di Jakarta.' },
    ],
  },
  {
    id: 'jabar', nama: 'Jawa Barat', ibuKota: 'Bandung', wilayah: 'jawa', pos: [107.6, -6.95],
    // Rumah adat dikosongkan: buku pelajaran menyebut nama yang berbeda-beda. TODO verifikasi.
    budaya: [
      { jenis: 'alat-musik', nama: 'Angklung', ket: 'Alat musik dari bambu asal tanah Sunda.' },
      { jenis: 'tarian', nama: 'Tari Jaipong' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Cirebon', ket: 'Kesultanan Islam di pesisir utara Jawa Barat.' },
      { jenis: 'tokoh', nama: 'Sunan Gunung Jati', tanya: 'Sunan Gunung Jati, salah satu Wali Songo, berdakwah di Cirebon. Cirebon termasuk provinsi ...', ket: 'Sunan Gunung Jati berdakwah di Cirebon, Jawa Barat.' },
    ],
  },
  {
    id: 'jateng', nama: 'Jawa Tengah', ibuKota: 'Semarang', wilayah: 'jawa', pos: [110.42, -7.1], label: 'atas',
    rumahAdat: { nama: 'Rumah Joglo' },
    budaya: [
      { jenis: 'tempat', nama: 'Candi Borobudur', ket: 'Candi Buddha terbesar di dunia, terletak di Magelang.' },
      { jenis: 'makanan', nama: 'Lumpia Semarang' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Demak', ket: 'Kerajaan Islam pertama di Pulau Jawa, didirikan oleh Raden Patah.' },
      { jenis: 'masjid', nama: 'Masjid Agung Demak', ket: 'Masjid tua yang menurut riwayat dibangun bersama para Wali Songo.', cek: true },
      { jenis: 'masjid', nama: 'Menara Kudus', ket: 'Menara masjid peninggalan Sunan Kudus di kota Kudus.' },
      { jenis: 'tokoh', nama: 'Sunan Kalijaga', tanya: 'Sunan Kalijaga, Wali Songo yang berdakwah lewat wayang dan tembang, dimakamkan di Demak. Demak termasuk provinsi ...', ket: 'Sunan Kalijaga berdakwah dengan wayang dan tembang. Makamnya di Kadilangu, Demak, Jawa Tengah.', cek: true },
    ],
  },
  {
    id: 'diy', nama: 'DI Yogyakarta', ibuKota: 'Yogyakarta', wilayah: 'jawa', pos: [110.37, -7.82], label: 'bawah',
    catatan: 'Nama lengkapnya Daerah Istimewa Yogyakarta. Daerah ini dipimpin oleh Sultan dari Keraton Yogyakarta.',
    rumahAdat: { nama: 'Bangsal Kencono', cek: true },
    budaya: [
      { jenis: 'makanan', nama: 'Gudeg' },
    ],
    islam: [
      { jenis: 'tokoh', nama: 'K.H. Ahmad Dahlan', tanya: 'K.H. Ahmad Dahlan mendirikan organisasi Muhammadiyah pada tahun 1912 di provinsi ...', ket: 'K.H. Ahmad Dahlan mendirikan Muhammadiyah di Yogyakarta pada tahun 1912.' },
      { jenis: 'kerajaan', nama: 'Kesultanan Mataram Islam', ket: 'Kerajaan Islam yang pernah berpusat di Kotagede, Yogyakarta.', cek: true },
    ],
  },
  {
    id: 'jatim', nama: 'Jawa Timur', ibuKota: 'Surabaya', wilayah: 'jawa', pos: [112.6, -7.32],
    // Rumah adat dikosongkan (sumber berbeda-beda). TODO verifikasi.
    budaya: [
      { jenis: 'kesenian', nama: 'Reog Ponorogo' },
      { jenis: 'makanan', nama: 'Rawon' },
      { jenis: 'alam', nama: 'Gunung Bromo' },
    ],
    islam: [
      { jenis: 'tokoh', nama: 'Sunan Ampel', tanya: 'Sunan Ampel, salah satu Wali Songo, berdakwah di Ampel Denta, Surabaya. Surabaya termasuk provinsi ...', ket: 'Sunan Ampel berdakwah dan mendirikan pesantren di Ampel Denta, Surabaya.' },
      { jenis: 'tokoh', nama: 'Maulana Malik Ibrahim', tanya: 'Maulana Malik Ibrahim, wali yang dianggap tertua di antara Wali Songo, dimakamkan di Gresik. Gresik termasuk provinsi ...', ket: 'Makam Maulana Malik Ibrahim berada di Gresik, Jawa Timur.', cek: true },
      { jenis: 'tokoh', nama: 'K.H. Hasyim Asy\'ari', tanya: 'K.H. Hasyim Asy\'ari mendirikan Nahdlatul Ulama di Surabaya pada tahun 1926. Surabaya termasuk provinsi ...', ket: 'K.H. Hasyim Asy\'ari mendirikan Nahdlatul Ulama (NU) pada tahun 1926 dan Pesantren Tebuireng di Jombang.' },
    ],
  },

  // ===================== BALI DAN NUSA TENGGARA (3) =====================
  {
    id: 'bali', nama: 'Bali', ibuKota: 'Denpasar', wilayah: 'nusa', pos: [115.2, -8.6],
    rumahAdat: { nama: 'Gapura Candi Bentar', cek: true },
    budaya: [
      { jenis: 'tarian', nama: 'Tari Kecak' },
      { jenis: 'tarian', nama: 'Tari Pendet' },
    ],
  },
  {
    id: 'ntb', nama: 'Nusa Tenggara Barat', ibuKota: 'Mataram', wilayah: 'nusa', pos: [116.15, -8.6],
    catatan: 'Pulau utamanya Lombok dan Sumbawa.',
    rumahAdat: { nama: 'Dalam Loka', cek: true },
    budaya: [
      { jenis: 'makanan', nama: 'Ayam Taliwang' },
      { jenis: 'alam', nama: 'Gunung Rinjani' },
    ],
    islam: [
      { jenis: 'julukan', nama: 'Pulau Seribu Masjid', ket: 'Pulau Lombok di Nusa Tenggara Barat dijuluki Pulau Seribu Masjid karena masjidnya sangat banyak.' },
      { jenis: 'kerajaan', nama: 'Kesultanan Bima', ket: 'Kesultanan Islam di Pulau Sumbawa bagian timur.', cek: true },
    ],
  },
  {
    id: 'ntt', nama: 'Nusa Tenggara Timur', ibuKota: 'Kupang', wilayah: 'nusa', pos: [123.75, -10.15],
    catatan: 'Pulau-pulaunya antara lain Flores, Sumba, Timor bagian barat, dan Pulau Komodo.',
    rumahAdat: { nama: 'Rumah Musalaki', cek: true },
    budaya: [
      { jenis: 'hewan', nama: 'Komodo', ket: 'Kadal terbesar di dunia, hidup di Pulau Komodo dan sekitarnya.' },
      { jenis: 'alat-musik', nama: 'Sasando', ket: 'Alat musik petik dari Pulau Rote.' },
    ],
  },

  // ===================== KALIMANTAN (5) =====================
  {
    id: 'kalbar', nama: 'Kalimantan Barat', ibuKota: 'Pontianak', wilayah: 'kalimantan', pos: [109.5, -0.05],
    rumahAdat: { nama: 'Rumah Radakng', cek: true },
    budaya: [
      { jenis: 'tempat', nama: 'Tugu Khatulistiwa', ket: 'Tugu di Pontianak yang menandai garis khatulistiwa.' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Pontianak', ket: 'Kesultanan Islam yang didirikan oleh Syarif Abdurrahman Alkadrie.', cek: true },
    ],
  },
  {
    id: 'kalteng', nama: 'Kalimantan Tengah', ibuKota: 'Palangka Raya', wilayah: 'kalimantan', pos: [113.92, -2.21],
    rumahAdat: { nama: 'Rumah Betang', cek: true },
    budaya: [
      { jenis: 'alam', nama: 'Taman Nasional Tanjung Puting', ket: 'Tempat perlindungan orang utan.' },
    ],
  },
  {
    // TODO verifikasi: sejak UU No. 8 Tahun 2022, ibu kota Kalimantan Selatan pindah dari Banjarmasin ke Banjarbaru.
    id: 'kalsel', nama: 'Kalimantan Selatan', ibuKota: 'Banjarbaru', wilayah: 'kalimantan', pos: [114.9, -3.4], cekIbuKota: true,
    catatan: 'Sejak tahun 2022 ibu kotanya pindah dari Banjarmasin ke Banjarbaru.',
    rumahAdat: { nama: 'Rumah Bubungan Tinggi', ket: 'Rumah adat suku Banjar.' },
    budaya: [
      { jenis: 'tempat', nama: 'Pasar Terapung', ket: 'Pedagang berjual beli di atas perahu di sungai.' },
      { jenis: 'makanan', nama: 'Soto Banjar' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Banjar', ket: 'Kesultanan Islam yang berpusat di Banjarmasin.' },
      { jenis: 'masjid', nama: 'Masjid Sultan Suriansyah', ket: 'Masjid tertua di Kalimantan Selatan, dibangun pada masa Sultan Suriansyah.', cek: true },
    ],
  },
  {
    id: 'kaltim', nama: 'Kalimantan Timur', ibuKota: 'Samarinda', wilayah: 'kalimantan', pos: [117.1, -0.5],
    catatan: 'Ibu Kota Nusantara (IKN), calon ibu kota negara yang baru, dibangun di provinsi ini.',
    rumahAdat: { nama: 'Rumah Lamin' },
    budaya: [
      { jenis: 'alam', nama: 'Kepulauan Derawan' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Kutai Kartanegara', ket: 'Kesultanan Islam yang berpusat di Tenggarong.', cek: true },
    ],
  },
  {
    id: 'kaltara', nama: 'Kalimantan Utara', ibuKota: 'Tanjung Selor', wilayah: 'kalimantan', pos: [117.3, 2.84],
    catatan: 'Provinsi ini dibentuk tahun 2012 dan berbatasan dengan Malaysia.',
    rumahAdat: { nama: 'Rumah Baloy', cek: true },
  },

  // ===================== SULAWESI (6) =====================
  {
    id: 'sulut', nama: 'Sulawesi Utara', ibuKota: 'Manado', wilayah: 'sulawesi', pos: [124.9, 1.3], label: 'kanan',
    rumahAdat: { nama: 'Rumah Walewangko', cek: true },
    budaya: [
      { jenis: 'makanan', nama: 'Bubur Manado (Tinutuan)' },
      { jenis: 'alam', nama: 'Taman Laut Bunaken' },
    ],
  },
  {
    id: 'gorontalo', nama: 'Gorontalo', ibuKota: 'Gorontalo', wilayah: 'sulawesi', pos: [123.0, 0.72], label: 'atas',
    rumahAdat: { nama: 'Rumah Dulohupa', cek: true },
    budaya: [
      { jenis: 'makanan', nama: 'Binte Biluhuta', ket: 'Sup jagung khas Gorontalo.', cek: true },
    ],
    islam: [
      { jenis: 'julukan', nama: 'Serambi Madinah', ket: 'Gorontalo dijuluki Serambi Madinah karena adatnya bersendikan ajaran Islam.', cek: true },
    ],
  },
  {
    id: 'sulteng', nama: 'Sulawesi Tengah', ibuKota: 'Palu', wilayah: 'sulawesi', pos: [119.9, -0.95], label: 'kanan',
    rumahAdat: { nama: 'Rumah Souraja', cek: true },
    budaya: [
      { jenis: 'alam', nama: 'Danau Poso' },
    ],
  },
  {
    id: 'sulbar', nama: 'Sulawesi Barat', ibuKota: 'Mamuju', wilayah: 'sulawesi', pos: [119.1, -2.7], label: 'kiri',
    catatan: 'Provinsi ini dibentuk tahun 2004, pemekaran dari Sulawesi Selatan.',
    budaya: [
      { jenis: 'tradisi', nama: 'Sayyang Pattu\'du', ket: 'Tradisi kuda menari untuk merayakan anak yang khatam Al-Qur\'an.', cek: true },
    ],
  },
  {
    id: 'sulsel', nama: 'Sulawesi Selatan', ibuKota: 'Makassar', wilayah: 'sulawesi', pos: [119.65, -5.05],
    rumahAdat: { nama: 'Rumah Tongkonan', ket: 'Rumah adat suku Toraja.' },
    budaya: [
      { jenis: 'warisan', nama: 'Kapal Pinisi', ket: 'Kapal layar tradisional buatan orang Bugis-Makassar.' },
      { jenis: 'makanan', nama: 'Coto Makassar' },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Gowa-Tallo', ket: 'Kesultanan Islam yang berpusat di Makassar.' },
      { jenis: 'tokoh', nama: 'Sultan Hasanuddin', tanya: 'Sultan Hasanuddin, raja Gowa yang dijuluki "Ayam Jantan dari Timur", berasal dari provinsi ...', ket: 'Sultan Hasanuddin, Sultan Gowa, dijuluki "Ayam Jantan dari Timur" karena gigih melawan VOC.' },
    ],
  },
  {
    id: 'sultra', nama: 'Sulawesi Tenggara', ibuKota: 'Kendari', wilayah: 'sulawesi', pos: [122.4, -4.0],
    rumahAdat: { nama: 'Banua Tada', cek: true },
    budaya: [
      { jenis: 'tarian', nama: 'Tari Lulo', cek: true },
      { jenis: 'alam', nama: 'Taman Nasional Wakatobi' },
    ],
  },

  // ===================== MALUKU (2) =====================
  {
    id: 'maluku', nama: 'Maluku', ibuKota: 'Ambon', wilayah: 'maluku', pos: [128.18, -3.66], label: 'bawah',
    catatan: 'Ambon terletak di Pulau Ambon, dekat Pulau Seram.',
    rumahAdat: { nama: 'Rumah Baileo' },
    budaya: [
      { jenis: 'alam', nama: 'Kepulauan Banda', ket: 'Sejak dahulu terkenal sebagai penghasil pala.' },
    ],
  },
  {
    id: 'malut', nama: 'Maluku Utara', ibuKota: 'Sofifi', wilayah: 'maluku', pos: [127.7, 0.75], label: 'kanan',
    catatan: 'Ibu kotanya Sofifi di Pulau Halmahera. Kota Ternate juga terkenal di provinsi ini.',
    rumahAdat: { nama: 'Rumah Sasadu', cek: true },
    budaya: [
      { jenis: 'tempat', nama: 'Pulau Ternate dan Tidore', ket: 'Sejak dahulu terkenal sebagai penghasil cengkih.', cek: true },
    ],
    islam: [
      { jenis: 'kerajaan', nama: 'Kesultanan Ternate', ket: 'Salah satu kesultanan Islam tertua di Maluku. Sultan Baabullah mengusir Portugis.', cek: true },
      { jenis: 'kerajaan', nama: 'Kesultanan Tidore', ket: 'Kesultanan Islam di Pulau Tidore, terkenal dengan Sultan Nuku.', cek: true },
    ],
  },

  // ===================== PAPUA (6) =====================
  {
    id: 'papua', nama: 'Papua', ibuKota: 'Jayapura', wilayah: 'papua', pos: [140.6, -2.65], label: 'atas',
    rumahAdat: { nama: 'Rumah Kariwari', cek: true },
    budaya: [
      { jenis: 'alam', nama: 'Danau Sentani' },
    ],
  },
  {
    id: 'papuabarat', nama: 'Papua Barat', ibuKota: 'Manokwari', wilayah: 'papua', pos: [133.85, -1.0], label: 'atas',
    rumahAdat: { nama: 'Rumah Kaki Seribu', cek: true },
    islam: [
      { jenis: 'masjid', nama: 'Masjid Tua Patimburak', ket: 'Salah satu masjid tertua di tanah Papua, terletak di Kabupaten Fakfak.', cek: true },
    ],
  },
  {
    id: 'papuabaratdaya', nama: 'Papua Barat Daya', ibuKota: 'Sorong', wilayah: 'papua', pos: [131.45, -0.95], label: 'bawah',
    catatan: 'Provinsi baru hasil pemekaran tahun 2022.',
    budaya: [
      { jenis: 'alam', nama: 'Raja Ampat', ket: 'Kepulauan dengan terumbu karang yang sangat indah.' },
    ],
  },
  {
    id: 'papuatengah', nama: 'Papua Tengah', ibuKota: 'Nabire', wilayah: 'papua', pos: [135.5, -3.55],
    catatan: 'Provinsi baru hasil pemekaran tahun 2022.',
    budaya: [
      { jenis: 'alam', nama: 'Puncak Jaya', ket: 'Puncak gunung tertinggi di Indonesia, puncaknya berselimut es.', cek: true },
    ],
  },
  {
    // TODO verifikasi: ibu kota Papua Pegunungan ditetapkan di Kabupaten Jayawijaya; kotanya Wamena.
    // TODO verifikasi: "satu-satunya provinsi tanpa laut" pada catatan.
    id: 'papuapegunungan', nama: 'Papua Pegunungan', ibuKota: 'Wamena', wilayah: 'papua', pos: [138.95, -4.1], cekIbuKota: true,
    catatan: 'Provinsi baru hasil pemekaran tahun 2022. Satu-satunya provinsi di Indonesia yang tidak memiliki laut.',
    rumahAdat: { nama: 'Rumah Honai', ket: 'Rumah bulat beratap jerami yang hangat di daerah pegunungan.' },
    budaya: [
      { jenis: 'alam', nama: 'Lembah Baliem' },
    ],
  },
  {
    id: 'papuaselatan', nama: 'Papua Selatan', ibuKota: 'Merauke', wilayah: 'papua', pos: [140.35, -8.35],
    catatan: 'Provinsi baru hasil pemekaran tahun 2022. Merauke disebut dalam ungkapan "dari Sabang sampai Merauke".',
    budaya: [
      { jenis: 'alam', nama: 'Taman Nasional Wasur', cek: true },
    ],
  },
];

export const provinsi = id => PROVINSI.find(p => p.id === id) || null;
