// ai-worker.js — Web Worker yang menjalankan pencarian langkah komputer.
// Pesan masuk: { id, fen, tingkat }. Pesan keluar: { id, uci, skor, kedalaman } atau { id, galat }.

import { cariLangkah } from './ai.js';

self.onmessage = e => {
  const { id, fen, tingkat } = e.data;
  try {
    self.postMessage({ id, ...cariLangkah(fen, tingkat) });
  } catch (err) {
    self.postMessage({ id, galat: String(err?.message ?? err) });
  }
};
