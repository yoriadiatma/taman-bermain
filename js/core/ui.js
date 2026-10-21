// ui.js — helper tampilan yang dipakai bersama: pembuat elemen, modal, toast,
// papan angka, bintang, dan penggambar pixel art SVG.

import { AVATAR } from '../../data/avatar.js';
import { PUJIAN, SEMANGAT, MULAI } from '../../data/ungkapan.js';

/**
 * Buat elemen DOM. props: class, text, html, style (objek), dataset, on<event>,
 * selain itu menjadi atribut. Anak boleh berupa Node, string, atau array.
 * PENTING: `html` hanya untuk SVG buatan aplikasi sendiri, jangan untuk teks dari pengguna.
 */
export function el(tag, props = {}, ...anak) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const a of anak.flat(Infinity)) {
    if (a != null && a !== false) e.append(a instanceof Node ? a : String(a));
  }
  return e;
}

const acak = daftar => daftar[Math.floor(Math.random() * daftar.length)];
export const pujian = () => acak(PUJIAN);
export const semangat = () => acak(SEMANGAT);
export const kataMulai = () => acak(MULAI);

const escAttr = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * Ubah grid huruf menjadi string SVG pixel art.
 * grid: array string sama panjang; palet: { huruf: warna }; huruf tanpa warna = transparan.
 */
export function pixelSvg(grid, palet, { latar = null, pad = 0, label = '' } = {}) {
  const h = grid.length;
  const w = Math.max(...grid.map(b => b.length));
  let isi = latar ? `<rect x="${-pad}" y="${-pad}" width="${w + pad * 2}" height="${h + pad * 2}" fill="${latar}"/>` : '';
  grid.forEach((baris, y) => {
    let x = 0;
    while (x < baris.length) {
      const c = baris[x];
      let n = 1;
      while (baris[x + n] === c) n++;
      if (palet[c]) isi += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${palet[c]}"/>`;
      x += n;
    }
  });
  const aria = label ? `role="img" aria-label="${escAttr(label)}"` : 'aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}" shape-rendering="crispEdges" ${aria}>${isi}</svg>`;
}

export function avatarSvg(id, label = '') {
  const a = AVATAR.find(x => x.id === id) || AVATAR[0];
  return pixelSvg(a.grid, a.palet, { latar: a.latar, pad: 1, label });
}

// Logo aplikasi: bintang pixel.
const LOGO = pixelSvg([
  '.....yy.....',
  '.....yy.....',
  '....yyyy....',
  'yyyyyyyyyyyy',
  '.yyyyyyyyyy.',
  '..yyyyyyyy..',
  '...yyyyyy...',
  '..yyyyyyyy..',
  '..yyy..yyy..',
  '.yyy....yyy.',
  '.yy......yy.',
  '............',
], { y: '#ffd43b' }, { latar: '#1c6fd1', pad: 2 });

export function kepalaAplikasi() {
  return el('div', { class: 'kepala-aplikasi' },
    el('span', { class: 'logo', html: LOGO }),
    el('span', { class: 'judul-aplikasi' }, 'Taman Game Belajar'));
}

export function bintang(n, maks = 3) {
  const s = el('span', { class: 'bintang', role: 'img', 'aria-label': `${n} dari ${maks} bintang` });
  for (let i = 0; i < maks; i++) s.append(el('span', { class: i < n ? 'isi' : 'kosong', 'aria-hidden': 'true' }, '★'));
  return s;
}

export function toast(pesan, jenis = 'info', durasi = 2600) {
  const wadah = document.getElementById('toast-wadah');
  if (!wadah) return;
  const t = el('div', { class: `toast ${jenis}`, role: 'status' }, pesan);
  wadah.append(t);
  setTimeout(() => t.classList.add('hilang'), durasi);
  setTimeout(() => t.remove(), durasi + 400);
}

const TERFOKUS = 'button:not([disabled]), input:not([disabled]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Tampilkan modal. Mengembalikan Promise berisi `nilai` tombol yang ditekan
 * (null jika ditutup dengan Esc). `sebelumTutup(nilai)` boleh mengembalikan
 * false agar modal tetap terbuka (mis. isian belum valid).
 */
