// router.js — router berbasis hash (#/hub, #/main/<id>, ...).
// Hash dipakai karena GitHub Pages tidak punya fallback untuk URL SPA,
// dan hash tetap aman saat aplikasi berjalan di subpath /<nama-repo>/.
//
// Setiap fungsi tampil(param) boleh mengembalikan fungsi pembersih yang
// dipanggil sebelum layar berikutnya ditampilkan (mis. simpan & unmount game).

const rute = [];
let bersihkan = null;
let penjaga = () => null;
let bawaan = '/';

/** Daftarkan rute. Pola boleh memakai parameter, mis. '/main/:id'. */
export function daftar(pola, tampil) {
  rute.push({ bagian: pola.split('/').filter(Boolean), tampil });
}

/** fn(path) mengembalikan path pengalihan, atau null jika boleh lanjut. */
export function pasangPenjaga(fn) {
  penjaga = fn;
}

export const sekarang = () => decodeURIComponent(location.hash.slice(1)) || '/';

export function ke(path) {
  if (sekarang() === path) muat();
  else location.hash = path;
}

function cocok(path) {
  const bagian = path.split('/').filter(Boolean);
  for (const r of rute) {
    if (r.bagian.length !== bagian.length) continue;
    const param = {};
    const sama = r.bagian.every((b, i) => {
      if (b.startsWith(':')) { param[b.slice(1)] = bagian[i]; return true; }
      return b === bagian[i];
    });
    if (sama) return { tampil: r.tampil, param };
  }
  return null;
}

function muat() {
  const path = sekarang();
  const alih = penjaga(path);
  if (alih && alih !== path) {
    location.replace('#' + alih);
    return;
  }
  const m = cocok(path);
  if (!m) {
    location.replace('#' + bawaan);
    return;
  }
  if (bersihkan) {
    try { bersihkan(); } catch (e) { console.error(e); }
    bersihkan = null;
  }
  window.scrollTo(0, 0);
  try {
    bersihkan = m.tampil(m.param) || null;
  } catch (e) {
    console.error(`Layar ${path} gagal ditampilkan:`, e);
    const app = document.getElementById('app');
    const tombol = document.createElement('button');
    tombol.className = 'tombol utama';
    tombol.type = 'button';
    tombol.textContent = 'Kembali ke menu';
    tombol.onclick = () => { location.hash = '/hub'; };
    const panel = document.createElement('main');
    panel.className = 'layar layar-sempit';
    panel.innerHTML = '<h1 tabindex="-1">Maaf, halaman ini bermasalah.</h1><p>Coba kembali ke menu atau muat ulang halaman.</p>';
    panel.append(tombol);
    app.replaceChildren(panel);
  }
  // Pindahkan fokus ke judul layar baru, kecuali layar itu sudah memfokuskan sesuatu (mis. isian jawaban).
  if (!document.activeElement || document.activeElement === document.body) {
    document.querySelector('h1')?.focus({ preventScroll: true });
  }
}

export function mulai(pathBawaan) {
  bawaan = pathBawaan;
  window.addEventListener('hashchange', muat);
  muat();
}
