// mesin.js — aturan catur lengkap tanpa DOM (bisa dipakai di Web Worker).
//
// Papan: array 64 kotak, indeks 0 = a8 (kiri atas), 63 = h1 (kanan bawah).
// Bidak: huruf FEN, huruf besar = putih (P N B R Q K), huruf kecil = hitam.
// Mencakup: semua gerak bidak, rokade, en passant, promosi, skak, skakmat,
// remis (pat, tiga kali posisi berulang, aturan 50 langkah, materi tidak cukup).
// Langkah yang membuat raja sendiri terancam tidak pernah dianggap legal.

export const AWAL = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const NAMA_BIDAK = { p: 'Pion', n: 'Kuda', b: 'Gajah', r: 'Benteng', q: 'Menteri', k: 'Raja' };
export const NAMA_WARNA = { w: 'Putih', b: 'Hitam' };

const FILE = 'abcdefgh';
const baris = i => i >> 3;
const kolom = i => i & 7;
export const tipe = p => p.toLowerCase();
export const warnaBidak = p => (p === p.toUpperCase() ? 'w' : 'b');
export const lawan = w => (w === 'w' ? 'b' : 'w');
export const namaKotak = i => FILE[kolom(i)] + (8 - baris(i));
export function indeksKotak(nama) {
  const c = FILE.indexOf(nama[0]);
  const r = Number(nama[1]);
  if (c < 0 || !(r >= 1 && r <= 8) || nama.length !== 2) return -1;
  return (8 - r) * 8 + c;
}

// ---------- Tabel gerak yang dihitung sekali ----------

