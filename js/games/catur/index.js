// Catur — aturan lengkap, mode 2 pemain di satu perangkat.
// Aturan ada di mesin.js (tanpa DOM), gambar bidak di bidak.js.

import { el, pixelSvg, jebakFokus, konfirmasi } from '../../core/ui.js';
import { Catur, NAMA_BIDAK, NAMA_WARNA, namaKotak, tipe, warnaBidak, sanIndonesia } from './mesin.js';
import { svgBidak } from './bidak.js';

const ikon = pixelSvg([
  '............',
  '......k.....',
  '.....kkk....',
  '....kkwkk...',
  '...kkkkkkk..',
  '..kkkkkkkk..',
  '..kk..kkkk..',
  '......kkkk..',
  '.....kkkkk..',
  '....kkkkkk..',
  '...kkkkkkkk.',
  '...kkkkkkkk.',
], { k: '#fbfbf8', w: '#1f2430' }, { latar: '#b58863', pad: 1 });

const PESAN_AKHIR = {
  skakmat: st => `Skakmat! ${NAMA_WARNA[st.pemenang]} menang.`,
  pat: () => 'Remis (pat): pemain yang mendapat giliran tidak punya langkah legal, padahal rajanya tidak sedang diskak.',
  'tiga-kali': () => 'Remis: posisi yang sama sudah terjadi tiga kali.',
  '50-langkah': () => 'Remis (aturan 50 langkah): 50 langkah berturut-turut tanpa langkah pion dan tanpa makan bidak.',
  materi: () => 'Remis: bidak yang tersisa tidak cukup untuk membuat skakmat.',
};

const STAT_KOSONG = { duaPemain: { selesai: 0, menangPutih: 0, menangHitam: 0, remis: 0 } };

let s = null;

const namaBidak = p => `${NAMA_BIDAK[tipe(p)]} ${NAMA_WARNA[warnaBidak(p)].toLowerCase()}`;

// ---------- Penyimpanan ----------

function simpan() {
  if (!s) return;
  s.ctx.store.set('permainan', {
    fenAwal: s.game.fenAwal,
    langkah: s.game.riwayat.map(m => m.uci),
    putar: s.putar,
    tercatat: s.tercatat,
  });
}

function muatPermainan(store) {
  const data = store.get('permainan');
  if (!data) return null;
  try {
    const g = new Catur(data.fenAwal);
    for (const u of data.langkah) if (!g.jalan(u)) throw new Error(`langkah ${u} tidak legal`);
    return { game: g, putar: !!data.putar, tercatat: !!data.tercatat };
  } catch (e) {
    console.warn('Permainan catur tersimpan tidak bisa dimuat:', e);
    return null;
  }
}

function catatHasil(st) {
  if (s.tercatat) return;
  s.tercatat = true;
  const stat = s.ctx.store.get('statistik', STAT_KOSONG);
  const d = { ...STAT_KOSONG.duaPemain, ...stat.duaPemain };
  d.selesai++;
  if (st.pemenang === 'w') d.menangPutih++;
  else if (st.pemenang === 'b') d.menangHitam++;
  else d.remis++;
  s.ctx.store.set('statistik', { ...stat, duaPemain: d });
}

// ---------- Tampilan ----------

const indeksVisual = sq => (s.putar ? 63 - sq : sq);

function susunKotak() {
  // Urutkan tombol sesuai arah papan (putih di bawah, atau hitam di bawah jika diputar).
  const urut = [];
  for (let v = 0; v < 64; v++) urut.push(s.kotak[s.putar ? 63 - v : v]);
  s.el.papan.replaceChildren(...urut);
}

