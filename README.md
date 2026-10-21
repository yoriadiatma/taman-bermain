# Taman Game Belajar

Kumpulan 8 game edukasi untuk anak SD kelas 4–6 (Kurikulum Merdeka), dengan muatan nilai Islami.
Aplikasi web statis: HTML, CSS, dan JavaScript vanilla (ES modules), tanpa server, tanpa build tool,
tanpa dependensi luar, dan tanpa request jaringan ke luar. Semua gambar dan suara dibuat dengan kode.
Progres disimpan di `localStorage` browser masing-masing perangkat. Setelah dibuka sekali, aplikasi bisa
dipakai tanpa internet dan bisa dipasang seperti aplikasi (PWA).

## Daftar game

| Game | Kelas | Belajar apa |
|---|---|---|
| Blok Petualang | 4–6 | Dunia blok: perkalian/pembagian saat membuat barang, luas & keliling, misi IPA, ejaan |
| Catur | 4–6 | Lawan komputer 3 tingkat, main berdua, Belajar Bidak, 18 puzzle skakmat |
| Jelajah Nusantara | 4–6 | Peta 38 provinsi, ibu kota, rumah adat, budaya, sejarah Islam Nusantara |
| Petualangan Kata | 4–6 | Labirin huruf: ejaan baku, imbuhan, kata ulang, kosakata IPA & Islami |
| Kebun Ceria | 4–6 | Siklus hidup tumbuhan, pengurai/kompos, pecahan & persen saat berbagi panen |
| Pasangan Kilat | 4–6 | Memori kartu: hitung cepat, pecahan senilai, kata, ciri makhluk hidup |
| Pasar Mini | 4–6 | Uang rupiah: total belanja, diskon, kembalian, kejujuran, infak |
| Ular Tangga Matematika | 4–6 | 2–4 pemain di satu perangkat, soal matematika sesuai kelas tiap pemain |

Soal di dalam game diambil dari bank soal (Matematika, Bahasa Indonesia, IPA, Pengetahuan Umum, PAI) sesuai kelas
profil. Hasilnya tercatat di **Mode Guru**.

## Untuk orang tua dan guru

- **Profil**: setiap anak membuat profil (nama, avatar, kelas 4/5/6). Kelas bisa diubah saat naik kelas.
- **Simpan progres**: progres hanya ada di browser perangkat itu. Pakai **Ekspor Progres** di menu utama untuk membuat
  berkas cadangan (`.json`), lalu **Impor Progres** di perangkat lain atau setelah data browser terhapus.
  Membersihkan data/riwayat browser juga menghapus progres.
- **Pasang aplikasi**: buka **Pengaturan → Pasang aplikasi & offline**. Di Chrome/Edge (Android, Windows, Chromebook)
  muncul tombol 📲 Pasang aplikasi. Di iPad/iPhone: buka di Safari → tombol Bagikan → **Tambahkan ke Layar Utama**.
- **Tanpa internet**: setelah aplikasi dibuka sekali saat online (dan halaman dimuat ulang sekali), semua game bisa
  dimainkan offline. Status offline terlihat di Pengaturan.
- **Mode Guru** (PIN bawaan 1234): statistik soal per mapel/topik, ekspor CSV, melihat dan mencoba isi bank soal,
  reset progres. Lihat bagian Mode Guru di bawah.
- **Konten yang perlu dicek**: data yang diragukan ditandai `cek: true` atau komentar `TODO verifikasi` di folder
  `data/`, terutama soal PAI, data budaya/sejarah, dan data wilayah yang bisa berubah. Soal bertanda ini bisa disaring
  di Mode Guru → Lihat & coba soal.

## Menjalankan di komputer sendiri

Aplikasi memakai ES modules, jadi **tidak bisa** dibuka langsung dengan klik dua kali `index.html` (`file://`).
Jalankan server statis dari folder proyek:

```bash
python -m http.server 8000
```

Lalu buka <http://localhost:8000/>. Alternatif dengan Node.js: `npx serve`.

Setelah mengubah file, muat ulang dengan **Ctrl+F5** (atau Ctrl+Shift+R). Server sederhana di atas tidak
melarang browser menyimpan file lama di cache, jadi muat ulang biasa kadang masih memakai versi lama.

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

### Menguji offline (service worker)

Service worker sengaja tidak aktif di `localhost` agar file tidak tertahan di cache saat pengembangan.
Untuk mengujinya:

1. Jalankan server subfolder di atas, lalu buka <http://localhost:8001/taman-bermain/?sw> (tambahan `?sw` mengaktifkan
   service worker di localhost). Muat ulang sekali; di Pengaturan harus tertulis "Siap dipakai tanpa internet".