function tetangga(arah) {
  return Array.from({ length: 64 }, (_, i) => arah
    .map(([dr, dc]) => [baris(i) + dr, kolom(i) + dc])
    .filter(([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8)
    .map(([r, c]) => r * 8 + c));
}

function sinar(arah) {
  return Array.from({ length: 64 }, (_, i) => arah.map(([dr, dc]) => {
    const s = [];
    for (let r = baris(i) + dr, c = kolom(i) + dc; r >= 0 && r < 8 && c >= 0 && c < 8; r += dr, c += dc) s.push(r * 8 + c);
    return s;
  }));
}

const LANGKAH_KUDA = tetangga([[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]);
const LANGKAH_RAJA = tetangga([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]);
const SINAR_DIAGONAL = sinar([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
const SINAR_LURUS = sinar([[-1, 0], [1, 0], [0, -1], [0, 1]]);

// Hak rokade yang hilang jika bidak bergerak dari/ke kotak ini.
const HAPUS_HAK = { 60: 'KQ', 63: 'K', 56: 'Q', 4: 'kq', 7: 'k', 0: 'q' };
const E1 = 60;
const E8 = 4;

function buangHak(hak, kotak) {
  const h = HAPUS_HAK[kotak];
  return h ? [...hak].filter(c => !h.includes(c)).join('') : hak;
}

// ---------- Kelas utama ----------

export class Catur {
  constructor(fen = AWAL) {
    this.muatFen(fen);
  }

  muatFen(fen) {
    const bagian = String(fen).trim().split(/\s+/);
    if (bagian.length < 4) throw new Error('FEN tidak valid: bagiannya kurang.');
    const [pos, giliran, rokade, ep, setengah = '0', nomor = '1'] = bagian;
    const barisFen = pos.split('/');
    if (barisFen.length !== 8) throw new Error('FEN tidak valid: harus 8 baris.');
    const papan = [];
    for (const b of barisFen) {
      let n = 0;
      for (const ch of b) {
        if (/[1-8]/.test(ch)) { for (let k = 0; k < Number(ch); k++) papan.push(null); n += Number(ch); }
        else if (/[pnbrqkPNBRQK]/.test(ch)) { papan.push(ch); n++; }
        else throw new Error(`FEN tidak valid: karakter "${ch}".`);
      }
      if (n !== 8) throw new Error('FEN tidak valid: setiap baris harus 8 kotak.');
    }
    if (!['w', 'b'].includes(giliran)) throw new Error('FEN tidak valid: giliran harus w atau b.');
    if (papan.filter(p => p === 'K').length !== 1 || papan.filter(p => p === 'k').length !== 1) {
      throw new Error('FEN tidak valid: harus ada tepat satu raja putih dan satu raja hitam.');
    }
    this.papan = papan;
    this.giliran = giliran;
    this.rokade = rokade === '-' ? '' : rokade.replace(/[^KQkq]/g, '');
    this.ep = ep === '-' ? -1 : indeksKotak(ep);
    this.setengah = Number(setengah) || 0;
    this.nomor = Number(nomor) || 1;
    this.raja = { w: papan.indexOf('K'), b: papan.indexOf('k') };
    this.tumpukan = [];
    this.riwayat = [];
    this.hitungPosisi = new Map();
    this.fenAwal = this.fen();
    this._catatPosisi(1);
  }

  fen() {
    let s = '';
    for (let r = 0; r < 8; r++) {
      let kosong = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.papan[r * 8 + c];
        if (!p) { kosong++; continue; }
        if (kosong) { s += kosong; kosong = 0; }
        s += p;
      }
      if (kosong) s += kosong;
      if (r < 7) s += '/';
    }
    return `${s} ${this.giliran} ${this.rokade || '-'} ${this.ep >= 0 ? namaKotak(this.ep) : '-'} ${this.setengah} ${this.nomor}`;
  }

  bidakDi(kotak) {
    const i = typeof kotak === 'string' ? indeksKotak(kotak) : kotak;
    return this.papan[i] ?? null;
  }

  // ---------- Serangan ----------

  /** Apakah kotak `sq` diserang oleh bidak berwarna `oleh`? */
  diserang(sq, oleh) {
    const p = this.papan;
    const r = baris(sq);
    const c = kolom(sq);
    // Pion putih menyerang ke atas (indeks berkurang), jadi penyerangnya ada di bawah kotak.
    if (oleh === 'w') {
      if (r < 7 && c > 0 && p[sq + 7] === 'P') return true;
      if (r < 7 && c < 7 && p[sq + 9] === 'P') return true;
    } else {
      if (r > 0 && c > 0 && p[sq - 9] === 'p') return true;
      if (r > 0 && c < 7 && p[sq - 7] === 'p') return true;
    }
    const [N, B, R, Q, K] = oleh === 'w' ? ['N', 'B', 'R', 'Q', 'K'] : ['n', 'b', 'r', 'q', 'k'];
    for (const t of LANGKAH_KUDA[sq]) if (p[t] === N) return true;
    for (const t of LANGKAH_RAJA[sq]) if (p[t] === K) return true;
    for (const s of SINAR_DIAGONAL[sq]) {
      for (const t of s) {
        if (!p[t]) continue;
        if (p[t] === B || p[t] === Q) return true;
        break;
      }
    }
    for (const s of SINAR_LURUS[sq]) {
      for (const t of s) {
        if (!p[t]) continue;
        if (p[t] === R || p[t] === Q) return true;
        break;
      }
    }
    return false;
  }

  /** Apakah pemain yang sedang giliran sedang diskak? */
  skak() {
    return this.diserang(this.raja[this.giliran], lawan(this.giliran));
  }

  // ---------- Pembangkit langkah ----------

  _semu() {
    const p = this.papan;
    const w = this.giliran;
    const hasil = [];
    const milikLawan = t => p[t] && warnaBidak(p[t]) !== w;
    const tambah = (dari, ke, jenis = 'biasa', makan = p[ke]) => hasil.push({ dari, ke, bidak: p[dari], makan: makan ?? null, promosi: null, jenis });
    const tambahPion = (dari, ke, jenis, makan) => {
      if (baris(ke) === 0 || baris(ke) === 7) {
        for (const pr of ['q', 'r', 'b', 'n']) hasil.push({ dari, ke, bidak: p[dari], makan: makan ?? null, promosi: pr, jenis });
      } else {
        tambah(dari, ke, jenis, makan);
      }
    };

    for (let sq = 0; sq < 64; sq++) {
      const b = p[sq];
      if (!b || warnaBidak(b) !== w) continue;
      const t = tipe(b);
      if (t === 'p') {
        const arah = w === 'w' ? -8 : 8;
        const satu = sq + arah;
        if (!p[satu]) {
          tambahPion(sq, satu, 'biasa', null);
          const awal = w === 'w' ? 6 : 1;
          if (baris(sq) === awal && !p[satu + arah]) tambah(sq, satu + arah, 'dua', null);
        }
        for (const dc of [-1, 1]) {
          const c = kolom(sq) + dc;
          if (c < 0 || c > 7) continue;
          const ke = satu + dc;
          if (milikLawan(ke)) tambahPion(sq, ke, 'biasa', p[ke]);
          else if (ke === this.ep) tambah(sq, ke, 'ep', w === 'w' ? 'p' : 'P');
        }
      } else if (t === 'n' || t === 'k') {
        for (const ke of (t === 'n' ? LANGKAH_KUDA : LANGKAH_RAJA)[sq]) {
          if (!p[ke] || milikLawan(ke)) tambah(sq, ke);
        }
        if (t === 'k') this._rokade(sq, tambah);
      } else {
        const daftarSinar = t === 'b' ? SINAR_DIAGONAL[sq] : t === 'r' ? SINAR_LURUS[sq] : [...SINAR_DIAGONAL[sq], ...SINAR_LURUS[sq]];
        for (const s of daftarSinar) {
          for (const ke of s) {
            if (!p[ke]) { tambah(sq, ke); continue; }
            if (milikLawan(ke)) tambah(sq, ke);
            break;
          }
        }
      }
    }
    return hasil;
  }

  _rokade(sq, tambah) {
    const w = this.giliran;
    const p = this.papan;
    const asal = w === 'w' ? E1 : E8;
    if (sq !== asal) return;
    const [hakPendek, hakPanjang, benteng] = w === 'w' ? ['K', 'Q', 'R'] : ['k', 'q', 'r'];
    const musuh = lawan(w);
    if (!this.rokade.includes(hakPendek) && !this.rokade.includes(hakPanjang)) return;
    if (this.diserang(sq, musuh)) return; // tidak boleh rokade saat diskak
    if (this.rokade.includes(hakPendek) && p[sq + 3] === benteng && !p[sq + 1] && !p[sq + 2] &&
      !this.diserang(sq + 1, musuh) && !this.diserang(sq + 2, musuh)) {
      tambah(sq, sq + 2, 'rokade', null);
    }
    if (this.rokade.includes(hakPanjang) && p[sq - 4] === benteng && !p[sq - 1] && !p[sq - 2] && !p[sq - 3] &&
      !this.diserang(sq - 1, musuh) && !this.diserang(sq - 2, musuh)) {
      tambah(sq, sq - 2, 'rokade', null);
    }
  }

  _buat(m) {
    const p = this.papan;
    const w = this.giliran;
    this.tumpukan.push({ m, rokade: this.rokade, ep: this.ep, setengah: this.setengah, nomor: this.nomor });
    p[m.ke] = m.promosi ? (w === 'w' ? m.promosi.toUpperCase() : m.promosi) : m.bidak;
    p[m.dari] = null;
    if (m.jenis === 'ep') p[m.ke + (w === 'w' ? 8 : -8)] = null;
    if (m.jenis === 'rokade') {
      if (m.ke > m.dari) { p[m.dari + 1] = p[m.dari + 3]; p[m.dari + 3] = null; }
      else { p[m.dari - 1] = p[m.dari - 4]; p[m.dari - 4] = null; }
    }
    if (tipe(m.bidak) === 'k') this.raja[w] = m.ke;
    if (this.rokade) this.rokade = buangHak(buangHak(this.rokade, m.dari), m.ke);
    this.ep = m.jenis === 'dua' ? (m.dari + m.ke) / 2 : -1;
    this.setengah = tipe(m.bidak) === 'p' || m.makan ? 0 : this.setengah + 1;
    if (w === 'b') this.nomor++;
    this.giliran = lawan(w);
  }

  _batal() {
    const t = this.tumpukan.pop();
    const m = t.m;
    const p = this.papan;
    const w = lawan(this.giliran);
    this.giliran = w;
    p[m.dari] = m.bidak;
    if (m.jenis === 'ep') {
      p[m.ke] = null;
      p[m.ke + (w === 'w' ? 8 : -8)] = m.makan;
    } else {
      p[m.ke] = m.makan;
    }
    if (m.jenis === 'rokade') {
      if (m.ke > m.dari) { p[m.dari + 3] = p[m.dari + 1]; p[m.dari + 1] = null; }
      else { p[m.dari - 4] = p[m.dari - 1]; p[m.dari - 1] = null; }
    }
    if (tipe(m.bidak) === 'k') this.raja[w] = m.dari;
    this.rokade = t.rokade;
    this.ep = t.ep;
    this.setengah = t.setengah;
    this.nomor = t.nomor;
  }

  /** Semua langkah legal untuk pemain yang sedang giliran. */
  _legal() {
    const w = this.giliran;
    const hasil = [];
    for (const m of this._semu()) {
      this._buat(m);
      if (!this.diserang(this.raja[w], lawan(w))) hasil.push(m);
      this._batal();
    }
    return hasil;
  }

  /** Langkah legal, boleh disaring dari satu kotak ('e2' atau indeks). */
  langkahLegal(dari = null) {
    const semua = this._legal();
    if (dari === null) return semua;
    const i = typeof dari === 'string' ? indeksKotak(dari) : dari;
    return semua.filter(m => m.dari === i);
  }

  /** Apakah bidak di kotak ini punya langkah semu tetapi semuanya membuat raja terancam? */
  terkunci(dari) {
    const i = typeof dari === 'string' ? indeksKotak(dari) : dari;
    return this._semu().some(m => m.dari === i) && this.langkahLegal(i).length === 0;
  }

  // ---------- Notasi ----------

  _san(m, legal) {
    let s;
    if (m.jenis === 'rokade') {
      s = m.ke > m.dari ? 'O-O' : 'O-O-O';
    } else if (tipe(m.bidak) === 'p') {
      s = (m.makan ? FILE[kolom(m.dari)] + 'x' : '') + namaKotak(m.ke) + (m.promosi ? '=' + m.promosi.toUpperCase() : '');
    } else {
      const lain = legal.filter(x => x.ke === m.ke && x.bidak === m.bidak && x.dari !== m.dari);
      let beda = '';
      if (lain.length) {
        if (!lain.some(x => kolom(x.dari) === kolom(m.dari))) beda = FILE[kolom(m.dari)];
        else if (!lain.some(x => baris(x.dari) === baris(m.dari))) beda = String(8 - baris(m.dari));
        else beda = namaKotak(m.dari);
      }
      s = tipe(m.bidak).toUpperCase() + beda + (m.makan ? 'x' : '') + namaKotak(m.ke);
    }
    this._buat(m);
    const skak = this.skak();
    const mat = skak && this._legal().length === 0;
    this._batal();
    return s + (mat ? '#' : skak ? '+' : '');
  }

  static uci(m) {
    return namaKotak(m.dari) + namaKotak(m.ke) + (m.promosi ?? '');
  }

  // ---------- Menjalankan & membatalkan langkah ----------

  /**
   * Jalankan langkah. Menerima: objek dari langkahLegal(), { dari: 'e2', ke: 'e4', promosi: 'q' },
   * string UCI ('e2e4', 'e7e8q'), atau SAN ('Nf3', 'O-O', 'exd5').
   * Mengembalikan catatan langkah (dengan san dan uci), atau null jika tidak legal.
   */
  jalan(x) {
    const legal = this._legal();
    let m = null;
    if (typeof x === 'string') {
      const uci = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(x);
      if (uci) {
        const [, d, k, pr] = uci;
        m = legal.find(l => l.dari === indeksKotak(d) && l.ke === indeksKotak(k) && (l.promosi ?? undefined) === pr);
      } else {
        const bersih = s => s.replace(/[+#!?]/g, '').replace(/0/g, 'O');
        m = legal.find(l => bersih(this._san(l, legal)) === bersih(x));
      }
    } else if (x) {
      const dari = typeof x.dari === 'string' ? indeksKotak(x.dari) : x.dari;
      const ke = typeof x.ke === 'string' ? indeksKotak(x.ke) : x.ke;
      m = legal.find(l => l.dari === dari && l.ke === ke && (l.promosi ?? null) === (x.promosi ?? null));
    }
    if (!m) return null;
    const san = this._san(m, legal);
    this._buat(m);
    const catatan = { ...m, san, uci: Catur.uci(m), warna: lawan(this.giliran) };
    this.riwayat.push(catatan);
    this._catatPosisi(1);
    return catatan;
  }

  /** Batalkan langkah terakhir. Mengembalikan catatan langkah yang dibatalkan, atau null. */
  batal() {
    if (!this.riwayat.length) return null;
    this._catatPosisi(-1);
    const m = this.riwayat.pop();
    this._batal();
    return m;
  }

  // ---------- Akhir permainan ----------

  /** Kunci posisi untuk aturan tiga kali berulang. */
  kunciPosisi() {
    // En passant hanya dihitung jika benar-benar bisa dilakukan.
    const ep = this.ep >= 0 && this._legal().some(m => m.jenis === 'ep') ? namaKotak(this.ep) : '-';
    return this.fen().split(' ').slice(0, 3).join(' ') + ' ' + ep;
  }

  _catatPosisi(d) {
    const k = this.kunciPosisi();
    const n = (this.hitungPosisi.get(k) || 0) + d;
    if (n > 0) this.hitungPosisi.set(k, n);
    else this.hitungPosisi.delete(k);
  }

  /** Materi tidak cukup untuk skakmat: R vs R, R+G vs R, R+K vs R, atau semua gajah di warna kotak yang sama. */
  materiKurang() {
    const bidak = [];
    this.papan.forEach((p, i) => { if (p && tipe(p) !== 'k') bidak.push({ t: tipe(p), i }); });
    if (bidak.length === 0) return true;
    if (bidak.length === 1 && (bidak[0].t === 'b' || bidak[0].t === 'n')) return true;
    if (bidak.every(b => b.t === 'b')) {
      const warnaKotak = new Set(bidak.map(b => (baris(b.i) + kolom(b.i)) % 2));
      return warnaKotak.size === 1;
    }
    return false;
  }

  /**
   * Status permainan:
   * { selesai: false, skak } atau
   * { selesai: true, alasan: 'skakmat' | 'pat' | 'tiga-kali' | '50-langkah' | 'materi', pemenang: 'w' | 'b' | null }
   */
  status() {
    const legal = this._legal();
    const skak = this.skak();
    if (!legal.length) {
      return skak
        ? { selesai: true, alasan: 'skakmat', pemenang: lawan(this.giliran), skak }
        : { selesai: true, alasan: 'pat', pemenang: null, skak };
    }
    if (this.materiKurang()) return { selesai: true, alasan: 'materi', pemenang: null, skak };
    if (this.setengah >= 100) return { selesai: true, alasan: '50-langkah', pemenang: null, skak };
    if ((this.hitungPosisi.get(this.kunciPosisi()) || 0) >= 3) return { selesai: true, alasan: 'tiga-kali', pemenang: null, skak };
    return { selesai: false, skak };
  }

  /** Hitung jumlah posisi sampai kedalaman tertentu (untuk menguji pembangkit langkah). */
  perft(kedalaman) {
    if (kedalaman === 0) return 1;
    const legal = this._legal();
    if (kedalaman === 1) return legal.length;
    let n = 0;
    for (const m of legal) {
      this._buat(m);
      n += this.perft(kedalaman - 1);
      this._batal();
    }
    return n;
  }
}

// Notasi catur Indonesia: R = Raja, M = Menteri, B = Benteng, G = Gajah, K = Kuda.
// TODO verifikasi: singkatan ini mengikuti kebiasaan notasi catur berbahasa Indonesia.
const HURUF_INDONESIA = { K: 'R', Q: 'M', R: 'B', B: 'G', N: 'K' };

export function sanIndonesia(san) {
  return san
    .replace(/^[KQRBN]/, c => HURUF_INDONESIA[c])
    .replace(/=([QRBN])/, (_, c) => '=' + HURUF_INDONESIA[c]);
}
