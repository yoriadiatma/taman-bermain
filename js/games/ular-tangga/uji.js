// uji.js — uji aturan Ular Tangga Matematika. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { AKHIR, BONUS, TANGGA, ULAR, SOAL, lintasan, efekPetak, koordinat } from './aturan.js';

const uji = (nama, fn) => ujiDasar('Ular Tangga Matematika', nama, fn);

uji('Tangga naik, ular turun, semua di dalam papan', () => {
  for (const [a, b] of Object.entries(TANGGA)) benar(+a < b && +a >= 1 && b <= AKHIR, `tangga ${a}->${b}`);
  for (const [a, b] of Object.entries(ULAR)) benar(+a > b && b >= 1 && +a < AKHIR, `ular ${a}->${b}`);
});

uji('Petak soal, kaki tangga, dan kepala ular tidak bertumpuk', () => {
  const kaki = Object.keys(TANGGA).map(Number);
  const kepala = Object.keys(ULAR).map(Number);
  const semua = [...kaki, ...kepala, ...SOAL];
  sama(new Set(semua).size, semua.length);
  // Ujung tangga/ular juga bukan awal tangga/ular lain (tidak berantai).
  for (const ke of [...Object.values(TANGGA), ...Object.values(ULAR)]) benar(!kaki.includes(ke) && !kepala.includes(ke), `petak ${ke} berantai`);
});

uji('Bonus dari petak soal tidak pernah mendarat di kepala ular', () => {
  for (const n of SOAL) benar(!ULAR[Math.min(AKHIR, n + BONUS)], `petak ${n} + ${BONUS} = kepala ular`);
});

uji('Lintasan berhenti di petak 100', () => {
  sama(lintasan(0, 3), [1, 2, 3]);
  sama(lintasan(97, 6), [98, 99, 100]);
  sama(lintasan(100, 2), []);
});

uji('Efek petak', () => {
  sama(efekPetak(4), { jenis: 'tangga', ke: 14 });
  sama(efekPetak(17), { jenis: 'ular', ke: 7 });
  sama(efekPetak(3), { jenis: 'soal', ke: 3 });
  sama(efekPetak(2), { jenis: null, ke: 2 });
});

uji('Penomoran papan zig-zag', () => {
  sama(koordinat(1), { x: 5, y: 95, baris: 0, kolom: 0 });
  sama(koordinat(10), { x: 95, y: 95, baris: 0, kolom: 9 });
  sama(koordinat(11), { x: 95, y: 85, baris: 1, kolom: 9 });
  sama(koordinat(100), { x: 5, y: 5, baris: 9, kolom: 0 });
  const titik = new Set();
  for (let n = 1; n <= 100; n++) titik.add(`${koordinat(n).x},${koordinat(n).y}`);
  sama(titik.size, 100, 'setiap petak punya tempat sendiri:');
});
