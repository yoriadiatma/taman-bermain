// skenario.js — membuat pembeli, belanjaan, dan soal uang sesuai kelas (tanpa DOM).

import { BARANG_PASAR, PEMBELI } from '../../../data/pasar.js';
import { rupiah, susunanTersedikit } from './uang.js';

export const PELANGGAN_PER_HARI = 5;

/** Level toko dari jumlah pelanggan yang sudah dilayani. Barang baru terbuka di setiap level. */
export function levelToko(pelanggan) {
  if (pelanggan >= 30) return 4;
  if (pelanggan >= 15) return 3;
  if (pelanggan >= 5) return 2;
  return 1;
}
export const barangTersedia = level => BARANG_PASAR.slice(0, [0, 8, 12, 16, 20][level]);

const BATAS_TOTAL = { 4: 20000, 5: 100000, 6: 200000 };

const pilih = (daftar, acak) => daftar[Math.floor(acak() * daftar.length)];
function ambilAcak(daftar, n, acak) {
  const a = [...daftar];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

/**
 * Uang yang diberikan pembeli: sering satu lembar yang cukup, kadang 2–3 lembar
 * (mis. Rp10.000 + Rp5.000 untuk belanja Rp13.500). Selalu cukup untuk membayar.
 */
function uangBayar(total, acak) {
  const lembar = [2000, 5000, 10000, 20000, 50000, 100000];
  const satu = lembar.find(n => n >= total);
  if (satu && acak() < 0.65) return [satu];
  const hasil = [];
  let sisa = total;
  while (sisa > 0) {
    const besar = [...lembar].reverse().find(n => n <= sisa);
    if (!besar || hasil.length >= 2 || acak() < 0.4) {
      const kecil = lembar.find(n => n >= sisa) ?? 100000;
      hasil.push(kecil);
      sisa -= kecil;
    } else {
      hasil.push(besar);
      sisa -= besar;
    }
  }
  // Pembeli tidak memberi lembar yang tidak perlu: buang lembar kecil jika sisanya masih cukup.
  hasil.sort((x, y) => y - x);
  for (let i = hasil.length - 1; i >= 0 && hasil.length > 1; i--) {
    const tanpa = hasil.reduce((a, b) => a + b, 0) - hasil[i];
    if (tanpa >= total) hasil.splice(i, 1);
  }
  return hasil;
}

/**
 * Pembeli untuk mode Kasir.
 * { pembeli, daftar: [{ barang, jumlah, harga }], diskon (persen, 0 = tidak ada), subtotal, total, bayar: [nilai], kembalian }
 */
export function buatPembeli(kelas, level, acak = Math.random) {
  const tersedia = barangTersedia(level).filter(b => b.harga <= BATAS_TOTAL[kelas] / 2);
  const batas = BATAS_TOTAL[kelas] ?? 20000;
  for (let coba = 0; coba < 200; coba++) {
    const banyak = kelas === 4 ? 1 + Math.floor(acak() * 3) : 2 + Math.floor(acak() * (kelas === 5 ? 2 : 3));
    const daftar = ambilAcak(tersedia, banyak, acak).map(barang => {
      const maksJumlah = kelas === 4 ? 2 : kelas === 5 ? 4 : 5;
      return { barang, jumlah: 1 + Math.floor(acak() * maksJumlah), harga: barang.harga };
    });
    const subtotal = daftar.reduce((n, d) => n + d.harga * d.jumlah, 0);
    // Diskon: kelas 5 kadang 10/25/50%, kelas 6 sering. Hasil harus kelipatan Rp100.
    let diskon = 0;
    if (kelas >= 5 && acak() < (kelas === 5 ? 0.35 : 0.6)) {
      const pilihan = [10, 20, 25, 50].filter(d => (subtotal * d) % 10000 === 0);
      if (pilihan.length) diskon = pilih(pilihan, acak);
    }
    const total = subtotal - (subtotal * diskon) / 100;
    if (total > batas || total <= 0 || total % 100 !== 0) continue;
    const bayar = uangBayar(total, acak);
    const kembalian = bayar.reduce((a, b) => a + b, 0) - total;
    return { pembeli: pilih(PEMBELI, acak), daftar, diskon, subtotal, total, bayar, kembalian };
  }
  throw new Error('Gagal membuat pembeli');
}

const baris = d => `${d.jumlah} × ${d.barang.emoji} ${d.barang.nama} @ ${rupiah(d.harga)}`;

/** Soal menghitung total belanja (format soal quiz.js). */
export function soalTotal(p, kelas) {
  const daftar = p.daftar.map(baris).join('\n');
  const rincian = p.daftar.map(d => `${d.jumlah} × ${rupiah(d.harga)} = ${rupiah(d.jumlah * d.harga)}`).join('; ');
  const pakaiDiskon = p.diskon > 0;
  return {
    id: pakaiDiskon ? 'pasar-total-diskon' : 'pasar-total',
    mapel: 'matematika',
    kelas,
    topik: pakaiDiskon ? 'Persen' : 'Uang dan Belanja',
    tipe: 'angka',
    pertanyaan: `${p.pembeli.nama} membeli:\n${daftar}${pakaiDiskon ? `\nSemua belanjaan mendapat diskon ${p.diskon}%.` : ''}\nBerapa rupiah yang harus dibayar?`,
    jawaban: p.total,
    petunjuk: pakaiDiskon
      ? `Hitung dulu jumlah semua: ${rincian}. Lalu kurangi dengan ${p.diskon}% dari jumlah itu.`
      : `Kalikan jumlah dengan harga, lalu jumlahkan: ${rincian}.`,
    penjelasan: pakaiDiskon
      ? `Jumlah ${rupiah(p.subtotal)}, diskon ${p.diskon}% = ${rupiah((p.subtotal * p.diskon) / 100)}. Yang dibayar ${rupiah(p.total)}.`
      : `Totalnya ${rupiah(p.total)}.`,
  };
}

/** Catatan soal kembalian untuk statistik (kembalian disusun dengan uang, bukan diketik). */
export function soalKembalian(p, kelas) {
  return {
    id: 'pasar-kembalian', mapel: 'matematika', kelas, topik: 'Uang dan Belanja', tipe: 'angka',
    pertanyaan: `Kembalian dari ${rupiah(p.bayar.reduce((a, b) => a + b, 0))} untuk belanja ${rupiah(p.total)}`,
    jawaban: p.kembalian,
  };
}

/** Bintang untuk satu pelanggan: total benar di percobaan pertama, kembalian tepat, dan lembar paling sedikit. */
export function bintangPelanggan({ totalPertama, kembalianPertama, lembar, kembalian }) {
  const tersedikit = kembalian > 0 ? susunanTersedikit(kembalian).length : 0;
  let b = 1;
  if (totalPertama) b++;
  if (kembalianPertama && lembar <= tersedikit) b++;
  return b;
}

/** Soal infak di akhir hari: menyisihkan sebagian pendapatan (latihan pecahan/persen). */
export function soalInfak(pendapatan, kelas, acak = Math.random) {
  if (kelas <= 4) {
    const bagian = Math.floor(pendapatan / 1000) * 100; // 1/10, dibulatkan ke bawah ke ratusan
    return {
      id: 'pasar-infak-4', mapel: 'matematika', kelas, topik: 'Pecahan', tipe: 'angka',
      pertanyaan: `Pendapatan hari ini ${rupiah(Math.floor(pendapatan / 1000) * 1000)}. Kamu ingin menyisihkan 1/10 untuk kotak infak. Berapa rupiah?`,
      jawaban: bagian,
      petunjuk: '1/10 artinya dibagi 10.',
      penjelasan: `${rupiah(Math.floor(pendapatan / 1000) * 1000)} : 10 = ${rupiah(bagian)}.`,
      dasar: Math.floor(pendapatan / 1000) * 1000,
    };
  }
  const persen = kelas === 5 ? 10 : pilih([5, 10, 20], acak);
  const dasar = Math.floor(pendapatan / 1000) * 1000;
  const bagian = (dasar * persen) / 100;
  return {
    id: `pasar-infak-${kelas}`, mapel: 'matematika', kelas, topik: 'Persen', tipe: 'angka',
    pertanyaan: `Pendapatan hari ini ${rupiah(dasar)}. Kamu ingin menyisihkan ${persen}% untuk kotak infak. Berapa rupiah?`,
    jawaban: bagian,
    petunjuk: `${persen}% artinya ${persen}/100. Kalikan ${rupiah(dasar)} dengan ${persen}, lalu bagi 100.`,
    penjelasan: `${persen}% × ${rupiah(dasar)} = ${rupiah(bagian)}.`,
    dasar,
  };
}

// ---------- Mode Pembeli ----------

/**
 * Tugas belanja: { daftar: [{ barang, jumlah }], total, dompet: [nilai], rak: [barang] }.
 * Isi dompet selalu cukup untuk membayar.
 */
export function buatTugasBelanja(kelas, level, acak = Math.random) {
  const rak = barangTersedia(Math.max(level, 2));
  for (let coba = 0; coba < 200; coba++) {
    const banyak = kelas === 4 ? 2 : 2 + Math.floor(acak() * 2);
    const daftar = ambilAcak(rak, banyak, acak).map(barang => ({ barang, jumlah: 1 + Math.floor(acak() * (kelas === 4 ? 2 : 3)) }));
    const total = daftar.reduce((n, d) => n + d.barang.harga * d.jumlah, 0);
    if (total > BATAS_TOTAL[kelas]) continue;
    // Dompet: uang kertas yang jumlahnya cukup (sedikit lebih dari total), ditambah uang kecil.
    const lebih = Math.ceil((total + acak() * 10000) / 1000) * 1000;
    const dompet = susunanTersedikit(lebih, [100000, 50000, 20000, 10000, 5000, 2000, 1000]);
    dompet.push(500);
    // Rak berisi semua barang di daftar belanja, ditambah barang lain sebagai pilihan.
    const lain = ambilAcak(rak.filter(b => !daftar.some(d => d.barang === b)), 6 - daftar.length, acak);
    return { daftar, total, dompet: dompet.sort((x, y) => y - x), rak: ambilAcak([...daftar.map(d => d.barang), ...lain], 6, acak) };
  }
  throw new Error('Gagal membuat tugas belanja');
}

// ---------- Mode Kenali Uang ----------

/** Jumlah uang yang harus disusun anak. */
export function buatTargetUang(kelas, acak = Math.random) {
  const [min, maks] = { 4: [1500, 20000], 5: [5000, 100000], 6: [10000, 200000] }[kelas] ?? [1500, 20000];
  const langkah = kelas === 4 ? 500 : 100;
  const n = Math.floor((min + acak() * (maks - min)) / langkah) * langkah;
  return Math.max(min, n);
}
