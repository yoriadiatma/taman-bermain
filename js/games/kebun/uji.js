// uji.js — uji aturan Kebun Ceria. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { TANAMAN, HEWAN } from '../../../data/kebun.js';
import {
  kebunBaru, rapikan, jumlah, benihId, tahapKe, statusPetak, siapPanen, hariSampaiPanen, tanam, siram, beriKompos,
  panen, buatKompos, ambilRumput, beriMakan, ambilProduk, jual, beli, hargaPetak, tidur, soalSiklus, soalBagi,
  bagikan, soalJenisMakan, hasilPanen, PETAK_MAKS,
} from './logika.js';
import { GAMBAR_HEWAN, svgPetak } from './gambar.js';
import { periksaJawaban } from '../../core/quiz.js';

const uji = (nama, fn) => ujiDasar('Kebun Ceria', nama, fn);
const cerah = () => 0.99; // tidak pernah hujan
const hujan = () => 0.01;

uji('Tanaman tumbuh hanya jika disiram, lalu siap dipanen', () => {
  const k = kebunBaru();
  sama(tanam(k, 0, 'bayam'), null);
  sama(jumlah(k, benihId('bayam')), 1);
  benar(tanam(k, 0, 'jagung'), 'petak terisi seharusnya ditolak');
  tidur(k, cerah); // tidak disiram
  sama(k.petak[0].umur, 0, 'tanpa air tidak tumbuh:');
  for (let h = 0; h < hariSampaiPanen('bayam'); h++) {
    sama(siram(k, 0), null);
    benar(siram(k, 0), 'menyiram dua kali sehari ditolak');
    tidur(k, cerah);
  }
  benar(siapPanen(k.petak[0]), 'seharusnya siap panen');
  sama(statusPetak(k.petak[0]), 'siap');
  const r = panen(k, 0, 2);
  sama(r, { id: 'bayam', n: TANAMAN.bayam.hasil + 2 });
  sama(jumlah(k, 'bayam'), TANAMAN.bayam.hasil + 2);
  sama(jumlah(k, 'sisa'), 1);
  sama(k.petak[0], null);
});

uji('Tidak disiram 2 hari: layu, lalu pulih jika disiram', () => {
  const k = kebunBaru();
  tanam(k, 0, 'jagung');
  tidur(k, cerah);
  benar(!k.petak[0].layu, 'satu hari belum layu');
  tidur(k, cerah);
  benar(k.petak[0].layu, 'dua hari seharusnya layu');
  sama(statusPetak(k.petak[0]), 'layu');
  siram(k, 0);
  const r = tidur(k, cerah);
  sama(r.pulih, 1);
  benar(!k.petak[0].layu, 'seharusnya pulih');
  sama(k.petak[0].umur, 0, 'hari pulih tidak menambah umur:');
});

uji('Hujan menyiram semua tanaman', () => {
  const k = kebunBaru();
  tanam(k, 0, 'bayam');
  tanam(k, 1, 'jagung');
  const r = tidur(k, hujan);
  benar(r.hujan, 'seharusnya hujan');
  benar(k.petak[0].disiram && k.petak[1].disiram, 'semua tersiram hujan');
});

uji('Kompos: 3 sisa menjadi 1 kompos, hasil panen +50%', () => {
  const k = kebunBaru();
  k.gudang.sisa = 3;
  sama(buatKompos(k), null);
  sama(jumlah(k, 'kompos'), 1);
  benar(buatKompos(k), 'sisa kurang seharusnya ditolak');
  tanam(k, 0, 'jagung');
  sama(beriKompos(k, 0), null);
  sama(hasilPanen(k.petak[0]), Math.ceil(TANAMAN.jagung.hasil * 1.5));
});

uji('Tahap tumbuh sesuai umur untuk semua tanaman', () => {
  for (const [id, d] of Object.entries(TANAMAN)) {
    sama(new Set(d.tahap).size, d.tahap.length, `${id}: nama tahap harus unik`);
    for (let umur = 0; umur <= hariSampaiPanen(id) + 2; umur++) {
      const t = { id, umur };
      benar(tahapKe(t) >= 0 && tahapKe(t) < d.tahap.length, `${id} umur ${umur}`);
    }
    benar(siapPanen({ id, umur: hariSampaiPanen(id) }), `${id}: siap di hari ${hariSampaiPanen(id)}`);
    benar(!siapPanen({ id, umur: hariSampaiPanen(id) - 1 }), `${id}: belum siap sebelumnya`);
    benar(d.hasil >= 4 && d.hargaJual * d.hasil > d.hargaBenih, `${id}: panen harus menguntungkan`);
    benar(svgPetak({ id, umur: hariSampaiPanen(id), disiram: true }).startsWith('<svg'), `${id}: gambar`);
  }
});

