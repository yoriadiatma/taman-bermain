// kartu.js — membuat pasangan kartu untuk Pasangan Kilat (tanpa DOM, mudah diuji).
//
// Satu pasangan = { id, a: sisi, b: sisi, penjelasan }.
// Sisi = { jenis: 'teks' | 'emoji' | 'pecahan' | 'gambarPecahan', isi, label }
//   label: teks untuk pembaca layar dan untuk memastikan tidak ada dua kartu yang sama.

import { KATA_EMOJI, HEWAN_TUMBUHAN } from '../../../data/pasangan.js';

export const TEMA = {
  hitung: { nama: 'Hitung Cepat', ikon: '✖️', ket: 'Pasangkan soal hitungan dengan hasilnya.' },
  pecahan: { nama: 'Pecahan', ikon: '🍕', ket: 'Pasangkan pecahan dengan gambar atau nilai yang sama.' },
  kata: { nama: 'Kata & Emoji', ikon: '😊', ket: 'Pasangkan emoji dengan kata yang tepat.' },
  hayati: { nama: 'Hewan & Tumbuhan', ikon: '🐸', ket: 'Pasangkan makhluk hidup dengan cirinya.' },
};

// Jumlah kartu yang bisa dipilih per kelas (8–24 kartu).
export const UKURAN_KELAS = { 4: [8, 12, 16], 5: [12, 16, 20], 6: [16, 20, 24] };
export const ukuranBawaan = kelas => (UKURAN_KELAS[kelas] ?? UKURAN_KELAS[4])[1];

const angka = n => String(n).replace('.', ',');

function acakUrut(daftar, acak) {
  const a = [...daftar];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const teks = isi => ({ jenis: 'teks', isi, label: isi });
const pecahan = (p, q) => ({ jenis: 'pecahan', isi: [p, q], label: `${p}/${q}` });

// ---------- Hitung Cepat ----------

function soalHitung(kelas, acak) {
  const antara = (a, b) => a + Math.floor(acak() * (b - a + 1));
  if (kelas <= 4) {
    const a = antara(2, 9);
    const b = antara(2, 9);
    return [`${a} × ${b}`, a * b, `${a} × ${b} = ${a * b}`];
  }
  if (kelas === 5) {
    if (acak() < 0.5) {
      const a = antara(3, 12);
      const b = antara(3, 12);
      return [`${a} × ${b}`, a * b, `${a} × ${b} = ${a * b}`];
    }
    const b = antara(2, 12);
    const h = antara(2, 12);
    return [`${b * h} : ${b}`, h, `${b * h} : ${b} = ${h}, karena ${h} × ${b} = ${b * h}`];
  }
  const jenis = Math.floor(acak() * 4);
  if (jenis === 0) { const a = antara(4, 15); return [`${a}²`, a * a, `${a}² = ${a} × ${a} = ${a * a}`]; }
  if (jenis === 1) { const a = antara(4, 13); return [`√${a * a}`, a, `√${a * a} = ${a}, karena ${a} × ${a} = ${a * a}`]; }
  if (jenis === 2) { const a = antara(2, 6); return [`${a}³`, a ** 3, `${a}³ = ${a} × ${a} × ${a} = ${a ** 3}`]; }
  const a = antara(11, 25);
  const b = antara(3, 9);
  return [`${a} × ${b}`, a * b, `${a} × ${b} = ${a * b}`];
}

function pasanganHitung(kelas, n, acak) {
  const hasil = [];
  const dipakai = new Set();
  for (let coba = 0; hasil.length < n && coba < 2000; coba++) {
    const [soal, jawab, jelas] = soalHitung(kelas, acak);
    const j = String(jawab);
    if (dipakai.has(soal) || dipakai.has(j)) continue;
    dipakai.add(soal).add(j);
    hasil.push({ a: teks(soal), b: teks(j), penjelasan: jelas });
  }
  return hasil;
}

// ---------- Pecahan ----------

const GAMBAR_4 = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8]];
const SENILAI_5 = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [3, 8], [5, 8], [7, 8]];
const PERSEN_6 = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 8], [3, 8], [1, 20], [1, 25]];

