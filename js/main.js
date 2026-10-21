// main.js — titik masuk aplikasi Taman Game Belajar.

import * as storage from './core/storage.js';
import * as profil from './core/profile.js';
import * as router from './core/router.js';
import * as audio from './core/audio.js';
import * as pwa from './core/pwa.js';
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

// Galat tak terduga: catat di konsol dan beri tahu dengan lembut (paling sering sekali per 30 detik).
let galatTerakhir = 0;
function laporGalat(e) {
  console.error(e);
  if (Date.now() - galatTerakhir < 30000) return;
  galatTerakhir = Date.now();
  toast('Ups, ada yang tidak beres. Jika layar macet, kembali ke menu atau muat ulang halaman.', 'peringatan', 6000);
}
window.addEventListener('error', e => laporGalat(e.error ?? e.message));
window.addEventListener('unhandledrejection', e => laporGalat(e.reason));

storage.migrasi();
if (!storage.tersedia()) {
  toast('Penyimpanan browser tidak bisa dipakai (mungkin mode privat). Progres tidak akan tersimpan.', 'peringatan', 8000);
}

// Lebih awal, agar ajakan "pasang aplikasi" dari browser tidak terlewat.
pwa.mulai();

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

