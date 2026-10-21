// hub.js — menu utama: sapaan, tombol-tombol utama, dan kartu game dari registry.

import { el, avatarSvg, kepalaAplikasi, bintang } from '../core/ui.js';
import * as profil from '../core/profile.js';
import * as registry from '../core/registry.js';
import * as storage from '../core/storage.js';
import { MAPEL } from '../core/mapel.js';
import { ke } from '../core/router.js';
import { sapaan } from '../../data/ungkapan.js';
import { eksporProgres, imporProgres } from '../core/cadangan.js';

function kartuGame(def, p) {
  const cocok = registry.cocokKelas(def, p.kelas);
  let prog = null;
  try {
    prog = def.progres?.(storage.untukGame(p.id, def.id), p) ?? null;
  } catch (e) {
    console.error(`Progres game ${def.id} gagal dibaca:`, e);
  }
  return el('button', { class: 'kartu-game', type: 'button', onclick: () => ke(`/main/${def.id}`) },
    el('span', { class: 'ikon-game', html: def.ikon }),
    el('span', { class: 'nama-game' }, def.nama),
    el('span', { class: 'deskripsi-game' }, def.deskripsi),
    el('span', { class: 'baris-chip' },
      registry.daftarMapel(def).map(m => el('span', { class: 'chip', style: { background: MAPEL[m].warna } }, MAPEL[m].nama)),
      !cocok && el('span', { class: 'chip chip-kelas' }, `Untuk kelas ${def.kelasMin}–${def.kelasMax}`)),
    prog && el('span', { class: 'progres-game' }, bintang(prog.bintang ?? 0), el('span', {}, prog.teks ?? '')));
}

export function tampilHub(app) {
  const p = profil.aktif();
  const games = registry.semua().sort((a, b) => registry.cocokKelas(b, p.kelas) - registry.cocokKelas(a, p.kelas));

  app.replaceChildren(el('main', { class: 'layar' },
    el('header', { class: 'bilah-atas' },
      kepalaAplikasi(),
      el('nav', { class: 'menu-atas', 'aria-label': 'Menu' },
        el('button', { class: 'tombol kedua', type: 'button', onclick: () => ke('/profil') }, 'Ganti Profil'),
        el('button', { class: 'tombol kedua', type: 'button', onclick: () => ke('/pengaturan') }, 'Pengaturan'),
        el('button', { class: 'tombol kedua', type: 'button', onclick: () => ke('/guru') }, 'Mode Guru'))),
    el('section', { class: 'sapaan' },
      el('span', { class: 'avatar', html: avatarSvg(p.avatar) }),
      el('div', {},
        el('h1', { tabindex: '-1' }, sapaan(p.nama)),
        el('p', { class: 'kelas-profil' }, `Kelas ${p.kelas} · Mau main apa hari ini?`))),
    el('section', { class: 'panel cadangan' },
      el('div', {},
        el('h2', {}, 'Simpan Progres'),
        el('p', {}, 'Progres hanya tersimpan di browser perangkat ini. Ekspor ke berkas untuk cadangan atau pindah perangkat.')),
      el('div', { class: 'baris-tombol' },
        el('button', { class: 'tombol utama', type: 'button', onclick: eksporProgres }, 'Ekspor Progres'),
        el('button', {
          class: 'tombol kedua', type: 'button',
          onclick: async () => { if (await imporProgres()) ke('/profil'); },
        }, 'Impor Progres'))),
    el('h2', {}, 'Pilih Permainan'),
    games.length
      ? el('div', { class: 'grid-game' }, games.map(g => kartuGame(g, p)))
      : el('p', { class: 'panel' }, 'Belum ada game yang terpasang.')));
}
