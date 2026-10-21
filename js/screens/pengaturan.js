// pengaturan.js — pengaturan suara, serta status pasang aplikasi & offline.

import { el, isiUlang, kepalaAplikasi } from '../core/ui.js';
import * as pwa from '../core/pwa.js';
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

  const panelPasang = el('section', { class: 'panel', 'aria-labelledby': 'judul-pasang' });
  function perbaruiPasang() {
    const offline = {
      siap: '✅ Siap dipakai tanpa internet di perangkat ini.',
      menyiapkan: '⏳ Sedang disiapkan untuk offline. Setelah halaman dimuat ulang sekali saat online, aplikasi bisa dipakai tanpa internet.',
      pengembangan: '🛠️ Mode pengembangan (localhost): offline sengaja dimatikan. Tambahkan ?sw di alamat untuk mengujinya.',
      'tidak-didukung': '⚠️ Browser ini tidak mendukung mode offline.',
    }[pwa.statusOffline()];
    isiUlang(panelPasang,
      el('h2', { id: 'judul-pasang' }, 'Pasang aplikasi & offline'),
      el('p', {}, offline),
      pwa.dipasang()
        ? el('p', {}, '✅ Aplikasi sudah dipasang di perangkat ini.')
        : [
          pwa.bisaPasang() && el('button', {
            class: 'tombol utama', type: 'button',
            onclick: async () => { await pwa.pasang(); perbaruiPasang(); },
          }, '📲 Pasang aplikasi di perangkat ini'),
          el('p', { class: 'catatan' },
            'Jika tombol pasang tidak muncul: di Chrome/Edge buka menu ⋮ lalu pilih "Pasang aplikasi" atau "Tambahkan ke layar utama". ',
            'Di iPad/iPhone: buka di Safari, ketuk tombol Bagikan, lalu pilih "Tambahkan ke Layar Utama".'),
        ],
      el('p', { class: 'catatan' }, 'Progres tetap tersimpan di browser perangkat ini saja. Gunakan Ekspor Progres di menu untuk membuat cadangan.'));
  }
  perbaruiPasang();

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
        el('button', { class: 'tombol kedua', type: 'button', 'data-sunyi': true, onclick: () => audio.main('levelup') }, 'Coba suara naik level'))),
    panelPasang));
}