2. Matikan server (Ctrl+C), lalu muat ulang halaman. Semua game, Mode Guru, dan komputer catur harus tetap jalan.
3. Setelah selesai, hapus service worker uji agar tidak mengganggu pengembangan: DevTools → Application →
   Service workers → Unregister, lalu Storage → Clear site data (hanya untuk `localhost:8001`; progres di port itu ikut terhapus).

## Struktur

```
index.html, manifest.json, sw.js, .nojekyll
ikon.svg, ikon-*.png  ikon aplikasi (PNG dibuat oleh alat/buat-ikon.py)
alat/           skrip bantu pengembang (tidak dimuat aplikasi)
css/            base.css, hub.css, satu css per game
data/           bank soal (questions.js + soal/), avatar, ungkapan, data tiap game (mis. nusantara.js)
js/main.js      titik masuk
js/core/        storage, profile, router, registry, ui, audio, quiz, quiz-ui, teacher, mapel, cadangan, pwa
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
| `tgb:p:<idProfil>:quiz` | statistik soal per profil |

Jika format data berubah, naikkan `SCHEMA` di `js/core/storage.js` dan tambahkan fungsi di `MIGRASI`.

## Uji otomatis

Buka <http://localhost:8000/test.html> untuk menjalankan semua uji otomatis:

- Catur: aturan (rokade, en passant, promosi, skakmat, remis, perft), kebenaran semua puzzle, pelajaran Belajar Bidak, dan komputer (termasuk Web Worker).
- Blok Petualang: dunia dari seed, diff simpanan, fisika pemain, tas, resep (soal hitungannya selalu benar), menambang, menaruh, rumah, misi, dan peti.
- Pasangan Kilat: jumlah kartu, tidak ada kartu kembar, jawaban hitungan dan nilai pecahan benar.
- Ular Tangga: posisi tangga/ular/petak soal tidak bertumpuk, bonus tidak mendarat di kepala ular, penomoran papan.
- Jelajah Nusantara: 38 provinsi per wilayah, ibu kota terbaru, setiap pin berada di daratan pulau wilayahnya, nama budaya/sejarah unik, setiap ronde misi valid untuk tiap wilayah dan kelas.
- Petualangan Kata: data kata (huruf kapital, unik), labirin selalu tersambung, huruf kata tidak pernah tertutup gerbang, pengecoh dari ejaan keliru.
- Kebun Ceria: tumbuh hanya jika disiram, layu dan pulih, hujan, kompos, ternak, jual beli, soal siklus dan soal membagi panen.
- Pasar Mini: total, diskon, pembayaran, dan kembalian selalu benar; susunan uang paling sedikit (dibandingkan dengan pencarian lengkap); soal infak.

File uji tiap game ada di `js/games/<id>/uji.js` dan didaftarkan di `uji/index.js`. Semua uji harus berwarna hijau. Halaman ini tidak tampil di menu aplikasi.

## Catur

- Lawan komputer: Mudah (melihat 1 langkah, sering melangkah acak), Sedang (2 langkah), Sulit (sampai 5 langkah,
  dibatasi sekitar 2 detik). Komputer berjalan di Web Worker (`js/games/catur/ai-worker.js`).
- Puzzle ada di `data/catur-puzzle.js` (format FEN + langkah solusi UCI). Setelah menambah puzzle, buka `test.html`:
  uji akan memastikan solusinya benar-benar skakmat.

## Blok Petualang

- Dunia 384 × 128 blok dibuat dari sebuah seed (`js/games/blok/dunia.js`); setiap profil punya seed sendiri.
  Yang disimpan hanya seed + daftar blok yang berubah (diff), isi tas, posisi, XP, dan misi.
- Kontrol: ← → / A D untuk jalan, ↑ / W / Spasi untuk lompat, tahan klik untuk menambang, klik kanan untuk menaruh,
  angka 1–9 untuk hotbar, E untuk tas. Di layar sentuh ada tombol ◀ ▶ ▲ dan tombol mode ⛏ Tambang / 🧱 Taruh.
- Belajar di dalam permainan:
  - **Membuat barang** (`resep.js`): sebelum barang jadi, anak menjawab soal perkalian/pembagian tentang bahannya.
  - **Peti terkunci** di dalam gua dibuka dengan soal dari bank soal (semua mapel, sesuai kelas).
  - **Misi** (`misi.js`): misi IPA (tumbuhan, air, cahaya, logam) diakhiri soal dari bank soal; misi bangun memakai soal
    luas dan keliling, lalu bangunannya diperiksa otomatis.
  - **Buku Barang**: menyusun huruf acak menjadi nama barang (ejaan).
- Hasil soal tercatat di statistik Mode Guru.
- Tambahkan `?debug` di URL (mis. `http://localhost:8000/?debug#/main/blok`) untuk menampilkan FPS.

