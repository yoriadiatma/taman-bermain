// Blok Petualang — dunia 2D berbasis tile ala sandbox.
// Tahap 5: dunia prosedural dari seed, render, gerak pemain, siang-malam.

import { el, pixelSvg } from '../../core/ui.js';
import { Dunia, LEBAR, TINGGI, LAUT, seedAcak } from './dunia.js';
import { Pemain } from './pemain.js';
import { Penggambar, terangSiang } from './render.js';
import { pasangKontrol } from './kontrol.js';
import { namaBlok } from './blok.js';

const SATU_HARI = 8 * 60; // detik: satu siklus siang-malam

const ikon = pixelSvg([
  '............',
  '............',
  '.....yy.....',
  '....yyyy....',
  '.....yy.....',
  '............',
  'gggggggggggg',
  'gggggggggggg',
  'ddddddddsdd.',
  'ddsddddddddd',
  'ssssssssssss',
  'sosssssoasss',
], { y: '#ffd43b', g: '#4caf50', d: '#8b5a2b', s: '#8a8f98', o: '#1f2125', a: '#f7cf2a' }, { latar: '#74c0fc', pad: 1 });

let s = null;

function posisiAman(dunia, data) {
  if (!data || !Number.isFinite(data.x) || !Number.isFinite(data.y)) return null;
  if (data.x < 1 || data.x > LEBAR - 1 || data.y < 2 || data.y > TINGGI - 2) return null;
  // Jangan muncul di dalam blok padat.
  const p = new Pemain(data.x, data.y);
  for (let ty = Math.floor(p.y - p.tinggi); ty <= Math.floor(p.y - 1e-6); ty++) {
    if (dunia.padat(Math.floor(p.x - p.lebar / 2), ty) || dunia.padat(Math.floor(p.x + p.lebar / 2), ty)) return null;
  }
  return data;
}

function teksKetinggian(y) {
  const n = LAUT - Math.floor(y);
  if (n > 0) return `Ketinggian: ${n} blok di atas permukaan laut`;
  if (n < 0) return `Kedalaman: ${-n} blok di bawah permukaan laut`;
  return 'Tepat di permukaan laut';
}

function perbaruiHud() {
  const { pemain, dunia, el: e } = s;
  const siang = terangSiang(s.waktu);
  e.waktu.textContent = siang > 0.5 ? '☀️ Siang' : '🌙 Malam';
  e.posisi.textContent = teksKetinggian(pemain.y);
  if (e.fps) e.fps.textContent = `${s.fps} FPS`;
  const kaki = dunia.get(Math.floor(pemain.x), Math.floor(pemain.y));
  e.pijakan.textContent = pemain.diAir ? 'Sedang berenang' : pemain.diTanah ? `Berdiri di atas: ${namaBlok(kaki)}` : '';
}

function putaran(sekarang) {
  if (!s) return;
  const dt = Math.min(0.1, (sekarang - s.waktuTerakhir) / 1000 || 0);
  s.waktuTerakhir = sekarang;
  const { pemain, dunia, penggambar } = s;

  pemain.perbarui(dt, s.kontrol.input, dunia);
  s.waktu = (s.waktu + dt / SATU_HARI) % 1;

  // Kamera mengikuti pemain dengan halus, tidak keluar dari batas dunia.
  const lt = penggambar.lebarTile;
  const tt = penggambar.tinggiTile;
  const tx = Math.max(0, Math.min(LEBAR - lt, pemain.x - lt / 2));
  const ty = Math.max(0, Math.min(TINGGI - tt, pemain.y - 1 - tt / 2));
  const k = 1 - Math.pow(0.001, dt);
  s.kamera.x += (tx - s.kamera.x) * k;
  s.kamera.y += (ty - s.kamera.y) * k;

  penggambar.gambar({ dunia, pemain, kamera: s.kamera, waktu: s.waktu });

  s.bingkai++;
  if (sekarang - s.hudTerakhir > 250) {
    s.fps = Math.round((s.bingkai * 1000) / (sekarang - s.hudTerakhir));
    s.bingkai = 0;
    s.hudTerakhir = sekarang;
    perbaruiHud();
  }
  s.rafId = requestAnimationFrame(putaran);
}

function simpan() {
  if (!s) return;
  s.ctx.store.set('pemain', { x: +s.pemain.x.toFixed(3), y: +s.pemain.y.toFixed(3) });
  s.ctx.store.set('waktu', +s.waktu.toFixed(4));
  s.ctx.store.set('karakter', s.karakter);
}