function pasanganPecahan(kelas, n, acak) {
  if (kelas <= 4) {
    return acakUrut(GAMBAR_4, acak).slice(0, n).map(([p, q]) => ({
      a: pecahan(p, q),
      b: { jenis: 'gambarPecahan', isi: [p, q], label: `gambar ${p} dari ${q} bagian diarsir` },
      penjelasan: `${p}/${q}: lingkaran dibagi ${q} bagian sama besar, ${p} bagian diarsir.`,
    }));
  }
  if (kelas === 5) {
    return acakUrut(SENILAI_5, acak).slice(0, n).map(([p, q]) => {
      const k = 2 + Math.floor(acak() * 2); // dikali 2 atau 3
      return {
        a: pecahan(p * k, q * k),
        b: pecahan(p, q),
        penjelasan: `${p * k}/${q * k} = ${p}/${q} (pembilang dan penyebut sama-sama dibagi ${k}).`,
      };
    });
  }
  return acakUrut(PERSEN_6, acak).slice(0, n).map(([p, q], i) => {
    const nilai = p / q;
    const persen = i % 2 === 0;
    const isi = persen ? `${angka(+(nilai * 100).toFixed(3))}%` : angka(+nilai.toFixed(3));
    return {
      a: pecahan(p, q),
      b: teks(isi),
      penjelasan: persen
        ? `${p}/${q} = ${angka(+(nilai * 100).toFixed(3))}/100 = ${isi}`
        : `${p}/${q} = ${p} : ${q} = ${isi}`,
    };
  });
}

// ---------- Kata & Emoji, Hewan & Tumbuhan ----------

function pasanganKata(kelas, n, acak) {
  const daftar = KATA_EMOJI[kelas] ?? KATA_EMOJI[4];
  return acakUrut(daftar, acak).slice(0, n).map(([emoji, kata]) => ({
    a: { jenis: 'emoji', isi: emoji, label: emoji },
    b: teks(kata),
    penjelasan: `${emoji} = ${kata}`,
  }));
}

function pasanganHayati(kelas, n, acak) {
  return acakUrut(HEWAN_TUMBUHAN, acak).slice(0, n).map(([nama, ciri]) => ({
    a: teks(nama),
    b: teks(ciri),
    penjelasan: `${nama}: ${ciri.charAt(0).toLowerCase()}${ciri.slice(1)}.`,
  }));
}

const PEMBUAT = { hitung: pasanganHitung, pecahan: pasanganPecahan, kata: pasanganKata, hayati: pasanganHayati };

/** Buat `jumlahKartu / 2` pasangan untuk tema dan kelas. */
export function buatPasangan(tema, kelas, jumlahKartu, acak = Math.random) {
  const n = Math.floor(jumlahKartu / 2);
  return PEMBUAT[tema](kelas, n, acak).slice(0, n).map((p, i) => ({ id: i, ...p }));
}

/** Kartu siap main: setiap pasangan menjadi dua kartu, lalu diacak. */
export function buatKartu(tema, kelas, jumlahKartu, acak = Math.random) {
  const pasangan = buatPasangan(tema, kelas, jumlahKartu, acak);
  const kartu = pasangan.flatMap(p => [{ pasangan: p.id, sisi: p.a }, { pasangan: p.id, sisi: p.b }]);
  return { pasangan, kartu: acakUrut(kartu, acak) };
}

/** Bintang: 3 jika percobaan sedikit (hampir tanpa salah), 1 jika banyak. */
export function hitungBintang(percobaan, jumlahPasangan) {
  if (percobaan <= Math.ceil(jumlahPasangan * 1.5)) return 3;
  if (percobaan <= Math.ceil(jumlahPasangan * 2.2)) return 2;
  return 1;
}

