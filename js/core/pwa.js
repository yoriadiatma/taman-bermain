// pwa.js — service worker (offline) dan tombol "Pasang aplikasi".

import { toast } from './ui.js';

const LOKAL = ['localhost', '127.0.0.1', '[::1]'];
let ajakanPasang = null;

export const dipasang = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
export const lokal = () => LOKAL.includes(location.hostname);
export const bisaPasang = () => !!ajakanPasang;

/**
 * Status offline: 'siap' (service worker aktif), 'menyiapkan', 'pengembangan' (localhost tanpa ?sw), atau 'tidak-didukung'.
 */
export function statusOffline() {
  if (!('serviceWorker' in navigator)) return 'tidak-didukung';
  if (navigator.serviceWorker.controller) return 'siap';
  if (lokal() && !new URLSearchParams(location.search).has('sw')) return 'pengembangan';
  return 'menyiapkan';
}

/** Tampilkan dialog pasang dari browser. Mengembalikan true jika pengguna memasang. */
export async function pasang() {
  if (!ajakanPasang) return false;
  const e = ajakanPasang;
  ajakanPasang = null;
  e.prompt();
  const { outcome } = await e.userChoice;
  return outcome === 'accepted';
}

export function mulai() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); // tampilkan lewat tombol di Pengaturan, bukan otomatis
    ajakanPasang = e;
  });
  window.addEventListener('appinstalled', () => {
    ajakanPasang = null;
    toast('Aplikasi terpasang. Buka dari layar utama perangkat.', 'sukses', 5000);
  });

  // Service worker hanya di situs yang sudah di-deploy, supaya saat pengembangan
  // di localhost file tidak tertahan di cache lama. Untuk menguji offline di komputer sendiri,
  // buka dengan ?sw di URL (mis. http://localhost:8000/?sw).
  if ('serviceWorker' in navigator && statusOffline() !== 'pengembangan') {
    const sudahAda = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker gagal didaftarkan:', e));
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (sudahAda) toast('Versi baru aplikasi sudah terpasang. Kembali ke menu lalu muat ulang halaman untuk memakainya.', 'info', 8000);
    });
  }

  // Aplikasi yang dipasang: minta agar data tidak dihapus otomatis saat ruang penyimpanan menipis.
  if (dipasang()) navigator.storage?.persist?.().catch(() => {});
}
