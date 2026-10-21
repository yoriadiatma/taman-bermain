// uji.js — uji hitungan uang dan skenario Pasar Mini. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { PECAHAN, BARANG_PASAR } from '../../../data/pasar.js';
import { rupiah, susunanTersedikit, jumlahUang } from './uang.js';
import { buatPembeli, soalTotal, soalInfak, buatTugasBelanja, buatTargetUang, bintangPelanggan, levelToko, barangTersedia } from './skenario.js';
import { periksaJawaban } from '../../core/quiz.js';

const uji = (nama, fn) => ujiDasar('Pasar Mini', nama, fn);

uji('Format rupiah', () => {
  sama(rupiah(13500), 'Rp13.500');
  sama(rupiah(500), 'Rp500');
  sama(rupiah(100000), 'Rp100.000');
});

uji('Susunan uang paling sedikit', () => {
  sama(susunanTersedikit(7500), [5000, 2000, 500]);
  sama(susunanTersedikit(18800), [10000, 5000, 2000, 1000, 500, 200, 100]);
  sama(susunanTersedikit(400), [200, 200]);
  sama(susunanTersedikit(150), null, 'tidak ada pecahan di bawah Rp100:');
  // Dibandingkan dengan pencarian lengkap (pemrograman dinamis) untuk memastikan cara serakah benar.
  const nilai = [...new Set(PECAHAN.map(p => p.nilai))];
  for (let n = 100; n <= 30000; n += 100) {
    const dp = new Array(n / 100 + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i < dp.length; i++) for (const v of nilai) if (v / 100 <= i) dp[i] = Math.min(dp[i], dp[i - v / 100] + 1);
    sama(susunanTersedikit(n).length, dp[n / 100], `Rp${n}:`);
  }
});

uji('Harga barang kelipatan Rp500 dan unik', () => {
  for (const b of BARANG_PASAR) benar(b.harga > 0 && b.harga % 500 === 0, `${b.nama}`);
  sama(new Set(BARANG_PASAR.map(b => b.id)).size, BARANG_PASAR.length);
});

uji('Pembeli kasir: total, pembayaran, dan kembalian selalu benar dan wajar', () => {
  const batas = { 4: 20000, 5: 100000, 6: 200000 };
  for (const kelas of [4, 5, 6]) {
    for (const level of [1, 2, 3, 4]) {
      for (let i = 0; i < 150; i++) {
        const p = buatPembeli(kelas, level);
        const sub = p.daftar.reduce((n, d) => n + d.harga * d.jumlah, 0);
        sama(p.subtotal, sub);
        sama(p.total, sub - (sub * p.diskon) / 100);
        benar(p.total > 0 && p.total <= batas[kelas], `total ${p.total} kelas ${kelas}`);
        benar(p.total % 100 === 0, `total ${p.total} bukan kelipatan Rp100`);
        if (kelas === 4) sama(p.diskon, 0, 'kelas 4 tanpa diskon:');
        const dibayar = jumlahUang(p.bayar);
        benar(dibayar >= p.total, 'uang pembeli kurang');
        sama(p.kembalian, dibayar - p.total);
        benar(susunanTersedikit(p.kembalian) !== null || p.kembalian === 0, 'kembalian tidak bisa disusun');
        // Tidak ada lembar yang tidak perlu.
        for (const n of p.bayar) benar(dibayar - n < p.total || p.bayar.length === 1, `lembar ${n} tidak perlu`);
        for (const d of p.daftar) benar(barangTersedia(level).includes(d.barang), 'barang belum terbuka di level ini');
        benar(periksaJawaban(soalTotal(p, kelas), String(p.total)), 'soal total');
      }
    }
  }
});

uji('Soal infak bernilai benar', () => {
  for (const kelas of [4, 5, 6]) {
    for (const pendapatan of [12500, 47000, 99900, 150000]) {
      const s = soalInfak(pendapatan, kelas);
      benar(Number.isInteger(s.jawaban) && s.jawaban >= 0, 'jawaban bulat');
      const persen = kelas === 4 ? 10 : Number(s.pertanyaan.match(/(\d+)%/)[1]);
      sama(s.jawaban, (s.dasar * persen) / 100, s.pertanyaan);
    }
  }
});

uji('Tugas belanja: dompet cukup dan semua barang ada di rak', () => {
  for (const kelas of [4, 5, 6]) {
    for (let i = 0; i < 100; i++) {
      const t = buatTugasBelanja(kelas, 2);
      sama(t.total, t.daftar.reduce((n, d) => n + d.barang.harga * d.jumlah, 0));
      benar(jumlahUang(t.dompet) >= t.total, 'dompet kurang');
      for (const d of t.daftar) benar(t.rak.includes(d.barang), `${d.barang.nama} tidak ada di rak`);
    }
  }
});

uji('Target Kenali Uang selalu bisa disusun', () => {
  for (const kelas of [4, 5, 6]) for (let i = 0; i < 100; i++) benar(susunanTersedikit(buatTargetUang(kelas)), 'tidak bisa disusun');
});

uji('Bintang pelanggan dan level toko', () => {
  sama(bintangPelanggan({ totalPertama: true, kembalianPertama: true, lembar: 3, kembalian: 7500 }), 3);
  sama(bintangPelanggan({ totalPertama: true, kembalianPertama: true, lembar: 5, kembalian: 7500 }), 2);
  sama(bintangPelanggan({ totalPertama: false, kembalianPertama: false, lembar: 0, kembalian: 7500 }), 1);
  sama([0, 5, 15, 30].map(levelToko), [1, 2, 3, 4]);
});
