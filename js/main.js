// main.js — titik masuk aplikasi Taman Game Belajar.

import * as storage from './core/storage.js';
import * as profil from './core/profile.js';
import * as router from './core/router.js';
import * as audio from './core/audio.js';
import { toast } from './core/ui.js';
import { tampilModeGuru } from './core/teacher.js';
import { muatSemuaGame } from './games/index.js';
import { tampilPilihProfil, tampilFormProfil } from './screens/profil.js';
import { tampilHub } from './screens/hub.js';
import { tampilPermainan } from './screens/permainan.js';
import { tampilPengaturan } from './screens/pengaturan.js';

const app = document.getElementById('app');

let peringatanKuota = 0;
storage.saatGalat(jenis => {
  // Batasi agar toast tidak muncul terus-menerus.
  if (Date.now() - peringatanKuota < 60000) return;
  peringatanKuota = Date.now();
  toast(jenis === 'kuota'
    ? 'Penyimpanan browser penuh. Ekspor progres lalu hapus data lama di Mode Guru.'
    : 'Progres gagal disimpan.', 'peringatan', 6000);
});

storage.migrasi();
if (!storage.tersedia()) {
  toast('Penyimpanan browser tidak bisa dipakai (mungkin mode privat). Progres tidak akan tersimpan.', 'peringatan', 8000);
}

const gagal = await muatSemuaGame();
if (gagal.length) toast(`${gagal.length} game gagal dimuat.`, 'peringatan', 5000);

// Halaman yang boleh dibuka tanpa profil aktif.
const TANPA_PROFIL = ['/profil', '/guru', '/pengaturan'];

router.pasangPenjaga(path => {
  const adaProfil = !!profil.aktif();
  if (path === '/') return adaProfil ? '/hub' : '/profil';
  if (!adaProfil && !TANPA_PROFIL.some(p => path === p || path.startsWith(p + '/'))) return '/profil';
  return null;
});

router.daftar('/profil', () => tampilPilihProfil(app));
router.daftar('/profil/baru', () => tampilFormProfil(app));
router.daftar('/profil/ubah/:id', ({ id }) => tampilFormProfil(app, id));
router.daftar('/hub', () => tampilHub(app));
router.daftar('/main/:id', ({ id }) => tampilPermainan(app, id));
router.daftar('/pengaturan', () => tampilPengaturan(app));
router.daftar('/guru', () => tampilModeGuru(app));

storage.pasangAutoSave();

// Suara hanya boleh dimulai setelah interaksi pertama pengguna.
window.addEventListener('pointerdown', audio.buka, { once: true });
window.addEventListener('keydown', audio.buka, { once: true });
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b && !b.disabled && !b.hasAttribute('data-sunyi')) audio.main('klik');
});

router.mulai('/');

// Service worker hanya di situs yang sudah di-deploy, supaya saat pengembangan
// di localhost file tidak tertahan di cache lama.
const LOKAL = ['localhost', '127.0.0.1', '[::1]'];
if ('serviceWorker' in navigator && !LOKAL.includes(location.hostname)) {
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker gagal didaftarkan:', e));
}
