// ai.js — lawan komputer: minimax (negamax) dengan alpha-beta pruning.
// Evaluasi = nilai materi + tabel posisi bidak (piece-square table).
// Berjalan di Web Worker (ai-worker.js) agar tampilan tidak membeku.

import { Catur, tipe, lawan } from './mesin.js';

export const TINGKAT = {
  // Mudah: hanya melihat 1 langkah ke depan dan sering melangkah acak, agar bisa dikalahkan anak.
  mudah: { kedalaman: 1, acak: 0.4, quiescence: false, waktu: 400, derau: 0 },
  sedang: { kedalaman: 2, acak: 0.08, quiescence: true, waktu: 1000, derau: 30 },
  sulit: { kedalaman: 5, acak: 0, quiescence: true, waktu: 1800, derau: 8 },
  // Dipakai tombol "Petunjuk" untuk menyarankan langkah bagi pemain.
  petunjuk: { kedalaman: 3, acak: 0, quiescence: true, waktu: 1200, derau: 0 },
};

const NILAI = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const SKAKMAT = 100000;

// Tabel posisi dari sudut pandang putih, indeks 0 = a8. Untuk hitam, baris dibalik (sq ^ 56).
const PST = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],
  // Raja di akhir permainan sebaiknya maju ke tengah.
  kAkhir: [
    -50, -40, -30, -20, -20, -30, -40, -50,
    -30, -20, -10, 0, 0, -10, -20, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -30, 0, 0, 0, 0, -30, -30,
    -50, -30, -30, -30, -30, -30, -30, -50,
  ],
};

/** Nilai posisi dari sudut pandang pemain yang sedang giliran (positif = menguntungkan). */
export function evaluasi(g) {
  const p = g.papan;
  let materiBerat = 0;
  for (let i = 0; i < 64; i++) {
    const b = p[i];
    if (b && 'nbrqNBRQ'.includes(b)) materiBerat += NILAI[tipe(b)];
  }
  const akhir = materiBerat <= 1300;
  let skor = 0;
  for (let i = 0; i < 64; i++) {
    const b = p[i];
    if (!b) continue;
    const t = tipe(b);
    const putih = b !== t;
    const tabel = t === 'k' && akhir ? PST.kAkhir : PST[t];
    const nilai = NILAI[t] + tabel[putih ? i : i ^ 56];
    skor += putih ? nilai : -nilai;
  }
  return g.giliran === 'w' ? skor : -skor;
}

// Urutkan: promosi dan makan bidak mahal dengan bidak murah lebih dulu (MVV-LVA).
function nilaiUrut(m) {
  let n = 0;
  if (m.makan) n += 10 * NILAI[tipe(m.makan)] - NILAI[tipe(m.bidak)] + 10000;
  if (m.promosi) n += NILAI[m.promosi] + 9000;
  return n;
}

class Habis extends Error {}

class Pencari {
  constructor(g, opsi) {
    this.g = g;
    this.opsi = opsi;
    this.simpul = 0;
    this.batasWaktu = Date.now() + opsi.waktu;
  }

  cekWaktu() {
    if ((++this.simpul & 1023) === 0 && Date.now() > this.batasWaktu) throw new Habis();
  }

  quiescence(alpha, beta, ply, sisa) {
    this.cekWaktu();
    const g = this.g;
    const diam = evaluasi(g);
    if (diam >= beta) return beta;
    if (diam > alpha) alpha = diam;
    if (sisa <= 0) return alpha;
    const w = g.giliran;
    const tangkap = g._semu().filter(m => m.makan || m.promosi).sort((a, b) => nilaiUrut(b) - nilaiUrut(a));
    for (const m of tangkap) {
      g._buat(m);
      if (g.diserang(g.raja[w], lawan(w))) { g._batal(); continue; }
      const s = -this.quiescence(-beta, -alpha, ply + 1, sisa - 1);
      g._batal();
      if (s >= beta) return beta;
      if (s > alpha) alpha = s;
    }
    return alpha;
  }

