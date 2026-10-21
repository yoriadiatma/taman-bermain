// kata.js — daftar kata untuk Petualangan Kata, per kelas.
//
// Format: { kata, petunjuk, penjelasan, keliru?, cek? }
// - kata     : jawaban dalam ejaan baku (KBBI/EYD V). Huruf besar semua; tanda hubung boleh untuk kata ulang.
// - petunjuk : teka-teki yang ditampilkan di layar.
// - keliru   : (opsional) ejaan yang sering keliru; hurufnya dipakai sebagai huruf pengecoh.
// - cek      : true = mohon diverifikasi guru (TODO verifikasi).
// Guru boleh menambah kata dengan format yang sama. Kata ditampilkan dengan huruf kapital di labirin.

export const KATA = {
  4: [
    { kata: 'MASJID', petunjuk: 'Tempat ibadah umat Islam', penjelasan: 'Masjid adalah tempat ibadah umat Islam, misalnya untuk salat berjemaah.' },
    { kata: 'SEKOLAH', petunjuk: 'Tempat kita belajar bersama guru', penjelasan: 'Sekolah adalah tempat belajar dan mengajar.' },
    { kata: 'APOTEK', petunjuk: 'Toko yang menjual obat (tulis dengan ejaan baku)', keliru: 'APOTIK', penjelasan: 'Kata bakunya "apotek", bukan "apotik".' },
    { kata: 'JADWAL', petunjuk: 'Daftar kegiatan beserta waktunya (ejaan baku)', keliru: 'JADUAL', penjelasan: 'Kata bakunya "jadwal", bukan "jadual".' },
    { kata: 'MENULIS', petunjuk: 'Kata dasar "tulis" mendapat awalan me-', penjelasan: 'me- + tulis = menulis. Huruf t luluh menjadi n.' },
    { kata: 'MENYAPU', petunjuk: 'Kata dasar "sapu" mendapat awalan me-', penjelasan: 'me- + sapu = menyapu. Huruf s luluh menjadi ny.' },
    { kata: 'BERMAIN', petunjuk: 'Kata dasar "main" mendapat awalan ber-', penjelasan: 'ber- + main = bermain.' },
    { kata: 'PELANGI', petunjuk: 'Lengkungan warna-warni di langit setelah hujan', penjelasan: 'Pelangi muncul saat cahaya matahari diuraikan oleh titik-titik air hujan.' },
    { kata: 'KUPU-KUPU', petunjuk: 'Serangga bersayap indah yang dulunya ulat (kata ulang)', penjelasan: 'Kata ulang ditulis dengan tanda hubung: kupu-kupu.' },
    { kata: 'SALAT', petunjuk: 'Ibadah wajib lima kali sehari (ejaan baku)', keliru: 'SHOLAT', penjelasan: 'Dalam KBBI, ejaan bakunya "salat".', cek: true }, // TODO verifikasi
    { kata: 'WUDU', petunjuk: 'Bersuci sebelum salat dengan membasuh anggota tubuh (ejaan baku)', keliru: 'WUDHU', penjelasan: 'Dalam KBBI, ejaan bakunya "wudu".', cek: true }, // TODO verifikasi
    { kata: 'MALAS', petunjuk: 'Lawan kata "rajin"', penjelasan: 'Rajin berlawanan dengan malas.' },
    { kata: 'PINTAR', petunjuk: 'Persamaan kata "pandai"', penjelasan: 'Pandai dan pintar memiliki arti yang sama (sinonim).' },
    { kata: 'TELUR', petunjuk: 'Ayam berkembang biak dengan cara ber... (ejaan baku)', keliru: 'TELOR', penjelasan: 'Kata bakunya "telur", bukan "telor". Ayam berkembang biak dengan bertelur.' },
    { kata: 'HARIMAU', petunjuk: 'Hewan buas pemakan daging yang tubuhnya loreng', penjelasan: 'Harimau termasuk karnivora (pemakan daging).' },
  ],
  5: [
    { kata: 'PRAKTIK', petunjuk: 'Pelaksanaan secara nyata, misalnya ... di laboratorium (ejaan baku)', keliru: 'PRAKTEK', penjelasan: 'Kata bakunya "praktik", bukan "praktek".' },
    { kata: 'RISIKO', petunjuk: 'Akibat yang kurang menyenangkan dari suatu perbuatan (ejaan baku)', keliru: 'RESIKO', penjelasan: 'Kata bakunya "risiko", bukan "resiko".' },
    { kata: 'NASIHAT', petunjuk: 'Pesan baik dari orang tua atau guru (ejaan baku)', keliru: 'NASEHAT', penjelasan: 'Kata bakunya "nasihat", bukan "nasehat".' },
    { kata: 'AKTIVITAS', petunjuk: 'Kata lain dari "kegiatan" (ejaan baku)', keliru: 'AKTIFITAS', penjelasan: 'Kata bakunya "aktivitas" dengan huruf v.' },
    { kata: 'KUALITAS', petunjuk: 'Mutu suatu barang (ejaan baku)', keliru: 'KWALITAS', penjelasan: 'Kata bakunya "kualitas", bukan "kwalitas".' },
    { kata: 'SISTEM', petunjuk: 'Susunan yang teratur, misalnya ... pencernaan (ejaan baku)', keliru: 'SISTIM', penjelasan: 'Kata bakunya "sistem", bukan "sistim".' },
    { kata: 'TERAMPIL', petunjuk: 'Persamaan kata "mahir"', penjelasan: 'Mahir dan terampil sama-sama berarti cakap melakukan sesuatu.' },
    { kata: 'HEMAT', petunjuk: 'Lawan kata "boros"', penjelasan: 'Boros berlawanan dengan hemat.' },
    { kata: 'ANAK-ANAK', petunjuk: 'Bentuk jamak dari "anak" (kata ulang)', penjelasan: 'Kata ulang utuh ditulis dengan tanda hubung: anak-anak.' },
    { kata: 'BOLAK-BALIK', petunjuk: 'Kata ulang berubah bunyi dari kata "balik"', penjelasan: 'Pada bolak-balik, bunyi a berubah menjadi o di bagian pertama.' },
    { kata: 'SEDEKAH', petunjuk: 'Pemberian dengan ikhlas kepada orang yang membutuhkan', penjelasan: 'Sedekah adalah pemberian dengan ikhlas untuk mengharap rida Allah.', cek: true }, // TODO verifikasi
    { kata: 'RAMADAN', petunjuk: 'Bulan ketika umat Islam berpuasa wajib (ejaan baku)', keliru: 'RAMADHAN', penjelasan: 'Ejaan bakunya "Ramadan". Nama bulan ditulis dengan huruf kapital di awal.', cek: true }, // TODO verifikasi
    { kata: 'FOTOSINTESIS', petunjuk: 'Proses tumbuhan membuat makanan dengan bantuan cahaya matahari', penjelasan: 'Foto = cahaya, sintesis = menyusun.' },
    { kata: 'PENGURAI', petunjuk: 'Makhluk hidup yang menguraikan sisa makhluk hidup, misalnya jamur', penjelasan: 'Pengurai seperti jamur dan bakteri menguraikan sisa makhluk hidup.' },
    { kata: 'DIKIRIM', petunjuk: 'Kata "kirim" mendapat awalan di- (ditulis serangkai)', penjelasan: 'Awalan di- pada kata kerja ditulis serangkai: dikirim.' },
  ],
  6: [
    { kata: 'IMBAU', petunjuk: 'Ajakan atau seruan (ejaan baku, tanpa huruf h)', keliru: 'HIMBAU', penjelasan: 'Kata bakunya "imbau" (mengimbau, imbauan).' },
    { kata: 'MENGUBAH', petunjuk: 'Membuat menjadi lain (ejaan baku, dari kata "ubah")', keliru: 'MERUBAH', penjelasan: 'Dari kata dasar "ubah" + meng- = mengubah. Rubah adalah nama hewan.' },
    { kata: 'IZIN', petunjuk: 'Persetujuan untuk melakukan sesuatu (ejaan baku)', keliru: 'IJIN', penjelasan: 'Kata bakunya "izin", bukan "ijin".' },
    { kata: 'IJAZAH', petunjuk: 'Surat tanda tamat belajar (ejaan baku)', keliru: 'IJASAH', penjelasan: 'Kata bakunya "ijazah" dengan huruf z.' },
    { kata: 'KITAB', petunjuk: 'Kata serapan dari bahasa Arab yang berarti buku', penjelasan: 'Kitab berasal dari bahasa Arab.' },
    { kata: 'SAMPIRAN', petunjuk: 'Dua baris pertama pada pantun', penjelasan: 'Baris 1–2 pantun adalah sampiran, baris 3–4 adalah isi.' },
    { kata: 'HIPERBOLA', petunjuk: 'Majas yang melebih-lebihkan sesuatu', penjelasan: 'Contoh hiperbola: "Tangisnya membanjiri seluruh kampung."' },
    { kata: 'PERSONIFIKASI', petunjuk: 'Majas yang membuat benda seolah-olah bisa berbuat seperti manusia', penjelasan: 'Contoh personifikasi: "Daun melambai-lambai."' },
    { kata: 'PEMBANGUNAN', petunjuk: 'Proses membangun (kata dasar "bangun" + imbuhan pe-an)', penjelasan: 'pe-an + bangun = pembangunan, bermakna proses.' },
    { kata: 'KONDUKTOR', petunjuk: 'Benda yang dapat menghantarkan listrik dengan baik', penjelasan: 'Contoh konduktor: tembaga, besi, aluminium.' },
    { kata: 'REVOLUSI', petunjuk: 'Gerak Bumi mengelilingi Matahari', penjelasan: 'Revolusi Bumi menyebabkan pergantian musim.' },
    { kata: 'MUSYAWARAH', petunjuk: 'Berunding bersama untuk mengambil keputusan', penjelasan: 'Musyawarah dilakukan agar keputusan disetujui bersama.' },
    { kata: 'ZAKAT', petunjuk: 'Harta yang wajib dikeluarkan muslim yang mampu untuk orang yang berhak', penjelasan: 'Zakat termasuk rukun Islam.', cek: true }, // TODO verifikasi
    { kata: 'ISTIQLAL', petunjuk: 'Nama masjid besar di Jakarta', penjelasan: 'Masjid Istiqlal terletak di Jakarta.', cek: true }, // TODO verifikasi
    { kata: 'IDULFITRI', petunjuk: 'Hari raya umat Islam setelah puasa Ramadan (ditulis serangkai)', keliru: 'IDULFITHRI', penjelasan: 'Ejaan bakunya "Idulfitri", ditulis serangkai.', cek: true }, // TODO verifikasi
  ],
};
