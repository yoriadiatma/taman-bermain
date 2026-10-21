// pengaturan.js — pengaturan suara.

import { el, kepalaAplikasi } from '../core/ui.js';
import * as audio from '../core/audio.js';
import * as profil from '../core/profile.js';
import { ke } from '../core/router.js';

export function tampilPengaturan(app) {
  const sakelar = el('button', { class: 'sakelar', type: 'button', role: 'switch', 'aria-labelledby': 'label-suara' });
  const volume = el('input', { id: 'volume', class: 'geser', type: 'range', min: '0', max: '100', step: '5' });

  function perbarui() {
    const nyala = audio.aktif();
    sakelar.setAttribute('aria-checked', String(nyala));
    sakelar.textContent = nyala ? 'Nyala' : 'Mati';
    volume.value = String(Math.round(audio.volume() * 100));
    volume.disabled = !nyala;
  }
  sakelar.addEventListener('click', () => {
    audio.setAktif(!audio.aktif());
    perbarui();
  });
  volume.addEventListener('input', () => audio.setVolume(Number(volume.value) / 100));
  volume.addEventListener('change', () => audio.main('benar'));
  perbarui();

  const kembali = profil.aktif() ? '/hub' : '/profil';
  app.replaceChildren(el('main', { class: 'layar layar-sempit' },
    el('header', { class: 'bilah-atas' },
      kepalaAplikasi(),
      el('button', { class: 'tombol kedua', type: 'button', onclick: () => ke(kembali) }, '← Kembali')),
    el('h1', { tabindex: '-1' }, 'Pengaturan'),
    el('section', { class: 'panel' },
      el('div', { class: 'baris-pengaturan' },
        el('span', { id: 'label-suara', class: 'label-besar' }, 'Suara'),
        sakelar),
      el('div', { class: 'baris-pengaturan' },
        el('label', { for: 'volume', class: 'label-besar' }, 'Volume'),
        volume),
      el('div', { class: 'baris-tombol' },
        el('button', { class: 'tombol kedua', type: 'button', 'data-sunyi': true, onclick: () => audio.main('benar') }, 'Coba suara benar'),
        el('button', { class: 'tombol kedua', type: 'button', 'data-sunyi': true, onclick: () => audio.main('salah') }, 'Coba suara salah'),
        el('button', { class: 'tombol kedua', type: 'button', 'data-sunyi': true, onclick: () => audio.main('levelup') }, 'Coba suara naik level')))));
}
