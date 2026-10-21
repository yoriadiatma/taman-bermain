// sw.js — service worker agar aplikasi bisa dipakai offline setelah kunjungan pertama.
//
// SETIAP ADA UPDATE: naikkan VERSI_CACHE (mis. 'tgb-v2'), dan tambahkan file
// baru ke BERKAS. Saat versi naik, cache lama milik aplikasi ini dihapus.
// Service worker tidak didaftarkan di localhost (lihat js/main.js).

const VERSI_CACHE = 'tgb-v7';
// Origin <username>.github.io dipakai bersama project lain: hanya sentuh cache berawalan ini.
const AWALAN_CACHE = 'tgb-';

// test.html, folder uji/, dan file uji.js tiap game sengaja tidak di-cache (hanya untuk pengembang).
const BERKAS = [
  './',
  'index.html',
  'manifest.json',
  'ikon.svg',
  'css/base.css',
  'css/blok.css',
  'css/catur.css',
  'css/hub.css',
  'css/quiz.css',
  'css/pasangan.css',
  'css/ular-tangga.css',
  'data/avatar.js',
  'data/catur-puzzle.js',
  'data/pasangan.js',
  'data/questions.js',
  'data/soal/bahasa.js',
  'data/soal/ipa.js',
  'data/soal/matematika.js',
  'data/soal/nusantara.js',
  'data/soal/pai.js',
  'data/ungkapan.js',
  'js/main.js',
  'js/core/audio.js',
  'js/core/cadangan.js',
  'js/core/mapel.js',
  'js/core/profile.js',
  'js/core/quiz-ui.js',
  'js/core/quiz.js',
  'js/core/registry.js',
  'js/core/router.js',
  'js/core/storage.js',
  'js/core/teacher.js',
  'js/core/ui.js',
  'js/games/index.js',
  'js/games/blok/aksi.js',
  'js/games/blok/barang.js',
  'js/games/blok/blok.js',
  'js/games/blok/dunia.js',
  'js/games/blok/index.js',
  'js/games/blok/inventori.js',
  'js/games/blok/kontrol.js',
  'js/games/blok/misi.js',
  'js/games/blok/panel.js',
  'js/games/blok/pemain.js',
  'js/games/blok/render.js',
  'js/games/blok/resep.js',
  'js/games/blok/tekstur.js',
  'js/games/catur/ai-worker.js',
  'js/games/catur/ai.js',
  'js/games/catur/belajar.js',
  'js/games/catur/bidak.js',
  'js/games/catur/index.js',
  'js/games/catur/komputer.js',
  'js/games/catur/mesin.js',
  'js/games/catur/papan.js',
  'js/games/catur/permainan.js',
  'js/games/catur/puzzle.js',
  'js/games/catur/simpanan.js',
  'js/games/pasangan/index.js',
  'js/games/pasangan/kartu.js',
  'js/games/ular-tangga/aturan.js',
  'js/games/ular-tangga/index.js',
  'js/screens/hub.js',
  'js/screens/pengaturan.js',
  'js/screens/permainan.js',
  'js/screens/profil.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI_CACHE).then(c => c.addAll(BERKAS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(kunci => Promise.all(kunci
      .filter(k => k.startsWith(AWALAN_CACHE) && k !== VERSI_CACHE)
      .map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSI_CACHE).then(async cache => {
    const ada = await cache.match(req, { ignoreSearch: true });
    if (ada) return ada;
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  }));
});
