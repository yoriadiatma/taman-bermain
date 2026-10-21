# Taman Game Belajar

Kumpulan game edukasi untuk anak SD kelas 4–6 (Kurikulum Merdeka), dengan muatan nilai Islami.
Aplikasi web statis: HTML, CSS, dan JavaScript vanilla (ES modules), tanpa server, tanpa build tool,
dan tanpa dependensi luar. Progres disimpan di `localStorage` browser masing-masing perangkat.

> Status: **Tahap 1 (fondasi)**. Baru ada game uji "Tebak Angka". README ini dilengkapi di Tahap 12.

## Menjalankan di komputer sendiri

Aplikasi memakai ES modules, jadi **tidak bisa** dibuka langsung dengan klik dua kali `index.html` (`file://`).
Jalankan server statis dari folder proyek:

```bash
python -m http.server 8000
```

Lalu buka <http://localhost:8000/>. Alternatif dengan Node.js: `npx serve`.

### Menguji di subfolder (seperti GitHub Pages)

Di GitHub Pages aplikasi berjalan di `https://<username>.github.io/<nama-repo>/`. Untuk meniru ini,
jalankan server dari folder **induk** proyek:

```bash
python -m http.server 8001 --directory ..
```

Lalu buka <http://localhost:8001/taman-bermain/>. Semua fitur harus tetap jalan.
Karena itu semua path di kode wajib relatif (jangan diawali `/`).

### Menguji di tablet lewat Wi-Fi

Jalankan server di laptop, lalu dari tablet buka `http://<IP-laptop>:8000/`.
(Service worker/offline tidak aktif lewat alamat ini; itu normal.)

## Struktur

```
index.html, manifest.json, sw.js, ikon.svg, .nojekyll
css/            base.css, hub.css, satu css per game
data/           data bersama (avatar, ungkapan; bank soal mulai Tahap 2)
js/main.js      titik masuk
js/core/        storage, profile, router, registry, ui, audio, teacher, mapel, cadangan
js/screens/     layar profil, hub, permainan, pengaturan
js/games/<id>/  satu folder per game; daftar di js/games/index.js
```

## Data di localStorage

Semua key berawalan `tgb:` (origin github.io dipakai bersama project lain):

| Key | Isi |
|---|---|
| `tgb:schema` | versi skema data (sekarang 1) |
| `tgb:profiles` | daftar profil dan profil aktif |
| `tgb:settings` | pengaturan suara |
| `tgb:teacher` | hash PIN Mode Guru |
| `tgb:p:<idProfil>:g:<idGame>:<key>` | progres game per profil |

Jika format data berubah, naikkan `SCHEMA` di `js/core/storage.js` dan tambahkan fungsi di `MIGRASI`.

## Mode Guru

PIN bawaan: **1234** (segera ganti di Mode Guru → Keamanan). PIN hanya pengaman ringan agar
anak tidak menghapus data tanpa sengaja; kode aplikasi bersifat publik.

## Menambah game baru

1. Buat folder `js/games/<id>/index.js` yang mengekspor definisi game
   (`id, nama, deskripsi, ikon, kelasMin, kelasMax, mapel, mount(container, ctx), unmount()`;
   lihat komentar di `js/core/registry.js`). Contoh: `js/games/tebak-angka/index.js`.
2. Tambahkan satu baris path di `MODUL_GAME` dalam `js/games/index.js`.
3. Jika game punya CSS, buat `css/<id>.css` dan isi field `css`.
4. Tambahkan semua file baru ke daftar `BERKAS` di `sw.js` dan naikkan versi cache.

## Deploy ke GitHub Pages

1. Push repo ke GitHub.
2. Buka **Settings → Pages**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Tunggu beberapa menit, lalu buka `https://<username>.github.io/<nama-repo>/`.

File `.nojekyll` sudah ada agar GitHub Pages tidak memproses file dengan Jekyll.

### Saat ada update

Setiap kali mengubah file, buka `sw.js`, naikkan `VERSI_CACHE` (mis. `tgb-v1` → `tgb-v2`), dan pastikan
file baru ada di `BERKAS`. Tanpa itu, pengguna yang pernah membuka aplikasi tetap melihat versi lama.
