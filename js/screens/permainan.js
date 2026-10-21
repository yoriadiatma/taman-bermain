// permainan.js — layar tempat game dijalankan: bar atas, mount/unmount, auto-save.

import * as ui from '../core/ui.js';
import * as audio from '../core/audio.js';
import * as storage from '../core/storage.js';
import * as profil from '../core/profile.js';
import * as registry from '../core/registry.js';
import * as quiz from '../core/quiz.js';
import { tanya, tutupSemua as tutupSemuaSoal } from '../core/quiz-ui.js';
import { ke } from '../core/router.js';

const { el } = ui;

export function tampilPermainan(app, id) {
  const def = registry.ambil(id);
  if (!def) {
    ui.toast('Game tidak ditemukan.', 'peringatan');
    ke('/hub');
    return null;
  }
  const p = profil.aktif();

  let css = null;
  if (def.css) {
    css = el('link', { rel: 'stylesheet', href: def.css, 'data-game': def.id });
    document.head.append(css);
  }

  const wadah = el('div', { class: 'area-game', id: `game-${def.id}` });
  app.replaceChildren(el('main', { class: 'layar-game' },
    el('header', { class: 'bilah-game' },
      el('button', { class: 'tombol kedua', type: 'button', onclick: () => ke('/hub') }, '← Kembali ke menu'),
      el('span', { class: 'ikon-kecil', html: def.ikon }),
      el('h1', { tabindex: '-1' }, def.nama)),
    wadah));

  const ctx = {
    profil: p,
    kelas: p.kelas,
    store: storage.untukGame(p.id, def.id),
    audio,
    ui,
    // Soal sesuai kelas profil. Lihat js/core/quiz-ui.js untuk opsi tanya().
    quiz: {
      tanya: (opsi = {}) => tanya({ idProfil: p.id, kelas: p.kelas, ...opsi }),
      pilih: (opsi = {}) => quiz.pilihSoal({ idProfil: p.id, kelas: p.kelas, ...opsi }),
      periksa: quiz.periksaJawaban,
      catat: (soal, benar) => quiz.catat(p.id, soal, benar),
    },
    keluar: () => ke('/hub'),
  };

  let terpasang = false;
  try {
    def.mount(wadah, ctx);
    terpasang = true;
    ui.toast(ui.kataMulai(), 'info', 1800);
  } catch (e) {
    console.error(`Game ${def.id} gagal dimulai:`, e);
    wadah.replaceChildren(el('div', { class: 'panel' },
      el('h2', {}, 'Maaf, game ini sedang bermasalah.'),
      el('p', {}, 'Coba kembali ke menu lalu buka lagi.')));
  }
  const lepasPengait = def.simpan ? storage.saatSimpan(() => def.simpan()) : () => {};

  // Dipanggil router sebelum pindah layar: simpan dulu, baru lepas game.
  return () => {
    lepasPengait();
    tutupSemuaSoal();
    if (terpasang) {
      try { def.simpan?.(); } catch (e) { console.error(e); }
      storage.flush();
      try { def.unmount(); } catch (e) { console.error(e); }
    }
    css?.remove();
  };
}