export function modal({ judul, isi = null, tombol = [{ teks: 'Tutup', nilai: null }], sebelumTutup = null }) {
  return new Promise(selesai => {
    const sebelumnya = document.activeElement;
    const idJudul = 'modal-' + Math.random().toString(36).slice(2);
    const tombolEl = tombol.map(t => el('button', {
      class: `tombol ${t.kelas || 'kedua'}`,
      type: 'button',
      onclick: () => tutup(t.nilai),
    }, t.teks));
    const kotak = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': idJudul },
      el('h2', { id: idJudul }, judul),
      typeof isi === 'string' ? el('p', {}, isi) : isi,
      el('div', { class: 'modal-tombol' }, tombolEl));
    const latar = el('div', { class: 'modal-latar' }, kotak);

    async function tutup(nilai) {
      if (nilai !== null && sebelumTutup && (await sebelumTutup(nilai)) === false) return;
      document.removeEventListener('keydown', saatTombol, true);
      latar.remove();
      sebelumnya?.focus?.({ preventScroll: true });
      selesai(nilai);
    }

    function saatTombol(e) {
      if (e.key === 'Escape') { e.preventDefault(); tutup(null); return; }
      if (e.key !== 'Tab') return;
      const fokus = [...kotak.querySelectorAll(TERFOKUS)];
      if (!fokus.length) return;
      const pertama = fokus[0];
      const terakhir = fokus[fokus.length - 1];
      if (e.shiftKey && document.activeElement === pertama) { e.preventDefault(); terakhir.focus(); }
      else if (!e.shiftKey && document.activeElement === terakhir) { e.preventDefault(); pertama.focus(); }
    }

    document.addEventListener('keydown', saatTombol, true);
    document.body.append(latar);
    (kotak.querySelector('input, select, textarea') || tombolEl[tombolEl.length - 1])?.focus();
  });
}

export async function konfirmasi(pesan, { judul = 'Yakin?', ya = 'Ya', tidak = 'Batal', bahaya = false } = {}) {
  const nilai = await modal({
    judul,
    isi: pesan,
    tombol: [
      { teks: tidak, nilai: false, kelas: 'kedua' },
      { teks: ya, nilai: true, kelas: bahaya ? 'bahaya' : 'utama' },
    ],
  });
  return nilai === true;
}

const layarSentuh = () => window.matchMedia('(pointer: coarse)').matches;

/**
 * Papan angka besar untuk tablet + kotak isian yang juga bisa diketik dengan keyboard.
 * Mengembalikan { elemen, input, nilai(), kosongkan(), fokus() }.
 */
export function papanAngka({ saatKirim, maksDigit = 6, label = 'Jawaban', rahasia = false, teksKirim = 'OK' }) {
  const input = el('input', {
    class: 'papan-tampil',
    type: rahasia ? 'password' : 'text',
    // Di layar sentuh keyboard bawaan disembunyikan karena sudah ada papan angka.
    inputmode: layarSentuh() ? 'none' : 'numeric',
    autocomplete: 'off',
    maxlength: String(maksDigit),
    'aria-label': label,
  });
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, maksDigit); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); kirim(); }
  });

  function kirim() {
    if (input.value !== '') saatKirim(input.value);
  }
  function tekan(d) {
    if (input.value.length < maksDigit) input.value += d;
    input.focus({ preventScroll: true });
  }

  const tombol = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d =>
    el('button', { type: 'button', class: 'tombol kedua tombol-angka', onclick: () => tekan(d) }, d));
  tombol.push(
    el('button', {
      type: 'button', class: 'tombol kedua tombol-angka', 'aria-label': 'Hapus satu angka',
      onclick: () => { input.value = input.value.slice(0, -1); input.focus({ preventScroll: true }); },
    }, '⌫'),
    el('button', { type: 'button', class: 'tombol kedua tombol-angka', onclick: () => tekan('0') }, '0'),
    el('button', { type: 'button', class: 'tombol utama tombol-angka', onclick: kirim }, teksKirim),
  );

  return {
    elemen: el('div', { class: 'papan-angka' }, input, el('div', { class: 'papan-tombol' }, tombol)),
    input,
    nilai: () => input.value,
    kosongkan: () => { input.value = ''; },
    fokus: () => input.focus({ preventScroll: true }),
  };
}

export function unduh(namaBerkas, isi, mime = 'application/json') {
  const url = URL.createObjectURL(new Blob([isi], { type: mime }));
  const a = el('a', { href: url, download: namaBerkas });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Buka dialog pilih berkas. Promise berisi File, atau null jika dibatalkan. */
export function pilihBerkas(accept = '.json,application/json') {
  return new Promise(selesai => {
    const input = el('input', { type: 'file', accept, style: { display: 'none' } });
    input.addEventListener('change', () => { selesai(input.files[0] || null); input.remove(); });
    input.addEventListener('cancel', () => { selesai(null); input.remove(); });
    document.body.append(input);
    input.click();
  });
}

/** Tanggal lokal dalam format YYYY-MM-DD (untuk nama berkas). */
export function tanggalHariIni() {
  const d = new Date();
  const dua = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
}