function render() {
  const g = s.game;
  const st = g.status();
  const terakhir = g.riwayat[g.riwayat.length - 1];
  const tujuan = new Map(s.tujuan.map(m => [m.ke, m]));
  const rajaDiskak = st.skak ? g.raja[g.giliran] : -1;

  for (let sq = 0; sq < 64; sq++) {
    const b = s.kotak[sq];
    const p = g.papan[sq];
    const r = sq >> 3;
    const c = sq & 7;
    const v = indeksVisual(sq);
    const kelas = ['ck', (r + c) % 2 === 0 ? 'terang' : 'gelap'];
    if (sq === s.pilih) kelas.push('dipilih');
    if (terakhir && (sq === terakhir.dari || sq === terakhir.ke)) kelas.push('terakhir');
    if (tujuan.has(sq)) kelas.push(tujuan.get(sq).makan ? 'tujuan-makan' : 'tujuan');
    if (sq === rajaDiskak) kelas.push('diskak');
    b.className = kelas.join(' ');
    b.tabIndex = sq === s.fokus ? 0 : -1;
    let label = `${namaKotak(sq)}, ${p ? namaBidak(p) : 'kosong'}`;
    if (sq === s.pilih) label += ', dipilih';
    if (tujuan.has(sq)) label += ', bisa dituju';
    b.setAttribute('aria-label', label);
    // Koordinat ditulis di kolom paling kiri dan baris paling bawah sesuai arah papan.
    const koordinat = ((v & 7) === 0 ? `<span class="ck-angka">${namaKotak(sq)[1]}</span>` : '') +
      ((v >> 3) === 7 ? `<span class="ck-huruf">${namaKotak(sq)[0]}</span>` : '');
    b.innerHTML = (p ? svgBidak(p) : '') + koordinat;
  }

  if (st.selesai) {
    s.el.status.textContent = PESAN_AKHIR[st.alasan](st);
    s.el.status.className = 'catur-status selesai';
    catatHasil(st);
  } else {
    s.el.status.textContent = `Giliran ${NAMA_WARNA[g.giliran]}` + (st.skak ? ' — Skak! Selamatkan rajamu.' : '');
    s.el.status.className = `catur-status giliran-${g.giliran}${st.skak ? ' skak' : ''}`;
  }
  s.el.akhir.hidden = !st.selesai;
  s.el.batal.disabled = g.riwayat.length === 0;

  const baris = [];
  g.riwayat.forEach((m, i) => {
    if (m.warna === 'w' || i === 0) baris.push({ no: Math.ceil((i + 1) / 2), w: '', b: '' });
    baris[baris.length - 1][m.warna] = sanIndonesia(m.san);
  });
  s.el.riwayat.replaceChildren(...baris.map(b => el('li', {},
    el('span', { class: 'no' }, `${b.no}.`), el('span', {}, b.w || '…'), el('span', {}, b.b))));
  s.el.riwayat.scrollTop = s.el.riwayat.scrollHeight;
}

function pesan(teks) {
  s.el.pesan.textContent = teks;
}

// ---------- Interaksi ----------

function pilihPromosi(warna) {
  return new Promise(selesai => {
    const sebelumnya = document.activeElement;
    const tutup = v => {
      lepas();
      latar.remove();
      s?.dialog === tutup && (s.dialog = null);
      sebelumnya?.focus?.({ preventScroll: true });
      selesai(v);
    };
    const kotak = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'judul-promosi' },
      el('h2', { id: 'judul-promosi' }, 'Pion sampai di ujung papan! Pilih bidak penggantinya.'),
      el('div', { class: 'catur-promosi' }, ['q', 'r', 'b', 'n'].map(t => el('button', {
        type: 'button', class: 'tombol kedua', onclick: () => tutup(t),
      }, el('span', { class: 'catur-promosi-ikon', html: svgBidak(warna === 'w' ? t.toUpperCase() : t) }), NAMA_BIDAK[t]))),
      el('div', { class: 'modal-tombol' }, el('button', { type: 'button', class: 'tombol kedua', onclick: () => tutup(null) }, 'Batal')));
    const latar = el('div', { class: 'modal-latar' }, kotak);
    const lepas = jebakFokus(kotak, () => tutup(null));
    s.dialog = tutup;
    document.body.append(latar);
    kotak.querySelector('button').focus();
  });
}

async function jalankan(pilihan) {
  let m = pilihan[0];
  if (pilihan.length > 1) {
    const pr = await pilihPromosi(warnaBidak(m.bidak));
    if (!s || !pr) return;
    m = pilihan.find(x => x.promosi === pr);
  }
  const hasil = s.game.jalan(m);
  if (!hasil) return;
  s.pilih = null;
  s.tujuan = [];
  pesan(hasil.makan ? `${NAMA_BIDAK[tipe(hasil.bidak)]} memakan ${NAMA_BIDAK[tipe(hasil.makan)].toLowerCase()}.` : '');
  simpan();
  render();
  if (s.game.status().selesai) s.ctx.audio.main('levelup');
}

function klikKotak(sq) {
  const g = s.game;
  s.fokus = sq;
  if (g.status().selesai) {
    render();
    return;
  }
  const p = g.papan[sq];
  const cocok = s.tujuan.filter(m => m.ke === sq);
  if (s.pilih !== null && cocok.length) {
    jalankan(cocok);
    return;
  }
  if (p && warnaBidak(p) === g.giliran) {
    if (s.pilih === sq) {
      s.pilih = null;
      s.tujuan = [];
      pesan('');
    } else {
      s.pilih = sq;
      s.tujuan = g.langkahLegal(sq);
      if (s.tujuan.length) pesan('');
      else if (g.skak()) pesan('Rajamu sedang diskak! Pilih bidak yang bisa menyelamatkan raja.');
      else if (g.terkunci(sq)) pesan(`${NAMA_BIDAK[tipe(p)]} ini tidak boleh bergerak, karena rajamu akan terancam.`);
      else pesan(`${NAMA_BIDAK[tipe(p)]} ini belum punya langkah. Coba bidak lain.`);
    }
  } else {
    if (p && s.pilih === null) pesan(`Sekarang giliran ${NAMA_WARNA[g.giliran]}.`);
    else if (s.pilih !== null) pesan('Langkah itu tidak boleh. Pilih salah satu titik hijau.');
    s.pilih = null;
    s.tujuan = [];
  }
  render();
}

