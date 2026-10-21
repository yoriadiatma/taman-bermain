// Soal Pendidikan Agama Islam (PAI) kelas 4–6. Format: lihat data/questions.js.
//
// TODO verifikasi: SEMUA soal PAI diberi `cek: true` dan perlu diperiksa oleh
// guru PAI/ustadz sebelum dipakai. Hapus `cek: true` pada soal yang sudah dicek.
// Bacaan Arab ditulis dalam huruf latin agar mudah dibaca dan tidak salah tampil.

export default [
  // ===================== KELAS 4 =====================
  {
    id: 'pai4-01', kelas: 4, topik: 'Rukun Iman', tipe: 'angka',
    pertanyaan: 'Rukun Iman ada berapa?', jawaban: 6,
    petunjuk: 'Mulai dari iman kepada Allah sampai iman kepada qada dan qadar.',
    penjelasan: 'Rukun Iman ada 6: iman kepada Allah, malaikat, kitab, rasul, hari akhir, serta qada dan qadar.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-02', kelas: 4, topik: 'Rukun Islam', tipe: 'angka',
    pertanyaan: 'Rukun Islam ada berapa?', jawaban: 5,
    petunjuk: 'Dimulai dengan syahadat dan diakhiri dengan haji.',
    penjelasan: 'Rukun Islam ada 5: syahadat, salat, zakat, puasa Ramadan, dan haji bagi yang mampu.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-03', kelas: 4, topik: 'Iman kepada Malaikat', tipe: 'pilihan',
    pertanyaan: 'Malaikat yang bertugas menyampaikan wahyu kepada para nabi dan rasul adalah ...',
    pilihan: ['Jibril', 'Mikail', 'Israfil', 'Izrail'], jawaban: 'Jibril',
    petunjuk: 'Malaikat ini menyampaikan wahyu pertama kepada Nabi Muhammad saw. di Gua Hira.',
    penjelasan: 'Malaikat Jibril bertugas menyampaikan wahyu.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-04', kelas: 4, topik: 'Iman kepada Malaikat', tipe: 'pilihan',
    pertanyaan: 'Malaikat yang bertugas membagikan rezeki dan menurunkan hujan adalah ...',
    pilihan: ['Mikail', 'Jibril', 'Raqib', 'Malik'], jawaban: 'Mikail',
    petunjuk: 'Namanya diawali huruf M, tetapi bukan penjaga neraka.',
    penjelasan: 'Malaikat Mikail bertugas membagikan rezeki dan menurunkan hujan atas perintah Allah.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-05', kelas: 4, topik: 'Iman kepada Malaikat', tipe: 'pilihan',
    pertanyaan: 'Malaikat yang bertugas meniup sangkakala pada hari kiamat adalah ...',
    pilihan: ['Israfil', 'Izrail', 'Ridwan', 'Munkar'], jawaban: 'Israfil',
    petunjuk: 'Namanya mirip dengan Izrail, tetapi berbeda tugas.',
    penjelasan: 'Malaikat Israfil bertugas meniup sangkakala.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-06', kelas: 4, topik: 'Iman kepada Malaikat', tipe: 'pilihan',
    pertanyaan: 'Malaikat yang mencatat amal baik manusia adalah ...',
    pilihan: ['Raqib', 'Atid', 'Malik', 'Nakir'], jawaban: 'Raqib',
    petunjuk: 'Pasangannya adalah Atid yang mencatat amal buruk.',
    penjelasan: 'Raqib mencatat amal baik, Atid mencatat amal buruk.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-07', kelas: 4, topik: 'Iman kepada Malaikat', tipe: 'pilihan',
    pertanyaan: 'Malaikat yang mencatat amal buruk manusia adalah ...',
    pilihan: ['Atid', 'Raqib', 'Ridwan', 'Jibril'], jawaban: 'Atid',
    petunjuk: 'Pasangannya adalah Raqib.',
    penjelasan: 'Atid mencatat amal buruk manusia.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-08', kelas: 4, topik: 'Iman kepada Malaikat', tipe: 'pilihan',
    pertanyaan: 'Malaikat penjaga surga adalah ...',
    pilihan: ['Ridwan', 'Malik', 'Mikail', 'Israfil'], jawaban: 'Ridwan',
    petunjuk: 'Malaikat Malik menjaga neraka.',
    penjelasan: 'Malaikat Ridwan menjaga surga, Malaikat Malik menjaga neraka.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-09', kelas: 4, topik: 'Asmaul Husna', tipe: 'pilihan',
    pertanyaan: 'Al-\'Alim artinya Allah Maha ...',
    pilihan: ['Mengetahui', 'Mendengar', 'Melihat', 'Pengasih'], jawaban: 'Mengetahui',
    petunjuk: 'Kata ini mirip dengan kata "ilmu".',
    penjelasan: 'Al-\'Alim artinya Allah Maha Mengetahui segala sesuatu.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-10', kelas: 4, topik: 'Asmaul Husna', tipe: 'pilihan',
    pertanyaan: 'As-Sami\' artinya Allah Maha ...',
    pilihan: ['Mendengar', 'Melihat', 'Pemberi Rezeki', 'Pencipta'], jawaban: 'Mendengar',
    petunjuk: 'Allah mendengar setiap doa kita.',
    penjelasan: 'As-Sami\' artinya Allah Maha Mendengar.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-11', kelas: 4, topik: 'Asmaul Husna', tipe: 'pilihan',
    pertanyaan: 'Al-Bashir artinya Allah Maha ...',
    pilihan: ['Melihat', 'Mendengar', 'Pengampun', 'Adil'], jawaban: 'Melihat',
    petunjuk: 'Tidak ada yang tersembunyi dari pandangan Allah.',
    penjelasan: 'Al-Bashir artinya Allah Maha Melihat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-12', kelas: 4, topik: 'Salat', tipe: 'angka',
    pertanyaan: 'Salat Magrib terdiri atas berapa rakaat?', jawaban: 3,
    petunjuk: 'Satu-satunya salat fardu yang rakaatnya ganjil.',
    penjelasan: 'Salat Magrib 3 rakaat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-13', kelas: 4, topik: 'Salat', tipe: 'angka',
    pertanyaan: 'Salat Subuh terdiri atas berapa rakaat?', jawaban: 2,
    petunjuk: 'Salat fardu dengan rakaat paling sedikit.',
    penjelasan: 'Salat Subuh 2 rakaat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-14', kelas: 4, topik: 'Salat', tipe: 'angka',
    pertanyaan: 'Jumlah rakaat salat fardu dalam sehari semalam adalah ...', jawaban: 17,
    petunjuk: 'Subuh 2, Zuhur 4, Asar 4, Magrib 3, Isya 4.',
    penjelasan: '2 + 4 + 4 + 3 + 4 = 17 rakaat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-15', kelas: 4, topik: 'Salat', tipe: 'urutan',
    pertanyaan: 'Urutkan waktu salat fardu dimulai dari pagi hari.',
    jawaban: ['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'],
    petunjuk: 'Salat pertama dikerjakan sebelum matahari terbit.',
    penjelasan: 'Subuh (fajar), Zuhur (siang), Asar (sore), Magrib (matahari terbenam), Isya (malam).',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-16', kelas: 4, topik: 'Al-Qur\'an', tipe: 'angka',
    pertanyaan: 'Surah Al-Fatihah terdiri atas berapa ayat?', jawaban: 7,
    petunjuk: 'Surah ini dibaca di setiap rakaat salat.',
    penjelasan: 'Al-Fatihah terdiri atas 7 ayat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-17', kelas: 4, topik: 'Al-Qur\'an', tipe: 'angka',
    pertanyaan: 'Surah Al-Ikhlas terdiri atas berapa ayat?', jawaban: 4,
    petunjuk: 'Ayat pertamanya "Qul huwallahu ahad".',
    penjelasan: 'Al-Ikhlas terdiri atas 4 ayat dan berisi tentang keesaan Allah.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-18', kelas: 4, topik: 'Adab Sehari-hari', tipe: 'pilihan',
    pertanyaan: 'Ucapan yang dianjurkan ketika kita bersin adalah ...',
    pilihan: ['Alhamdulillah', 'Astagfirullah', 'Bismillah', 'Insya Allah'], jawaban: 'Alhamdulillah',
    petunjuk: 'Ucapan memuji Allah.',
    penjelasan: 'Saat bersin kita mengucapkan "Alhamdulillah" (segala puji bagi Allah).',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-19', kelas: 4, topik: 'Adab Sehari-hari', tipe: 'pilihan',
    pertanyaan: 'Jika mendengar teman bersin dan mengucapkan "Alhamdulillah", kita menjawab ...',
    pilihan: ['Yarhamukallah', 'Wa\'alaikumussalam', 'Masya Allah', 'Subhanallah'], jawaban: 'Yarhamukallah',
    petunjuk: 'Artinya "semoga Allah merahmatimu".',
    penjelasan: 'Kita menjawab "Yarhamukallah", artinya semoga Allah merahmatimu.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-20', kelas: 4, topik: 'Adab Sehari-hari', tipe: 'pilihan',
    pertanyaan: 'Ucapan ketika mendengar kabar musibah atau ada orang meninggal dunia adalah ...',
    pilihan: ['Inna lillahi wa inna ilaihi raji\'un', 'Alhamdulillah', 'Allahu Akbar', 'Masya Allah'],
    jawaban: 'Inna lillahi wa inna ilaihi raji\'un',
    petunjuk: 'Artinya "sesungguhnya kami milik Allah dan kepada-Nya kami kembali".',
    penjelasan: 'Kalimat istirja\' diucapkan ketika mendapat musibah.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-21', kelas: 4, topik: 'Kisah Nabi', tipe: 'pilihan',
    pertanyaan: 'Nabi dan manusia pertama yang diciptakan Allah adalah ...',
    pilihan: ['Nabi Adam a.s.', 'Nabi Nuh a.s.', 'Nabi Ibrahim a.s.', 'Nabi Muhammad saw.'], jawaban: 'Nabi Adam a.s.',
    petunjuk: 'Istrinya bernama Hawa.',
    penjelasan: 'Nabi Adam a.s. adalah manusia pertama dan nabi pertama.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai4-22', kelas: 4, topik: 'Al-Qur\'an', tipe: 'pilihan',
    pertanyaan: 'Al-Qur\'an diturunkan kepada ...',
    pilihan: ['Nabi Muhammad saw.', 'Nabi Musa a.s.', 'Nabi Isa a.s.', 'Nabi Daud a.s.'], jawaban: 'Nabi Muhammad saw.',
    petunjuk: 'Nabi dan rasul terakhir.',
    penjelasan: 'Al-Qur\'an diturunkan kepada Nabi Muhammad saw. melalui Malaikat Jibril.',
    cek: true, // TODO verifikasi
  },

  // ===================== KELAS 5 =====================
  {
    id: 'pai5-01', kelas: 5, topik: 'Iman kepada Kitab', tipe: 'pilihan',
    pertanyaan: 'Kitab Taurat diturunkan kepada ...',
    pilihan: ['Nabi Musa a.s.', 'Nabi Daud a.s.', 'Nabi Isa a.s.', 'Nabi Ibrahim a.s.'], jawaban: 'Nabi Musa a.s.',
    petunjuk: 'Nabi yang tongkatnya dapat membelah lautan.',
    penjelasan: 'Taurat diturunkan kepada Nabi Musa a.s.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-02', kelas: 5, topik: 'Iman kepada Kitab', tipe: 'pilihan',
    pertanyaan: 'Kitab Zabur diturunkan kepada ...',
    pilihan: ['Nabi Daud a.s.', 'Nabi Musa a.s.', 'Nabi Sulaiman a.s.', 'Nabi Isa a.s.'], jawaban: 'Nabi Daud a.s.',
    petunjuk: 'Ayah Nabi Sulaiman a.s.',
    penjelasan: 'Zabur diturunkan kepada Nabi Daud a.s.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-03', kelas: 5, topik: 'Iman kepada Kitab', tipe: 'pilihan',
    pertanyaan: 'Kitab Injil diturunkan kepada ...',
    pilihan: ['Nabi Isa a.s.', 'Nabi Musa a.s.', 'Nabi Daud a.s.', 'Nabi Muhammad saw.'], jawaban: 'Nabi Isa a.s.',
    petunjuk: 'Ibunya bernama Maryam.',
    penjelasan: 'Injil diturunkan kepada Nabi Isa a.s.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-04', kelas: 5, topik: 'Al-Qur\'an', tipe: 'angka',
    pertanyaan: 'Jumlah surah dalam Al-Qur\'an adalah ...', jawaban: 114,
    petunjuk: 'Surah terakhirnya An-Nas.',
    penjelasan: 'Al-Qur\'an terdiri atas 114 surah, dari Al-Fatihah sampai An-Nas.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-05', kelas: 5, topik: 'Iman kepada Rasul', tipe: 'angka',
    pertanyaan: 'Rasul Ulul Azmi berjumlah ...', jawaban: 5,
    petunjuk: 'Nuh, Ibrahim, Musa, Isa, dan Muhammad.',
    penjelasan: 'Ulul Azmi (rasul yang sangat tabah): Nabi Nuh, Ibrahim, Musa, Isa, dan Muhammad.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-06', kelas: 5, topik: 'Iman kepada Rasul', tipe: 'pilihan',
    pertanyaan: 'Manakah yang termasuk Rasul Ulul Azmi?',
    pilihan: ['Nabi Nuh a.s.', 'Nabi Yusuf a.s.', 'Nabi Sulaiman a.s.', 'Nabi Yunus a.s.'], jawaban: 'Nabi Nuh a.s.',
    petunjuk: 'Nabi yang membuat kapal besar.',
    penjelasan: 'Nabi Nuh a.s. termasuk Ulul Azmi karena sangat sabar berdakwah ratusan tahun.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-07', kelas: 5, topik: 'Al-Qur\'an', tipe: 'pilihan',
    pertanyaan: 'Surah terpendek dalam Al-Qur\'an adalah ...',
    pilihan: ['Al-Kautsar', 'Al-Ikhlas', 'An-Nas', 'Al-Falaq'], jawaban: 'Al-Kautsar',
    petunjuk: 'Surah ini hanya 3 ayat.',
    penjelasan: 'Al-Kautsar terdiri atas 3 ayat dan merupakan surah terpendek.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-08', kelas: 5, topik: 'Al-Qur\'an', tipe: 'angka',
    pertanyaan: 'Surah An-Nas terdiri atas berapa ayat?', jawaban: 6,
    petunjuk: 'An-Nas adalah surah terakhir dalam Al-Qur\'an.',
    penjelasan: 'An-Nas terdiri atas 6 ayat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-09', kelas: 5, topik: 'Al-Qur\'an', tipe: 'angka',
    pertanyaan: 'Surah Al-Falaq terdiri atas berapa ayat?', jawaban: 5,
    petunjuk: 'Satu ayat lebih sedikit daripada An-Nas.',
    penjelasan: 'Al-Falaq terdiri atas 5 ayat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-10', kelas: 5, topik: 'Al-Qur\'an', tipe: 'pilihan',
    pertanyaan: 'Surah Al-\'Asr berisi pesan tentang pentingnya ...',
    pilihan: ['menggunakan waktu dengan baik', 'berbakti kepada orang tua', 'menuntut ilmu ke negeri jauh', 'berdagang dengan jujur'],
    jawaban: 'menggunakan waktu dengan baik',
    petunjuk: 'Al-\'Asr artinya "demi masa".',
    penjelasan: 'Al-\'Asr mengingatkan bahwa manusia rugi kecuali yang beriman, beramal saleh, dan saling menasihati.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-11', kelas: 5, topik: 'Puasa', tipe: 'pilihan',
    pertanyaan: 'Puasa wajib bagi umat Islam dilaksanakan pada bulan ...',
    pilihan: ['Ramadan', 'Syawal', 'Muharram', 'Rajab'], jawaban: 'Ramadan',
    petunjuk: 'Setelah bulan ini kita merayakan Idulfitri.',
    penjelasan: 'Puasa wajib dilaksanakan selama bulan Ramadan.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-12', kelas: 5, topik: 'Puasa', tipe: 'pilihan',
    pertanyaan: 'Hal berikut yang membatalkan puasa adalah ...',
    pilihan: ['makan dan minum dengan sengaja', 'makan karena lupa', 'menggosok gigi tanpa menelan air', 'tidur siang'],
    jawaban: 'makan dan minum dengan sengaja',
    petunjuk: 'Perhatikan kata "sengaja".',
    penjelasan: 'Makan dan minum dengan sengaja membatalkan puasa. Makan karena lupa tidak membatalkan.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-13', kelas: 5, topik: 'Zakat', tipe: 'pilihan',
    pertanyaan: 'Zakat yang wajib dikeluarkan setiap muslim menjelang Idulfitri adalah zakat ...',
    pilihan: ['fitrah', 'mal', 'profesi', 'emas'], jawaban: 'fitrah',
    petunjuk: 'Namanya mirip dengan kata Idulfitri.',
    penjelasan: 'Zakat fitrah dikeluarkan di bulan Ramadan sebelum salat Idulfitri, berupa makanan pokok.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-14', kelas: 5, topik: 'Sejarah Nabi Muhammad', tipe: 'pilihan',
    pertanyaan: 'Wahyu pertama yang diterima Nabi Muhammad saw. adalah ...',
    pilihan: ['Surah Al-\'Alaq ayat 1–5', 'Surah Al-Fatihah', 'Surah An-Nas', 'Surah Al-Ikhlas'],
    jawaban: 'Surah Al-\'Alaq ayat 1–5',
    petunjuk: 'Dimulai dengan kata "Iqra" (bacalah).',
    penjelasan: 'Wahyu pertama adalah Al-\'Alaq ayat 1–5 yang dimulai dengan "Iqra".',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-15', kelas: 5, topik: 'Sejarah Nabi Muhammad', tipe: 'pilihan',
    pertanyaan: 'Nabi Muhammad saw. menerima wahyu pertama di ...',
    pilihan: ['Gua Hira', 'Gua Tsur', 'Masjid Nabawi', 'Kota Madinah'], jawaban: 'Gua Hira',
    petunjuk: 'Gua ini berada di Jabal Nur, dekat Mekah.',
    penjelasan: 'Wahyu pertama turun di Gua Hira. Gua Tsur adalah tempat bersembunyi saat hijrah.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-16', kelas: 5, topik: 'Iman kepada Malaikat', tipe: 'pilihan',
    pertanyaan: 'Malaikat yang menanyai manusia di alam kubur adalah ...',
    pilihan: ['Munkar dan Nakir', 'Raqib dan Atid', 'Jibril dan Mikail', 'Malik dan Ridwan'], jawaban: 'Munkar dan Nakir',
    petunjuk: 'Keduanya bertugas di alam kubur.',
    penjelasan: 'Malaikat Munkar dan Nakir menanyai manusia di alam kubur.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-17', kelas: 5, topik: 'Asmaul Husna', tipe: 'pilihan',
    pertanyaan: 'Ar-Razzaq artinya Allah Maha ...',
    pilihan: ['Pemberi Rezeki', 'Pencipta', 'Pengampun', 'Bijaksana'], jawaban: 'Pemberi Rezeki',
    petunjuk: 'Kata ini mirip dengan kata "rezeki".',
    penjelasan: 'Ar-Razzaq artinya Allah Maha Pemberi Rezeki.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-18', kelas: 5, topik: 'Asmaul Husna', tipe: 'pilihan',
    pertanyaan: 'Al-Khaliq artinya Allah Maha ...',
    pilihan: ['Pencipta', 'Pemberi Rezeki', 'Mendengar', 'Kuat'], jawaban: 'Pencipta',
    petunjuk: 'Allah menciptakan langit, bumi, dan seluruh isinya.',
    penjelasan: 'Al-Khaliq artinya Allah Maha Pencipta.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-19', kelas: 5, topik: 'Akhlak', tipe: 'pilihan',
    pertanyaan: 'Penjual memberi uang kembalian lebih dari seharusnya. Sikap yang jujur adalah ...',
    pilihan: ['mengembalikan kelebihannya kepada penjual', 'menyimpannya diam-diam', 'membelikan jajan', 'membagikannya kepada teman'],
    jawaban: 'mengembalikan kelebihannya kepada penjual',
    petunjuk: 'Uang itu bukan hak kita.',
    penjelasan: 'Jujur berarti mengembalikan yang bukan hak kita, walaupun tidak ada yang melihat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-20', kelas: 5, topik: 'Adab Sehari-hari', tipe: 'pilihan',
    pertanyaan: 'Ucapan yang tepat ketika berjanji akan melakukan sesuatu adalah ...',
    pilihan: ['Insya Allah', 'Alhamdulillah', 'Astagfirullah', 'Innalillahi'], jawaban: 'Insya Allah',
    petunjuk: 'Artinya "jika Allah menghendaki".',
    penjelasan: '"Insya Allah" diucapkan saat berjanji, dan janji itu harus berusaha kita tepati.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-21', kelas: 5, topik: 'Al-Qur\'an', tipe: 'teks',
    pertanyaan: 'Surah pertama dalam Al-Qur\'an adalah surah ...',
    jawaban: ['Al-Fatihah', 'Al Fatihah', 'Alfatihah', 'Fatihah'],
    petunjuk: 'Disebut juga Ummul Kitab (induk Al-Qur\'an).',
    penjelasan: 'Al-Fatihah adalah surah pertama dalam susunan mushaf Al-Qur\'an.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai5-22', kelas: 5, topik: 'Al-Qur\'an', tipe: 'urutan',
    pertanyaan: 'Urutkan surah berikut sesuai urutan dalam mushaf Al-Qur\'an.',
    jawaban: ['Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'],
    petunjuk: 'An-Nas adalah surah terakhir.',
    penjelasan: 'Al-Lahab (111), Al-Ikhlas (112), Al-Falaq (113), An-Nas (114).',
    cek: true, // TODO verifikasi
  },

  // ===================== KELAS 6 =====================
  {
    id: 'pai6-01', kelas: 6, topik: 'Al-Qur\'an', tipe: 'pilihan',
    pertanyaan: 'Surah pertama dalam Juz 30 (Juz \'Amma) adalah ...',
    pilihan: ['An-Naba\'', 'An-Nas', 'Al-Fatihah', 'Al-Mulk'], jawaban: 'An-Naba\'',
    petunjuk: 'Juz \'Amma dinamai dari kata pertama surah ini: "\'Amma yatasa\'alun".',
    penjelasan: 'Juz 30 dimulai dengan surah An-Naba\' (surah ke-78) dan diakhiri An-Nas.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-02', kelas: 6, topik: 'Al-Qur\'an', tipe: 'angka',
    pertanyaan: 'Al-Qur\'an terdiri atas berapa juz?', jawaban: 30,
    petunjuk: 'Juz \'Amma adalah juz terakhir.',
    penjelasan: 'Al-Qur\'an terdiri atas 30 juz.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-03', kelas: 6, topik: 'Sejarah Nabi Muhammad', tipe: 'pilihan',
    pertanyaan: 'Nabi Muhammad saw. dilahirkan di kota ...',
    pilihan: ['Mekah', 'Madinah', 'Taif', 'Yerusalem'], jawaban: 'Mekah',
    petunjuk: 'Kota tempat Ka\'bah berada.',
    penjelasan: 'Nabi Muhammad saw. lahir di Mekah pada Tahun Gajah.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-04', kelas: 6, topik: 'Sejarah Nabi Muhammad', tipe: 'pilihan',
    pertanyaan: 'Ayah dan ibu Nabi Muhammad saw. bernama ...',
    pilihan: ['Abdullah dan Aminah', 'Abu Thalib dan Fatimah', 'Abdul Muthalib dan Halimah', 'Abu Bakar dan Khadijah'],
    jawaban: 'Abdullah dan Aminah',
    petunjuk: 'Ayah beliau wafat sebelum beliau lahir.',
    penjelasan: 'Ayah Nabi Muhammad saw. bernama Abdullah dan ibunya bernama Aminah.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-05', kelas: 6, topik: 'Sejarah Nabi Muhammad', tipe: 'pilihan',
    pertanyaan: 'Ibu susu Nabi Muhammad saw. ketika kecil adalah ...',
    pilihan: ['Halimah as-Sa\'diyah', 'Khadijah', 'Aisyah', 'Fatimah'], jawaban: 'Halimah as-Sa\'diyah',
    petunjuk: 'Ia berasal dari Bani Sa\'ad.',
    penjelasan: 'Nabi Muhammad saw. disusui dan diasuh oleh Halimah as-Sa\'diyah di pedesaan.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-06', kelas: 6, topik: 'Sejarah Nabi Muhammad', tipe: 'pilihan',
    pertanyaan: 'Paman yang mengasuh dan melindungi Nabi Muhammad saw. adalah ...',
    pilihan: ['Abu Thalib', 'Abu Lahab', 'Abu Jahal', 'Abu Sufyan'], jawaban: 'Abu Thalib',
    petunjuk: 'Ayah dari Ali bin Abi Thalib.',
    penjelasan: 'Setelah kakeknya Abdul Muthalib wafat, Nabi diasuh pamannya, Abu Thalib.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-07', kelas: 6, topik: 'Sejarah Nabi Muhammad', tipe: 'pilihan',
    pertanyaan: 'Nabi Muhammad saw. dan para sahabat hijrah dari Mekah ke ...',
    pilihan: ['Madinah', 'Taif', 'Mesir', 'Habasyah'], jawaban: 'Madinah',
    petunjuk: 'Nama lama kota ini adalah Yatsrib.',
    penjelasan: 'Nabi hijrah ke Yatsrib yang kemudian dinamai Madinah.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-08', kelas: 6, topik: 'Kisah Nabi', tipe: 'pilihan',
    pertanyaan: 'Nabi yang pernah ditelan ikan besar adalah ...',
    pilihan: ['Nabi Yunus a.s.', 'Nabi Nuh a.s.', 'Nabi Musa a.s.', 'Nabi Ayub a.s.'], jawaban: 'Nabi Yunus a.s.',
    petunjuk: 'Di dalam perut ikan, beliau berdoa memohon ampun kepada Allah.',
    penjelasan: 'Nabi Yunus a.s. ditelan ikan besar lalu diselamatkan Allah setelah bertobat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-09', kelas: 6, topik: 'Kisah Nabi', tipe: 'pilihan',
    pertanyaan: 'Nabi yang dibakar oleh Raja Namrud tetapi selamat atas izin Allah adalah ...',
    pilihan: ['Nabi Ibrahim a.s.', 'Nabi Ismail a.s.', 'Nabi Luth a.s.', 'Nabi Saleh a.s.'], jawaban: 'Nabi Ibrahim a.s.',
    petunjuk: 'Beliau menghancurkan berhala-berhala kaumnya.',
    penjelasan: 'Allah menjadikan api dingin sehingga Nabi Ibrahim a.s. selamat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-10', kelas: 6, topik: 'Kisah Nabi', tipe: 'pilihan',
    pertanyaan: 'Nabi yang diberi mukjizat dapat memahami bahasa hewan adalah ...',
    pilihan: ['Nabi Sulaiman a.s.', 'Nabi Yusuf a.s.', 'Nabi Isa a.s.', 'Nabi Hud a.s.'], jawaban: 'Nabi Sulaiman a.s.',
    petunjuk: 'Ada kisah beliau dengan semut dan burung hud-hud.',
    penjelasan: 'Nabi Sulaiman a.s. memahami bahasa hewan, seperti semut dan burung hud-hud.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-11', kelas: 6, topik: 'Kisah Nabi', tipe: 'pilihan',
    pertanyaan: 'Nabi yang diperintah Allah membuat kapal besar sebelum banjir besar datang adalah ...',
    pilihan: ['Nabi Nuh a.s.', 'Nabi Musa a.s.', 'Nabi Yunus a.s.', 'Nabi Adam a.s.'], jawaban: 'Nabi Nuh a.s.',
    petunjuk: 'Beliau termasuk Rasul Ulul Azmi.',
    penjelasan: 'Nabi Nuh a.s. membuat kapal untuk menyelamatkan orang beriman dan hewan.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-12', kelas: 6, topik: 'Kisah Nabi', tipe: 'pilihan',
    pertanyaan: 'Nabi yang tongkatnya dapat membelah Laut Merah atas izin Allah adalah ...',
    pilihan: ['Nabi Musa a.s.', 'Nabi Harun a.s.', 'Nabi Ibrahim a.s.', 'Nabi Isa a.s.'], jawaban: 'Nabi Musa a.s.',
    petunjuk: 'Beliau menerima Kitab Taurat.',
    penjelasan: 'Laut Merah terbelah ketika Nabi Musa a.s. memukulkan tongkatnya atas perintah Allah.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-13', kelas: 6, topik: 'Rukun Iman', tipe: 'pilihan',
    pertanyaan: 'Iman kepada qada dan qadar adalah rukun iman yang ke- ...',
    pilihan: ['6', '5', '4', '3'], jawaban: '6',
    petunjuk: 'Ini rukun iman yang terakhir.',
    penjelasan: 'Iman kepada qada dan qadar adalah rukun iman keenam.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-14', kelas: 6, topik: 'Rukun Iman', tipe: 'pilihan',
    pertanyaan: 'Nama lain hari akhir adalah ...',
    pilihan: ['hari kiamat', 'hari raya', 'hari Jumat', 'hari Arafah'], jawaban: 'hari kiamat',
    petunjuk: 'Hari ketika seluruh alam semesta hancur.',
    penjelasan: 'Hari akhir disebut juga hari kiamat.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-15', kelas: 6, topik: 'Tajwid', tipe: 'pilihan',
    pertanyaan: 'Nun sukun atau tanwin bertemu huruf ba (ب) dibaca ...',
    pilihan: ['iqlab', 'izhar', 'idgam', 'ikhfa'], jawaban: 'iqlab',
    petunjuk: 'Bunyi nun berubah menjadi bunyi mim.',
    penjelasan: 'Iqlab: nun sukun/tanwin bertemu ba, bunyinya berubah menjadi mim dan didengungkan.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-16', kelas: 6, topik: 'Tajwid', tipe: 'pilihan',
    pertanyaan: 'Huruf qalqalah ada lima, yaitu ...',
    pilihan: ['qaf, tha, ba, jim, dal', 'alif, ba, ta, tsa, jim', 'ha, kha, \'ain, ghain, hamzah', 'mim, nun, waw, ya, lam'],
    jawaban: 'qaf, tha, ba, jim, dal',
    petunjuk: 'Sering dihafal dengan "baju di thoqo".',
    penjelasan: 'Huruf qalqalah: qaf (ق), tha (ط), ba (ب), jim (ج), dal (د).',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-17', kelas: 6, topik: 'Tajwid', tipe: 'angka',
    pertanyaan: 'Huruf izhar halqi (huruf tenggorokan) jumlahnya ada ...', jawaban: 6,
    petunjuk: 'Hamzah, ha, \'ain, ha, ghain, kha.',
    penjelasan: 'Huruf izhar halqi ada 6: hamzah (ء), ha (ه), \'ain (ع), ha (ح), ghain (غ), kha (خ).',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-18', kelas: 6, topik: 'Tajwid', tipe: 'pilihan',
    pertanyaan: 'Mim sukun bertemu huruf ba (ب) dibaca ...',
    pilihan: ['ikhfa syafawi', 'idgam mimi', 'izhar syafawi', 'iqlab'], jawaban: 'ikhfa syafawi',
    petunjuk: '"Syafawi" berarti bibir. Bunyinya samar dan berdengung.',
    penjelasan: 'Mim sukun + ba = ikhfa syafawi. Mim sukun + mim = idgam mimi. Huruf lain = izhar syafawi.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-19', kelas: 6, topik: 'Asmaul Husna', tipe: 'angka',
    pertanyaan: 'Jumlah Asmaul Husna yang terkenal adalah ...', jawaban: 99,
    petunjuk: 'Dua angka yang sama.',
    penjelasan: 'Asmaul Husna (nama-nama Allah yang baik) yang terkenal berjumlah 99.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-20', kelas: 6, topik: 'Asmaul Husna', tipe: 'pilihan',
    pertanyaan: 'Al-Ghafur artinya Allah Maha ...',
    pilihan: ['Pengampun', 'Pemberi Rezeki', 'Pencipta', 'Melihat'], jawaban: 'Pengampun',
    petunjuk: 'Kata ini mirip dengan "istigfar" (memohon ampun).',
    penjelasan: 'Al-Ghafur artinya Allah Maha Pengampun.',
    cek: true, // TODO verifikasi
  },
  {
    id: 'pai6-21', kelas: 6, topik: 'Rukun Islam', tipe: 'urutan',
    pertanyaan: 'Urutkan Rukun Islam dari yang pertama.',
    jawaban: ['Syahadat', 'Salat', 'Zakat', 'Puasa Ramadan', 'Haji'],
    petunjuk: 'Rukun Islam pertama adalah mengucapkan dua kalimat syahadat.',
    penjelasan: 'Syahadat, salat, zakat, puasa Ramadan, dan haji bagi yang mampu.',
    cek: true, // TODO verifikasi
  },
];
