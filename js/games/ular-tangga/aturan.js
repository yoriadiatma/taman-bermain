// aturan.js — papan dan aturan Ular Tangga Matematika (tanpa DOM, mudah diuji).
//
// Papan 1–100. Petak "?" memberi soal matematika sesuai kelas pemain:
// benar = maju bonus, salah = tetap di tempat (tidak mundur).
// Pemain menang begitu mencapai atau melewati petak 100.

export const AKHIR = 100;
export const BONUS = 3;

// tangga: bawah -> atas
export const TANGGA = { 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };
// ular: kepala -> ekor
export const ULAR = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 79 };
// petak soal "?" (bukan kaki tangga atau kepala ular)
export const SOAL = [3, 11, 16, 23, 30, 39, 45, 49, 56, 66, 69, 76, 82, 89, 94];

/** Daftar petak yang dilewati saat maju `n` langkah dari `pos` (berhenti di 100). */
export function lintasan(pos, n) {
  const hasil = [];
  for (let i = 1; i <= n && pos + i <= AKHIR; i++) hasil.push(pos + i);
  return hasil;
}

/** Efek petak setelah berhenti: { jenis: 'tangga' | 'ular' | 'soal' | null, ke } */
export function efekPetak(pos) {
  if (TANGGA[pos]) return { jenis: 'tangga', ke: TANGGA[pos] };
  if (ULAR[pos]) return { jenis: 'ular', ke: ULAR[pos] };
  if (SOAL.includes(pos)) return { jenis: 'soal', ke: pos };
  return { jenis: null, ke: pos };
}

/** Posisi petak di papan (persen, 0–100). Baris bawah 1–10 dari kiri, baris berikutnya dari kanan (zig-zag). */
export function koordinat(n) {
  const baris = Math.floor((n - 1) / 10);
  const k = (n - 1) % 10;
  const kolom = baris % 2 === 0 ? k : 9 - k;
  return { x: kolom * 10 + 5, y: (9 - baris) * 10 + 5, baris, kolom };
}

export const lemparDadu = (acak = Math.random) => 1 + Math.floor(acak() * 6);
