// audio.js — efek suara sederhana dengan Web Audio API (tanpa file suara).
// AudioContext baru dibuat setelah sentuhan/klik pertama karena aturan autoplay browser.

import * as storage from './storage.js';

const BAWAAN = { suara: true, volume: 0.7 };
let ctx = null;
let master = null;

const pengaturan = () => ({ ...BAWAAN, ...storage.get('settings', {}) });

export const aktif = () => pengaturan().suara;
export const volume = () => pengaturan().volume;

export function setAktif(nyala) {
  storage.set('settings', { ...pengaturan(), suara: !!nyala });
}

export function setVolume(v) {
  storage.set('settings', { ...pengaturan(), volume: Math.min(1, Math.max(0, Number(v) || 0)) });
}

function siapkan() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.connect(ctx.destination);
  return ctx;
}

/** Panggil dari event sentuhan/klik pertama agar suara bisa diputar. */
export function buka() {
  const c = siapkan();
  if (c && c.state === 'suspended') c.resume();
}

function nada(frek, mulai, durasi, { tipe = 'sine', vol = 0.25, keFrek = null } = {}) {
  const t = ctx.currentTime + mulai;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = tipe;
  osc.frequency.setValueAtTime(frek, t);
  if (keFrek) osc.frequency.exponentialRampToValueAtTime(keFrek, t + durasi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + durasi + 0.02);
}

const SUARA = {
  klik: () => nada(660, 0, 0.06, { tipe: 'square', vol: 0.06 }),
  benar: () => {
    nada(523.25, 0, 0.12);
    nada(659.25, 0.1, 0.12);
    nada(783.99, 0.2, 0.22);
  },
  // Sengaja lembut: salah bukan hukuman.
  salah: () => {
    nada(330, 0, 0.14, { tipe: 'triangle', vol: 0.2 });
    nada(262, 0.12, 0.22, { tipe: 'triangle', vol: 0.2 });
  },
  levelup: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nada(f, i * 0.09, 0.16, { tipe: 'square', vol: 0.1 })),
};

/** Putar efek suara: 'klik' | 'benar' | 'salah' | 'levelup'. */
export function main(nama) {
  if (!aktif() || !SUARA[nama]) return;
  if (!siapkan()) return;
  if (ctx.state === 'suspended') ctx.resume();
  master.gain.value = volume();
  SUARA[nama]();
}
