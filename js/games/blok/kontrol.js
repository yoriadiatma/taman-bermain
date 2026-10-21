// kontrol.js — masukan keyboard dan tombol sentuh untuk tablet.

import { el } from '../../core/ui.js';

const TOMBOL = {
  kiri: ['ArrowLeft', 'KeyA'],
  kanan: ['ArrowRight', 'KeyD'],
  lompat: ['ArrowUp', 'KeyW', 'Space'],
};

/**
 * Pasang kontrol. Mengembalikan { input, elemenSentuh, lepas() }.
 * input = { kiri, kanan, lompat } bernilai true selama tombol ditekan.
 */
export function pasangKontrol() {
  const input = { kiri: false, kanan: false, lompat: false };
  const tekanKeyboard = { kiri: false, kanan: false, lompat: false };
  const tekanSentuh = { kiri: false, kanan: false, lompat: false };
  const gabung = () => { for (const k in input) input[k] = tekanKeyboard[k] || tekanSentuh[k]; };

  const aksiDari = kode => Object.keys(TOMBOL).find(k => TOMBOL[k].includes(kode));
  // Abaikan keyboard saat dialog terbuka atau saat mengetik di kotak isian.
  const sibuk = e => document.querySelector('.modal-latar') || /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName ?? '');

  function bawah(e) {
    const aksi = aksiDari(e.code);
    if (!aksi || sibuk(e)) return;
    e.preventDefault(); // cegah halaman ikut bergulir
    tekanKeyboard[aksi] = true;
    gabung();
  }
  function atas(e) {
    const aksi = aksiDari(e.code);
    if (!aksi) return;
    tekanKeyboard[aksi] = false;
    gabung();
  }
  function hilangFokus() {
    for (const k in tekanKeyboard) { tekanKeyboard[k] = false; tekanSentuh[k] = false; }
    gabung();
  }
  window.addEventListener('keydown', bawah);
  window.addEventListener('keyup', atas);
  window.addEventListener('blur', hilangFokus);

  const tombolSentuh = (aksi, label, simbol) => {
    const b = el('button', { type: 'button', class: `blok-sentuh blok-sentuh-${aksi}`, 'aria-label': label, 'data-sunyi': true }, simbol);
    const tekan = v => e => { e.preventDefault(); tekanSentuh[aksi] = v; gabung(); };
    b.addEventListener('pointerdown', e => {
      try { b.setPointerCapture(e.pointerId); } catch { /* sebagian browser menolak; tombol tetap berfungsi */ }
      tekan(true)(e);
    });
    b.addEventListener('pointerup', tekan(false));
    b.addEventListener('pointercancel', tekan(false));
    b.addEventListener('lostpointercapture', tekan(false));
    b.addEventListener('contextmenu', e => e.preventDefault());
    return b;
  };

  const elemenSentuh = el('div', { class: 'blok-kontrol-sentuh' },
    el('div', { class: 'blok-sentuh-arah' },
      tombolSentuh('kiri', 'Jalan ke kiri', '◀'),
      tombolSentuh('kanan', 'Jalan ke kanan', '▶')),
    tombolSentuh('lompat', 'Lompat', '▲'));

  return {
    input,
    elemenSentuh,
    lepas() {
      window.removeEventListener('keydown', bawah);
      window.removeEventListener('keyup', atas);
      window.removeEventListener('blur', hilangFokus);
    },
  };
}