uji('Hewan: makan hari ini, hasil besok', () => {
  const k = kebunBaru();
  k.koin = 100;
  sama(beli(k, 'hewan', 'ayam'), null);
  sama(k.koin, 100 - HEWAN.ayam.harga);
  benar(beriMakan(k, 0), 'tanpa jagung seharusnya ditolak');
  k.gudang.jagung = 2;
  sama(beriMakan(k, 0), null);
  benar(ambilProduk(k, 0), 'hari ini belum ada telur');
  tidur(k, cerah);
  sama(ambilProduk(k, 0), { id: 'telur', n: 1 });
  sama(jumlah(k, 'telur'), 1);
  // Rumput untuk kambing
  sama(ambilRumput(k), null);
  benar(ambilRumput(k), 'rumput hari ini sudah diambil');
  sama(jumlah(k, 'rumput'), 3);
});

uji('Jual beli dan batas lahan', () => {
  const k = kebunBaru();
  k.gudang.tomat = 5;
  sama(jual(k, 'tomat', 5), null);
  sama(k.koin, 20 + 5 * TANAMAN.tomat.hargaJual);
  benar(jual(k, 'rumput', 1), 'rumput tidak dijual');
  k.koin = 1000;
  while (k.petak.length < PETAK_MAKS) sama(beli(k, 'petak'), null);
  benar(beli(k, 'petak'), 'lahan maksimal');
  for (let i = 0; i < HEWAN.sapi.maks; i++) beli(k, 'hewan', 'sapi');
  benar(beli(k, 'hewan', 'sapi'), 'kandang penuh');
  k.koin = 0;
  benar(beli(k, 'benih', 'cabai'), 'koin kurang');
  benar(hargaPetak(kebunBaru()) > 0, 'harga petak');
});

uji('Soal siklus hidup dan jenis makanan hewan bernilai benar', () => {
  for (const id of Object.keys(TANAMAN)) {
    const s = soalSiklus(id, 4);
    benar(periksaJawaban(s, TANAMAN[id].tahap), `${id}: urutan tahap`);
  }
  for (const id of Object.keys(HEWAN)) {
    const s = soalJenisMakan(id, 5);
    benar(s.pilihan.includes(s.jawaban), id);
  }
  sama(soalJenisMakan('ayam', 4).jawaban, 'Omnivora');
  sama(soalJenisMakan('sapi', 4).jawaban, 'Herbivora');
});

uji('Soal membagi panen: jawabannya bilangan bulat yang benar', () => {
  for (const kelas of [4, 5, 6]) {
    for (let n = 4; n <= 30; n++) {
      for (let i = 0; i < 10; i++) {
        const s = soalBagi('tomat', n, kelas);
        if (!s) continue;
        benar(Number.isInteger(s.jawaban) && s.jawaban > 0 && s.jawaban <= n, `${s.pertanyaan} -> ${s.jawaban}`);
        const p = s.pertanyaan;
        let harap;
        if (/membagikan 1\/(\d)/.test(p)) harap = n / Number(p.match(/1\/(\d)/)[1]);
        else if (/(\d)\/(\d) dijual/.test(p)) { const [, a, b] = p.match(/(\d)\/(\d) dijual/); harap = n - (n / b) * a; }
        else if (/(\d+)%/.test(p)) harap = (n * Number(p.match(/(\d+)%/)[1])) / 100;
        else { const [, a, b] = p.match(/(\d) : (\d)/); harap = (n / (Number(a) + Number(b))) * Number(b); }
        sama(s.jawaban, harap, p);
      }
    }
  }
  sama(soalBagi('tomat', 7, 4), null, 'tidak ada pecahan yang pas untuk 7:');
});

uji('Berbagi mengurangi gudang dan menambah kebaikan', () => {
  const k = kebunBaru();
  k.gudang.tomat = 8;
  sama(bagikan(k, 'tomat', 2), 2);
  sama(jumlah(k, 'tomat'), 6);
  sama(k.kebaikan, 1);
});

uji('Data simpanan lama atau rusak dirapikan', () => {
  sama(rapikan(null).petak.length, 6);
  const k = rapikan({ hari: 5, petak: new Array(20).fill(null), hewan: [{ id: 'naga' }, { id: 'ayam', makan: false, produk: 0 }] });
  sama(k.hari, 5);
  sama(k.petak.length, PETAK_MAKS);
  sama(k.hewan.length, 1, 'hewan tidak dikenal dibuang:');
});

uji('Gambar hewan 12 x 12', () => {
  for (const [id, [grid]] of Object.entries(GAMBAR_HEWAN)) {
    sama(grid.length, 12, id);
    grid.forEach((b, i) => sama(b.length, 12, `${id} baris ${i}:`));
  }
});
