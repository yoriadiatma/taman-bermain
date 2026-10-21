// uji.js — uji data kata dan labirin Petualangan Kata. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { KATA } from '../../../data/kata.js';
import { buatLevel, buatPeta, cariJalan, terjangkau, rng, hitungBintang, PENGECOH } from './labirin.js';

const uji = (nama, fn) => ujiDasar('Petualangan Kata', nama, fn);

uji('Data kata: huruf kapital, unik, minimal 12 kata per kelas, ada petunjuk dan penjelasan', () => {
  for (const kelas of [4, 5, 6]) {
    const daftar = KATA[kelas];
    benar(daftar.length >= 12, `kelas ${kelas}: hanya ${daftar.length} kata`);
    sama(new Set(daftar.map(k => k.kata)).size, daftar.length, `kelas ${kelas}: kata ganda`);
    for (const k of daftar) {
      benar(/^[A-Z]+(-[A-Z]+)*$/.test(k.kata), `"${k.kata}" harus huruf kapital (boleh tanda hubung)`);
      benar(k.petunjuk && k.penjelasan, `${k.kata}: petunjuk/penjelasan kosong`);
      if (k.keliru) benar(k.keliru !== k.kata, `${k.kata}: ejaan keliru sama dengan kata`);
    }
  }
});

uji('Labirin selalu tersambung (semua sel bisa dicapai jika tanpa gerbang)', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const peta = buatPeta(9, 6, rng(seed));
    const bisa = terjangkau(peta, { x: 1, y: 1 });
    for (let y = 1; y < peta.length; y += 2) for (let x = 1; x < peta[0].length; x += 2) benar(bisa.has(`${x},${y}`), `seed ${seed}: sel ${x},${y} terputus`);
  }
});

uji('Setiap level: huruf kata lengkap, bisa dicapai tanpa melewati gerbang, dan pengecoh bukan huruf kata', () => {
  for (const kelas of [4, 5, 6]) {
    KATA[kelas].forEach((entri, i) => {
      const lv = buatLevel(entri, kelas, 1000 + i * 31 + kelas);
      const kata = [...entri.kata];
      const huruf = lv.huruf.map(h => h.h);
      for (const h of new Set(kata)) {
        benar(huruf.filter(x => x === h).length >= kata.filter(x => x === h).length, `${entri.kata}: huruf ${h} kurang`);
      }
      const pengecoh = lv.huruf.filter(h => h.perlu === null);
      sama(pengecoh.length, PENGECOH[kelas], `${entri.kata}: jumlah pengecoh`);
      for (const p of pengecoh) benar(!kata.includes(p.h), `${entri.kata}: pengecoh ${p.h} ada di kata`);
      const bisa = terjangkau(lv.peta, lv.awal);
      for (const h of lv.huruf) benar(bisa.has(`${h.x},${h.y}`), `${entri.kata}: huruf ${h.h} tertutup gerbang`);
      const posisi = new Set(lv.huruf.map(h => `${h.x},${h.y}`));
      sama(posisi.size, lv.huruf.length, `${entri.kata}: dua huruf di satu kotak`);
      benar(!posisi.has(`${lv.awal.x},${lv.awal.y}`), `${entri.kata}: huruf di titik awal`);
    });
  }
});

uji('Level yang sama selalu menghasilkan labirin yang sama', () => {
  const a = buatLevel(KATA[4][0], 4, 77);
  const b = buatLevel(KATA[4][0], 4, 77);
  sama(a.peta, b.peta);
  sama(a.huruf, b.huruf);
});

uji('Ejaan keliru dipakai sebagai pengecoh', () => {
  const apotek = KATA[4].find(k => k.kata === 'APOTEK');
  const lv = buatLevel(apotek, 4, 5);
  benar(lv.huruf.some(h => h.perlu === null && h.h === 'I'), 'huruf I dari "apotik" seharusnya menjadi pengecoh');
});

uji('Jalan terpendek tidak menembus dinding atau gerbang', () => {
  const peta = ['#####', '#...#', '#P#.#', '#...#', '#####'].map(b => [...b]);
  const jalan = cariJalan(peta, { x: 1, y: 1 }, { x: 1, y: 3 });
  sama(jalan, [[2, 1], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3]], 'memutar menghindari gerbang:');
  sama(cariJalan(peta, { x: 1, y: 1 }, { x: 1, y: 2 }), [[1, 2]], 'gerbang boleh menjadi tujuan:');
});

uji('Bintang', () => {
  sama([0, 1, 2, 4, 5, 9].map(hitungBintang), [3, 3, 2, 2, 1, 1]);
});
