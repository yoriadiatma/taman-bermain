// uji.js — uji pembuat kartu Pasangan Kilat. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { TEMA, UKURAN_KELAS, buatKartu, buatPasangan, hitungBintang } from './kartu.js';

const uji = (nama, fn) => ujiDasar('Pasangan Kilat', nama, fn);

uji('Setiap tema dan ukuran menghasilkan jumlah kartu yang tepat, tanpa kartu kembar', () => {
  for (const tema of Object.keys(TEMA)) {
    for (const kelas of [4, 5, 6]) {
      for (const n of UKURAN_KELAS[kelas]) {
        for (let ulang = 0; ulang < 20; ulang++) {
          const { kartu, pasangan } = buatKartu(tema, kelas, n);
          sama(kartu.length, n, `${tema} kelas ${kelas} ${n} kartu:`);
          sama(pasangan.length, n / 2);
          const label = kartu.map(k => k.sisi.label);
          benar(new Set(label).size === label.length, `${tema} kelas ${kelas}: ada kartu kembar ${label.join(', ')}`);
          for (const p of pasangan) sama(kartu.filter(k => k.pasangan === p.id).length, 2, 'setiap pasangan punya 2 kartu:');
        }
      }
    }
  }
});

uji('Jumlah kartu per kelas antara 8 dan 24', () => {
  for (const daftar of Object.values(UKURAN_KELAS)) for (const n of daftar) benar(n >= 8 && n <= 24 && n % 2 === 0, `ukuran ${n}`);
});

uji('Hitung Cepat: jawaban benar secara matematika', () => {
  for (const kelas of [4, 5, 6]) {
    for (let ulang = 0; ulang < 30; ulang++) {
      for (const p of buatPasangan('hitung', kelas, 24)) {
        const soal = p.a.isi;
        const jawab = Number(p.b.isi);
        let hasil;
        if (soal.includes('×')) { const [a, b] = soal.split(' × ').map(Number); hasil = a * b; }
        else if (soal.includes(':')) { const [a, b] = soal.split(' : ').map(Number); hasil = a / b; }
        else if (soal.endsWith('²')) hasil = Number(soal.slice(0, -1)) ** 2;
        else if (soal.endsWith('³')) hasil = Number(soal.slice(0, -1)) ** 3;
        else if (soal.startsWith('√')) hasil = Math.sqrt(Number(soal.slice(1)));
        sama(jawab, hasil, soal);
      }
    }
  }
});

uji('Pecahan: kedua kartu bernilai sama', () => {
  const nilai = s => {
    if (s.jenis === 'pecahan' || s.jenis === 'gambarPecahan') return s.isi[0] / s.isi[1];
    const t = s.isi.replace(',', '.');
    return t.endsWith('%') ? Number(t.slice(0, -1)) / 100 : Number(t);
  };
  for (const kelas of [4, 5, 6]) {
    for (let ulang = 0; ulang < 30; ulang++) {
      for (const p of buatPasangan('pecahan', kelas, 24)) {
        benar(Math.abs(nilai(p.a) - nilai(p.b)) < 1e-9, `${p.a.label} ≠ ${p.b.label}`);
      }
    }
  }
});

uji('Bintang: sedikit percobaan = 3 bintang', () => {
  sama(hitungBintang(8, 8), 3);
  sama(hitungBintang(17, 8), 2);
  sama(hitungBintang(30, 8), 1);
});