function bantuan() {
  return el('div', { class: 'blok-bantuan panel', role: 'dialog', 'aria-label': 'Cara bermain' },
    el('h2', {}, 'Cara bermain'),
    el('ul', {},
      el('li', {}, 'Jalan: tombol ← → atau A dan D.'),
      el('li', {}, 'Lompat: tombol ↑, W, atau Spasi.'),
      el('li', {}, 'Di air, tahan tombol lompat untuk berenang ke atas.'),
      el('li', {}, 'Di tablet: pakai tombol ◀ ▶ dan ▲ di layar.')),
    el('p', {}, 'Jelajahi dunia: bukit, danau, pohon, dan gua. Semakin dalam, semakin gelap!'),
    el('button', { class: 'tombol utama', type: 'button', onclick: () => { s.el.bantuan.hidden = true; s.ctx.store.set('bantuanDilihat', true); } }, 'Ayo main!'));
}

export default {
  id: 'blok',
  nama: 'Blok Petualang',
  deskripsi: 'Jelajahi dunia blok: berjalan, melompat, berenang, dan masuk ke gua.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: ['matematika', 'ipa'],
  css: 'css/blok.css',

  mount(container, ctx) {
    let data = ctx.store.get('dunia');
    if (!data || !Number.isInteger(data.seed)) {
      data = { v: 1, seed: seedAcak() };
      ctx.store.set('dunia', data);
    }
    const dunia = new Dunia(data.seed);
    const pos = posisiAman(dunia, ctx.store.get('pemain')) ?? dunia.titikMuncul();
    const karakter = ctx.store.get('karakter') ?? (ctx.profil.avatar === 'jilbab' ? 'jilbab' : 'peci');

    const kanvas = el('canvas', { class: 'blok-kanvas', 'aria-label': 'Dunia Blok Petualang' });
    const kontrol = pasangKontrol();
    const debug = /[?&]debug\b/.test(location.search);
    const e = {
      waktu: el('span', {}),
      posisi: el('span', {}),
      pijakan: el('span', {}),
      fps: debug ? el('span', {}) : null,
      bantuan: null,
    };
    e.bantuan = bantuan();
    e.bantuan.hidden = !!ctx.store.get('bantuanDilihat');

    const tombolKarakter = el('button', {
      class: 'tombol kedua kecil', type: 'button',
      onclick: () => {
        s.karakter = s.karakter === 'peci' ? 'jilbab' : 'peci';
        s.penggambar.setKarakter(s.karakter);
        simpan();
      },
    }, 'Ganti karakter');

    const bingkai = el('div', { class: 'blok' },
      kanvas,
      el('div', { class: 'blok-hud' }, e.waktu, e.posisi, e.pijakan, e.fps),
      el('div', { class: 'blok-tombol-atas' },
        tombolKarakter,
        el('button', { class: 'tombol kedua kecil', type: 'button', onclick: () => { e.bantuan.hidden = !e.bantuan.hidden; } }, '? Bantuan')),
      kontrol.elemenSentuh,
      e.bantuan);
    container.append(bingkai);

    const penggambar = new Penggambar(kanvas);
    penggambar.setKarakter(karakter);
    const amati = new ResizeObserver(([entri]) => {
      const { width, height } = entri.contentRect;
      penggambar.ukur(width, height);
    });
    amati.observe(bingkai);
    const r = bingkai.getBoundingClientRect();
    penggambar.ukur(r.width, r.height);

    const pemain = new Pemain(pos.x, pos.y);
    s = {
      ctx, dunia, pemain, penggambar, kontrol, karakter, amati, el: e,
      waktu: ctx.store.get('waktu', 0.05),
      kamera: {
        x: Math.max(0, Math.min(LEBAR - penggambar.lebarTile, pemain.x - penggambar.lebarTile / 2)),
        y: Math.max(0, Math.min(TINGGI - penggambar.tinggiTile, pemain.y - 1 - penggambar.tinggiTile / 2)),
      },
      waktuTerakhir: performance.now(),
      hudTerakhir: performance.now(),
      bingkai: 0,
      fps: 0,
      rafId: 0,
    };
    if (debug) window.__blok = s; // untuk memeriksa keadaan game dari konsol (?debug di URL)
    perbaruiHud();
    s.rafId = requestAnimationFrame(putaran);
  },

  unmount() {
    if (!s) return;
    cancelAnimationFrame(s.rafId);
    s.kontrol.lepas();
    s.amati.disconnect();
    s = null;
  },

  simpan,

  progres(store) {
    return store.get('dunia') ? { bintang: 0, teks: 'Dunia sudah dibuat' } : { bintang: 0, teks: 'Belum pernah main' };
  },
};