## Pasangan Kilat

- 4 tema: Hitung Cepat (soal dibuat otomatis sesuai kelas), Pecahan (gambar, pecahan senilai, persen/desimal),
  Kata & Emoji, Hewan & Tumbuhan. Jumlah kartu 8–24, pilihan mengikuti kelas.
- Daftar kata, emoji, dan ciri makhluk hidup ada di `data/pasangan.js`; setiap teks harus unik di daftarnya.
- Rekor terbaik (bintang, waktu, percobaan) disimpan per tema dan jumlah kartu.

## Jelajah Nusantara

- Peta Indonesia digambar sendiri dari titik-titik perkiraan (`js/games/jelajah/peta.js`), jadi **bukan peta berskala**.
  Pin provinsi diletakkan dekat ibu kota. Peta bisa digeser, dicubit, diperbesar dengan tombol +/−, atau Ctrl + gulir.
- Pilih wilayah → kapal berlayar ke sana. Ketuk pin untuk membaca kartu provinsi (ibu kota, rumah adat, budaya, jejak Islam).
- Misi 5 soal per wilayah, bergantian "ketuk provinsinya di peta" dan soal pilihan ganda. Salah ketuk menyebut provinsi
  yang diketuk; setelah 2 kali salah muncul petunjuk arah mata angin. Jawaban benar memberi 📮 stempel paspor.
- Isi per kelas: kelas 4 provinsi & ibu kota; kelas 5 ditambah rumah adat & budaya; kelas 6 ditambah sejarah Islam
  Nusantara (kerajaan Islam, masjid bersejarah, Wali Songo, tokoh).
- Data ada di `data/nusantara.js` (38 provinsi per 2024). Butir bertanda `cek: true` dan komentar `TODO verifikasi`
  mohon dicek guru, antara lain: ibu kota Kalimantan Selatan (Banjarbaru sejak 2022), ibu kota Papua Pegunungan,
  status Jakarta/IKN, dan beberapa nama rumah adat. Butir yang diragukan sengaja dikosongkan, bukan dikarang.
- Setelah menambah data, buka `test.html`: uji memastikan pin ada di daratan dan nama budaya tidak dipakai dua provinsi.

## Petualangan Kata

- Labirin dibuat otomatis per level (sama setiap kali level itu dimainkan). Anak membaca petunjuk, lalu mengumpulkan
  huruf kata jawabannya secara berurutan. Menginjak huruf tidak langsung mengambilnya: ambil dengan Spasi/Enter,
  tombol ✋, atau ketuk hurufnya.
- Huruf pengecoh diambil dari ejaan yang sering keliru (mis. I dan H untuk "apotek" vs "apotik"/"himbau").
- Gerbang 🚪 dibuka dengan soal Bahasa Indonesia dari bank soal. Gerbang tidak pernah menutup huruf kata.
- 15 kata per kelas di `data/kata.js` (kata baku, imbuhan, kata ulang, sinonim/antonim, kosakata IPA dan Islami;
  kosakata Islami ditandai TODO verifikasi). Kata yang berhasil disusun masuk ke 📖 Kamus Kata.

## Kebun Ceria

- Dimainkan per hari: siram tanaman, lalu tekan 🌙 Tidur. Tanaman yang disiram tumbuh satu langkah setiap malam;
  2 hari tidak disiram membuat layu (pulih jika disiram). Kadang hujan menyiram semua tanaman.
- Saat panen anak menjawab soal (bergantian: menyusun urutan tahap tumbuh, atau soal IPA dari bank soal); benar = +2 hasil.
- Setelah panen, tetangga kadang datang: anak menghitung bagian yang dibagikan (kelas 4 pecahan, kelas 5 sisa setelah
  pecahan dijual, kelas 6 persen/perbandingan). Berbagi menambah poin kebaikan.
- Sisa tanaman → kompos (pengurai) → hasil panen +50%. Ternak (ayam, kambing, sapi) diberi makan hari ini, hasilnya besok.
- Data tanaman, hewan, dan teks pengetahuannya ada di `data/kebun.js` (ditandai TODO verifikasi).

## Pasar Mini