  negamax(kedalaman, alpha, beta, ply) {
    this.cekWaktu();
    const g = this.g;
    const legal = g._legal();
    if (!legal.length) return g.skak() ? -SKAKMAT + ply : 0;
    if (g.setengah >= 100 || g.materiKurang()) return 0;
    if (kedalaman === 0) return this.opsi.quiescence ? this.quiescence(alpha, beta, ply, 6) : evaluasi(g);
    legal.sort((a, b) => nilaiUrut(b) - nilaiUrut(a));
    for (const m of legal) {
      g._buat(m);
      const s = -this.negamax(kedalaman - 1, -beta, -alpha, ply + 1);
      g._batal();
      if (s >= beta) return beta;
      if (s > alpha) alpha = s;
    }
    return alpha;
  }

  /**
   * Nilai setiap langkah di akar untuk satu kedalaman. Hanya langkah yang menaikkan
   * alpha yang nilainya pasti; langkah lain hanya diketahui "tidak lebih baik" (pasti: false).
   */
  akar(legal, kedalaman) {
    const g = this.g;
    const hasil = [];
    let alpha = -Infinity;
    for (const m of legal) {
      g._buat(m);
      const s = -this.negamax(kedalaman - 1, -Infinity, -alpha, 1);
      g._batal();
      const pasti = s > alpha;
      hasil.push({ m, s, pasti });
      if (pasti) alpha = s;
    }
    return hasil;
  }
}

/**
 * Cari langkah untuk posisi FEN. tingkat: 'mudah' | 'sedang' | 'sulit' | 'petunjuk'.
 * Mengembalikan { uci, skor, kedalaman, simpul } atau { uci: null } jika tidak ada langkah.
 */
export function cariLangkah(fen, tingkat = 'sedang', acak = Math.random) {
  const opsi = TINGKAT[tingkat] ?? TINGKAT.sedang;
  const g = new Catur(fen);
  let legal = g._legal();
  if (!legal.length) return { uci: null };
  if (legal.length === 1) return { uci: Catur.uci(legal[0]), skor: 0, kedalaman: 0, simpul: 0 };
  if (opsi.acak && acak() < opsi.acak) {
    return { uci: Catur.uci(legal[Math.floor(acak() * legal.length)]), skor: 0, kedalaman: 0, simpul: 0, acak: true };
  }

  const p = new Pencari(g, opsi);
  legal.sort((a, b) => nilaiUrut(b) - nilaiUrut(a));
  let terbaik = null;
  let kedalamanSelesai = 0;
  // Pendalaman bertahap: hasil kedalaman terakhir yang selesai dipakai jika waktu habis.
  for (let d = 1; d <= opsi.kedalaman; d++) {
    try {
      const hasil = p.akar(legal, d);
      // Derau kecil hanya untuk langkah yang nilainya pasti, agar permainan tidak selalu sama.
      const pasti = hasil.filter(x => x.pasti)
        .map(x => ({ ...x, acak: x.s + (opsi.derau && Math.abs(x.s) < SKAKMAT - 100 ? (acak() * 2 - 1) * opsi.derau : 0) }))
        .sort((a, b) => b.acak - a.acak);
      terbaik = pasti[0];
      kedalamanSelesai = d;
      // Langkah terbaik dicoba lebih dulu di putaran berikutnya.
      legal = [...pasti.map(x => x.m), ...hasil.filter(x => !x.pasti).map(x => x.m)];
      if (terbaik.s > SKAKMAT - 100) break; // sudah menemukan skakmat
    } catch (e) {
      if (e instanceof Habis) break;
      throw e;
    }
  }
  if (!terbaik) terbaik = { m: legal[0], s: 0 };
  return { uci: Catur.uci(terbaik.m), skor: Math.round(terbaik.s), kedalaman: kedalamanSelesai, simpul: p.simpul };
}