function tombolPanah(e) {
  const arah = { ArrowUp: -8, ArrowDown: 8, ArrowLeft: -1, ArrowRight: 1 }[e.key];
  if (arah === undefined) return;
  e.preventDefault();
  const v = indeksVisual(s.fokus);
  const kolomBaru = (v & 7) + (Math.abs(arah) === 1 ? arah : 0);
  const vBaru = v + arah;
  if (vBaru < 0 || vBaru > 63 || kolomBaru < 0 || kolomBaru > 7) return;
  s.fokus = indeksVisual(vBaru);
  render();
  s.kotak[s.fokus].focus();
}

function batalLangkah() {
  if (!s.game.batal()) return;
  s.pilih = null;
  s.tujuan = [];
  pesan('Langkah terakhir dibatalkan.');
  simpan();
  render();
}

function putarPapan() {
  s.putar = !s.putar;
  susunKotak();
  simpan();
  render();
}

async function permainanBaru() {
  if (s.game.riwayat.length && !s.game.status().selesai &&
    !(await konfirmasi('Permainan yang sedang berjalan akan dihapus.', { judul: 'Mulai permainan baru?', ya: 'Mulai baru' }))) return;
  if (!s) return;
  s.game = new Catur();
  s.pilih = null;
  s.tujuan = [];
  s.tercatat = false;
  s.fokus = 52; // e2
  pesan('');
  simpan();
  render();
}

export default {
  id: 'catur',
  nama: 'Catur',
  deskripsi: 'Main catur dengan aturan lengkap. Berdua bergantian di satu perangkat.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: 'logika',
  css: 'css/catur.css',

  mount(container, ctx) {
    const tersimpan = muatPermainan(ctx.store);
    s = {
      ctx,
      game: tersimpan?.game ?? new Catur(),
      putar: tersimpan?.putar ?? false,
      tercatat: tersimpan?.tercatat ?? false,
      pilih: null,
      tujuan: [],
      fokus: 52,
      dialog: null,
      kotak: Array.from({ length: 64 }, (_, sq) => el('button', {
        type: 'button', 'data-sunyi': true, onclick: () => klikKotak(sq),
      })),
      el: {},
    };
    const e = s.el;
    e.status = el('p', { class: 'catur-status', 'aria-live': 'polite' });
    e.papan = el('div', { class: 'catur-papan', role: 'group', 'aria-label': 'Papan catur', onkeydown: tombolPanah });
    e.pesan = el('p', { class: 'catur-pesan', 'aria-live': 'polite' });
    e.akhir = el('div', { class: 'catur-akhir', hidden: true },
      el('button', { class: 'tombol utama', type: 'button', onclick: permainanBaru }, 'Main lagi'));
    e.batal = el('button', { class: 'tombol kedua', type: 'button', onclick: batalLangkah }, '↶ Batal langkah');
    e.riwayat = el('ol', { class: 'catur-riwayat', 'aria-label': 'Riwayat langkah' });

    container.append(el('div', { class: 'catur' },
      el('div', { class: 'catur-kiri' }, e.status, e.papan, e.pesan, e.akhir),
      el('div', { class: 'catur-kanan' },
        el('div', { class: 'baris-tombol' },
          e.batal,
          el('button', { class: 'tombol kedua', type: 'button', onclick: putarPapan }, '⇅ Putar papan'),
          el('button', { class: 'tombol kedua', type: 'button', onclick: permainanBaru }, 'Permainan baru')),
        el('h2', {}, 'Riwayat langkah'),
        e.riwayat,
        el('details', { class: 'catur-bantuan' },
          el('summary', {}, 'Cara bermain & arti notasi'),
          el('p', {}, 'Ketuk bidak milikmu, lalu ketuk titik hijau untuk melangkah. Lingkaran merah berarti kamu bisa memakan bidak lawan.'),
          el('p', {}, 'Notasi: R = Raja, M = Menteri, B = Benteng, G = Gajah, K = Kuda, pion tanpa huruf. ' +
            'x = makan, + = skak, # = skakmat, O-O = rokade pendek, O-O-O = rokade panjang.')))));

    susunKotak();
    render();
  },

  unmount() {
    s?.dialog?.(null);
    s = null;
  },

  simpan,

  progres(store) {
    const n = store.get('statistik', STAT_KOSONG).duaPemain?.selesai ?? 0;
    return { bintang: 0, teks: n ? `${n} permainan selesai` : 'Belum pernah main' };
  },
};