- **Jadi Kasir**: pembeli datang dengan belanjaan; anak menghitung total (kelas 5–6 juga diskon persen), lalu menyusun
  kembalian dari laci uang. Bintang penuh jika total dan kembalian benar pada percobaan pertama dengan lembar/keping
  paling sedikit. Sesekali ada pilihan berbuat jujur (mengembalikan uang lebih). Setiap 5 pembeli, warung tutup dan
  anak menghitung infak (kelas 4: 1/10, kelas 5: 10%, kelas 6: 5/10/20%).
- **Jadi Pembeli**: memilih barang sesuai daftar belanja, menghitung total, membayar dari dompet, menghitung kembalian.
- **Kenali Uang**: menyusun jumlah uang yang tepat dengan pecahan sesedikit mungkin.
- Pecahan uang dan barang dagangan ada di `data/pasar.js`. Uang digambar dengan kode (bukan tiruan uang asli).
- Level warung naik setelah 5, 15, dan 30 pembeli; setiap level membuka barang baru.

## Ular Tangga Matematika

- 2–4 pemain di satu perangkat; pemain boleh manusia atau komputer, dan setiap pemain punya kelasnya sendiri.
- Petak ❓ memberi soal matematika dari bank soal sesuai kelas pemain: benar maju 3 petak, salah tetap di tempat.
  Statistik soal hanya dicatat untuk pemain pemilik profil.
- Letak tangga, ular, dan petak soal ada di `js/games/ular-tangga/aturan.js`.

## Mode Guru

PIN bawaan: **1234** (segera ganti di Mode Guru → Keamanan). PIN hanya pengaman ringan agar
anak tidak menghapus data tanpa sengaja; kode aplikasi bersifat publik.

Isi Mode Guru: statistik soal per profil (per mapel dan topik, dihitung dari percobaan pertama), ekspor statistik
ke CSV/JSON, Lihat & coba soal (termasuk saringan soal bertanda `cek`), reset progres atau hapus satu profil,
ganti PIN, dan hapus semua data perangkat.

## Bank soal

Soal ada di `data/soal/` (satu file per mapel: `matematika.js`, `bahasa.js`, `ipa.js`, `nusantara.js`, `pai.js`),
digabung oleh `data/questions.js`. Saat ini ada 320 soal untuk kelas 4–6.

### Menambah soal

Salin satu soal yang sudah ada di file mapel yang sesuai, lalu ubah isinya:

```js
{
  id: 'mtk4-23',            // harus unik; lanjutkan nomor terakhir
  kelas: 4,
  topik: 'Pecahan',
  tipe: 'pilihan',          // 'pilihan' | 'angka' | 'teks' | 'urutan'
  pertanyaan: '1/3 + 1/3 = ...',
  pilihan: ['2/3', '2/6', '1/9'],
  jawaban: '2/3',
  petunjuk: 'Penyebutnya sudah sama, jumlahkan pembilangnya.',
  penjelasan: '1/3 + 1/3 = 2/3.',
},
```

- `angka`: `jawaban` berupa number (`3.75`); anak boleh mengetik `3,75`, `1.500`, atau `-3`.
- `teks`: `jawaban` berupa string atau daftar jawaban yang diterima (`['rendah', 'pendek']`).
  Huruf besar/kecil dan titik di akhir diabaikan.
- `urutan`: `jawaban` berupa daftar item dalam urutan yang benar; item diacak saat ditampilkan.
- `cek: true` menandai soal yang perlu diverifikasi guru. Semua soal PAI dan sebagian soal sejarah
  ditandai begitu. Hapus tanda ini setelah soal dicek.

Soal yang formatnya salah tidak dipakai dan didaftar di **Mode Guru → Lihat & coba soal**.
Di halaman itu guru juga bisa menyaring soal yang perlu dicek dan mencoba soal tanpa memengaruhi statistik.
Setelah menambah file soal baru, daftarkan juga di `sw.js`.

### Memakai soal di game

```js
const hasil = await ctx.quiz.tanya({ mapel: 'matematika', topik: 'Pecahan' });
if (hasil.benar) { /* beri bonus */ }
```

Opsi lain: `maksPercobaan` (bawaan 3), `judul`. Mesin soal memilih soal sesuai kelas profil, menghindari soal
yang baru keluar, dan lebih sering memilih topik yang sering salah. Statistik (dihitung dari percobaan pertama)
tampil di Mode Guru dan bisa diekspor ke CSV/JSON.

## Menambah game baru

1. Buat folder `js/games/<id>/index.js` yang mengekspor definisi game
   (`id, nama, deskripsi, ikon, kelasMin, kelasMax, mapel, mount(container, ctx), unmount()`;
   lihat komentar di `js/core/registry.js`). Contoh yang paling sederhana: `js/games/pasangan/index.js`.
2. Tambahkan satu baris path di `MODUL_GAME` dalam `js/games/index.js`.
3. Jika game punya CSS, buat `css/<id>.css` dan isi field `css`.
4. Tambahkan semua file baru ke daftar `BERKAS` di `sw.js` dan naikkan versi cache.

## Deploy ke GitHub Pages

1. Push repo ke GitHub.
2. Buka **Settings → Pages**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Tunggu beberapa menit, lalu buka `https://<username>.github.io/<nama-repo>/`.

File `.nojekyll` sudah ada agar GitHub Pages tidak memproses file dengan Jekyll.

### Saat ada update

Setiap kali mengubah file, buka `sw.js`, naikkan `VERSI_CACHE` (mis. `tgb-v12` → `tgb-v13`), dan pastikan
file baru ada di `BERKAS`. Tanpa itu, pengguna yang pernah membuka aplikasi tetap melihat versi lama.
Setelah versi baru terpasang, aplikasi menampilkan pesan agar halaman dimuat ulang.

Cek cepat bahwa `BERKAS` sama dengan file di repo (Git Bash; tanpa keluaran = cocok):

```bash
diff <(sed -n "/const BERKAS/,/];/p" sw.js | grep -o "'[^']*'" | tr -d "'" | grep -v '^\./$' | sort) <(git ls-files --others --cached --exclude-standard | grep -v '^test.html$\|^uji/\|/uji.js$\|^\.\|README\|^sw.js$\|^alat/' | sort)
```

## Browser yang didukung

Dibutuhkan browser modern yang mendukung ES modules dengan *top-level await*:

- Chrome / Edge / Samsung Internet versi 89 ke atas (Android, Windows, Chromebook)
- Firefox 89 ke atas
- Safari 15 ke atas (iPad/iPhone dengan iPadOS/iOS 15+, Mac)

Catatan:

- Selama pengembangan, aplikasi diuji di browser berbasis Chromium (desktop, ukuran tablet 768 px, dan ponsel 375 px).
  Firefox dan Safari belum diuji langsung; kodenya tidak memakai fitur khusus Chromium, tetapi tetap disarankan
  mencoba sebentar di perangkat anak.
- Firefox di bawah versi 114 tidak mendukung *module worker*; komputer catur otomatis berpikir di thread utama
  (tetap jalan, hanya layar bisa tersendat sebentar di tingkat Sulit).
- Di iPad/iPhone, suara baru bisa berbunyi setelah layar disentuh pertama kali (aturan Safari). Jika perangkat dalam
  mode senyap, efek suara juga tidak terdengar.
- Mode penyamaran/privat bisa menolak `localStorage`; aplikasi memberi peringatan bahwa progres tidak tersimpan.

## Aksesibilitas dan kenyamanan

- Tombol besar (48–56 px), teks dasar 20 px, warna kontras tinggi, fokus keyboard terlihat jelas (bingkai kuning).
- Semua tombol punya nama untuk pembaca layar; dialog soal mengunci fokus dan bisa dijawab dengan keyboard.
- Game bisa dimainkan dengan sentuhan, mouse, atau keyboard (Blok: panah/WASD; Petualangan Kata: panah/WASD + Spasi;
  Jelajah Nusantara: Tab ke pin provinsi + Enter).
- Animasi dikurangi otomatis jika perangkat diatur "kurangi gerakan" (*prefers-reduced-motion*).
- Suara bisa dimatikan atau dikecilkan di Pengaturan. Tidak ada musik latar.

## Pemecahan masalah

| Masalah | Solusi |
|---|---|
| "1 game gagal dimuat" setelah mengubah file di komputer sendiri | Muat ulang dengan Ctrl+F5 (file lama tertahan di cache browser). |
| Versi lama terus muncul setelah deploy | Pastikan `VERSI_CACHE` di `sw.js` sudah dinaikkan, lalu tutup semua tab aplikasi dan buka lagi. |
| Progres hilang | Data browser terhapus, atau memakai browser/perangkat lain. Impor berkas dari Ekspor Progres. |
| Lupa PIN Mode Guru | Hapus key `tgb:teacher` lewat DevTools → Application → Local Storage; PIN kembali ke 1234. |
| Tidak ada suara | Cek Pengaturan → Suara, volume perangkat, dan mode senyap. Sentuh layar sekali setelah membuka aplikasi. |

## Ikon aplikasi

`ikon.svg` adalah ikon utama. Ikon PNG (untuk pemasangan di Android/iOS) dibuat dari pixel art yang sama:

```bash
python alat/buat-ikon.py
```

Butuh Pillow (`pip install pillow`). Hanya perlu dijalankan jika ikon diubah.
