// uji.js — uji dunia, tekstur, dan fisika Blok Petualang. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { Dunia, LEBAR, TINGGI, LAUT } from './dunia.js';
import { B } from './blok.js';
import { Pemain, LOMPAT, GRAVITASI } from './pemain.js';
import { BENTUK_SPRITE, SPRITE_LEBAR, SPRITE_TINGGI, IKON_BARANG } from './tekstur.js';
import { terangSiang } from './render.js';
import { Inventori } from './inventori.js';
import { RESEP, maksKali, soalResep } from './resep.js';
import { BARANG } from './barang.js';
import { infoTambang, taruhBlok, taruhRumah, adaPersegi, isiPeti, terjangkau } from './aksi.js';
import { daftarMisi, soalBangun, soalEja } from './misi.js';
import { periksaJawaban } from '../../core/quiz.js';

const uji = (nama, fn) => ujiDasar('Blok Petualang', nama, fn);
const diam = { kiri: false, kanan: false, lompat: false };

/** Dunia kecil buatan untuk uji fisika: lantai di baris 10, dinding di kolom 8. */
function duniaUji() {
  const d = new Dunia(1);
  d.tile.fill(B.UDARA);
  for (let x = 0; x < LEBAR; x++) for (let y = 10; y < TINGGI; y++) d.tile[y * LEBAR + x] = B.BATU;
  for (let y = 0; y < 10; y++) d.tile[y * LEBAR + 8] = B.BATU;
  return d;
}

uji('Seed yang sama menghasilkan dunia yang sama persis', () => {
  const a = new Dunia(12345);
  const b = new Dunia(12345);
  benar(a.tile.every((v, i) => v === b.tile[i]), 'dunia berbeda');
});

uji('Seed berbeda menghasilkan dunia berbeda', () => {
  const a = new Dunia(1);
  const b = new Dunia(2);
  benar(a.tile.some((v, i) => v !== b.tile[i]), 'dunia sama');
});

uji('Dunia dibuat cepat (di bawah 200 ms)', () => {
  const t = performance.now();
  new Dunia(777);
  benar(performance.now() - t < 200, `butuh ${Math.round(performance.now() - t)} ms`);
});

uji('Dasar dunia dan kedua tepinya adalah batuan dasar', () => {
  const d = new Dunia(42);
  for (let x = 0; x < LEBAR; x++) sama(d.get(x, TINGGI - 1), B.BATUAN_DASAR, `kolom ${x}:`);
  for (let y = 0; y < TINGGI; y++) {
    sama(d.get(0, y), B.BATUAN_DASAR);
    sama(d.get(LEBAR - 1, y), B.BATUAN_DASAR);
  }
});

uji('Dunia berisi semua jenis blok alam', () => {
  for (const seed of [1, 99, 2024]) {
    const ada = new Set(new Dunia(seed).tile);
    for (const id of [B.RUMPUT, B.TANAH, B.BATU, B.KAYU, B.DAUN, B.BATU_BARA, B.BIJIH_BESI, B.BIJIH_EMAS]) {
      benar(ada.has(id), `seed ${seed}: blok ${id} tidak ada`);
    }
  }
});

uji('Bijih hanya ada di bawah tanah, emas paling dalam', () => {
  const d = new Dunia(5);
  for (let y = 0; y < TINGGI; y++) {
    for (let x = 0; x < LEBAR; x++) {
      const id = d.get(x, y);
      if (id === B.BATU_BARA || id === B.BIJIH_BESI || id === B.BIJIH_EMAS) benar(y >= d.tanahAlami[x] + 6, `bijih terlalu dangkal di ${x},${y}`);
      if (id === B.BIJIH_EMAS) benar(y > 96, `emas terlalu dangkal di ${x},${y}`);
    }
  }
});

uji('Semua bukit bisa didaki: beda tinggi tanah bersebelahan paling banyak 1 blok', () => {
  for (const seed of [1, 2, 3, 42]) {
    const d = new Dunia(seed);
    for (let x = 1; x < LEBAR; x++) benar(Math.abs(d.tanahAlami[x] - d.tanahAlami[x - 1]) <= 1, `seed ${seed} kolom ${x}`);
  }
});

uji('Pemain bisa berjalan menembus pohon', () => {
  const d = duniaUji();
  for (let y = 4; y < 10; y++) d.tile[y * LEBAR + 6] = B.KAYU;
  d.tile[3 * LEBAR + 6] = B.DAUN;
  const p = new Pemain(4.5, 10);
  for (let i = 0; i < 90; i++) p.perbarui(1 / 60, { ...diam, kanan: true }, d);
  benar(p.x > 7, `pemain tertahan pohon: x=${p.x.toFixed(2)}`);
});

uji('Air hanya ada di bawah permukaan laut', () => {
  const d = new Dunia(987654321);
  for (let y = 0; y < LAUT; y++) for (let x = 0; x < LEBAR; x++) benar(d.get(x, y) !== B.AIR, `air di atas laut ${x},${y}`);
});

uji('Titik muncul berada di daratan, tidak di dalam blok', () => {
  for (const seed of [1, 2, 3, 12345, 987654321]) {
    const d = new Dunia(seed);
    const p = d.titikMuncul();
    benar(d.padat(Math.floor(p.x), p.y), `seed ${seed}: tidak berdiri di blok`);
    benar(!d.padat(Math.floor(p.x), p.y - 1) && !d.padat(Math.floor(p.x), p.y - 2), `seed ${seed}: kepala tertutup blok`);
    benar(!d.cair(Math.floor(p.x), p.y - 1), `seed ${seed}: muncul di air`);
  }
});

uji('Sprite pemain: setiap baris lebarnya 10 piksel, tinggi 28', () => {
  for (const k of ['peci', 'jilbab']) {
    for (const kaki of BENTUK_SPRITE.KAKI[k]) {
      const grid = [...BENTUK_SPRITE.KEPALA[k], ...BENTUK_SPRITE.BADAN[k], ...kaki];
      sama(grid.length, SPRITE_TINGGI, `${k} tinggi:`);
      grid.forEach((b, i) => sama(b.length, SPRITE_LEBAR, `${k} baris ${i}:`));
    }
  }
});

uji('Fisika: pemain jatuh lalu berdiri di lantai', () => {
  const d = duniaUji();
  const p = new Pemain(4.5, 5);
  for (let i = 0; i < 120; i++) p.perbarui(1 / 60, diam, d);
  sama(p.y, 10);
  benar(p.diTanah, 'seharusnya di tanah');
});

uji('Fisika: dinding menghentikan pemain', () => {
  const d = duniaUji();
  const p = new Pemain(4.5, 10);
  for (let i = 0; i < 180; i++) p.perbarui(1 / 60, { ...diam, kanan: true }, d);
  benar(p.x + p.lebar / 2 <= 8, `pemain menembus dinding: x = ${p.x}`);
  benar(p.x > 7, 'pemain seharusnya sampai ke dinding');
});

uji('Fisika: lompatan cukup untuk naik 1 blok, tetapi tidak sampai 2 blok', () => {
  const tinggi = (LOMPAT * LOMPAT) / (2 * GRAVITASI);
  benar(tinggi > 1.2 && tinggi < 2, `tinggi lompatan ${tinggi.toFixed(2)} blok`);
  const d = duniaUji();
  d.tile[9 * LEBAR + 6] = B.BATU; // anak tangga setinggi 1 blok sampai ke dinding
  d.tile[9 * LEBAR + 7] = B.BATU;
  const p = new Pemain(4.5, 10);
  for (let i = 0; i < 120; i++) p.perbarui(1 / 60, { ...diam, kanan: true, lompat: true }, d);
  for (let i = 0; i < 60; i++) p.perbarui(1 / 60, diam, d);
  benar(p.x > 6 && p.y === 9, `pemain tidak naik ke blok: x=${p.x.toFixed(2)} y=${p.y.toFixed(2)}`);
  // Tembok setinggi 2 blok tidak bisa dilompati.
  const d2 = duniaUji();
  d2.tile[9 * LEBAR + 6] = B.BATU;
  d2.tile[8 * LEBAR + 6] = B.BATU;
  const q = new Pemain(4.5, 10);
  for (let i = 0; i < 120; i++) q.perbarui(1 / 60, { ...diam, kanan: true, lompat: true }, d2);
  benar(q.x < 6, `pemain melompati tembok 2 blok: x=${q.x.toFixed(2)}`);
});

uji('Fisika: kepala terbentur atap', () => {
  const d = duniaUji();
  d.tile[7 * LEBAR + 4] = B.BATU; // atap rendah
  const p = new Pemain(4.5, 10);
  p.diTanah = true;
  for (let i = 0; i < 30; i++) p.perbarui(1 / 60, { ...diam, lompat: true }, d);
  benar(p.y - p.tinggi >= 8 - 1e-3, `kepala menembus atap: ${p.y - p.tinggi}`);
});

uji('Siang dan malam', () => {
  sama(terangSiang(0.2), 1);
  sama(terangSiang(0.75), 0);
  benar(terangSiang(0.55) > 0 && terangSiang(0.55) < 1, 'senja seharusnya setengah terang');
});

// ---------- Tahap 6: tas, resep, menambang, menaruh, misi ----------

uji('Tas: menumpuk sampai 64, alat tidak bertumpuk, ambil dan tukar', () => {
  const inv = new Inventori();
  sama(inv.tambah('papan', 100), 0);
  sama(inv.kotak[0].n, 64);
  sama(inv.kotak[1].n, 36);
  inv.tambah('beliung kayu', 2);
  sama(inv.jumlah('beliung kayu'), 2);
  sama(inv.kotak.filter(k => k?.id === 'beliung kayu').length, 2, 'alat satu per kotak:');
  benar(inv.ambil('papan', 70), 'seharusnya bisa ambil 70');
  sama(inv.jumlah('papan'), 30);
  benar(!inv.ambil('papan', 31), 'tidak boleh ambil lebih dari yang ada');
  sama(inv.jumlah('papan'), 30, 'jumlah tidak berubah saat gagal:');
  inv.tukar(0, 26);
  sama(inv.kotak[26]?.id, 'papan');
  const penuh = new Inventori();
  penuh.tambah('batu', 64 * 27);
  sama(penuh.tambah('batu', 5), 5, 'tas penuh mengembalikan sisa:');
  sama(new Inventori(penuh.data()).jumlah('batu'), 64 * 27, 'simpan dan muat ulang:');
});

uji('Resep: semua bahan dan hasil adalah barang yang dikenal', () => {
  for (const r of RESEP) {
    benar(BARANG[r.hasil], `hasil ${r.hasil} tidak dikenal`);
    for (const [id] of r.bahan) benar(BARANG[id], `bahan ${id} tidak dikenal`);
  }
  const inv = new Inventori();
  inv.tambah('kayu', 5);
  sama(maksKali(RESEP.find(r => r.id === 'papan'), inv), 5);
  sama(maksKali(RESEP.find(r => r.id === 'meja kerja'), inv), 0);
});

uji('Resep: jawaban soal hitungan cocok dengan angka di soal', () => {
  const nama = id => BARANG[id].nama.toLowerCase();
  for (const r of RESEP) {
    for (const kelas of [4, 5, 6]) {
      for (let kali = 1; kali <= 6; kali++) {
        for (let i = 0; i < 5; i++) {
          const s = soalResep(r, kali, kelas, nama);
          benar(Number.isInteger(s.jawaban) && s.jawaban > 0, `${r.id}: jawaban tidak valid`);
          const a = s.pertanyaan.match(/\d+/g).map(Number);
          const cocok = s.jawaban === a[0] * a[1] || s.jawaban === a[0] / a[1];
          benar(cocok, `${r.id}: "${s.pertanyaan}" -> ${s.jawaban}`);
        }
      }
    }
  }
});

uji('Menambang: batu butuh beliung, emas butuh beliung besi, beliung mempercepat', () => {
  benar(infoTambang(B.TANAH, null).bisa, 'tanah bisa dengan tangan');
  benar(!infoTambang(B.BATU, null).bisa, 'batu tidak bisa dengan tangan');
  benar(infoTambang(B.BATU, 'beliung kayu').bisa, 'batu bisa dengan beliung kayu');
  benar(!infoTambang(B.BIJIH_BESI, 'beliung kayu').bisa, 'besi butuh beliung batu');
  benar(!infoTambang(B.BIJIH_EMAS, 'beliung batu').bisa, 'emas butuh beliung besi');
  benar(infoTambang(B.BIJIH_EMAS, 'beliung besi').bisa, 'emas bisa dengan beliung besi');
  benar(!infoTambang(B.BATUAN_DASAR, 'beliung besi').bisa, 'batuan dasar tidak bisa ditambang');
  benar(infoTambang(B.BATU, 'beliung besi').detik < infoTambang(B.BATU, 'beliung kayu').detik, 'besi lebih cepat');
});

uji('Menaruh blok: harus menempel, tidak di tempat terisi, tidak di badan pemain', () => {
  const d = duniaUji();
  const p = new Pemain(4.5, 10);
  sama(taruhBlok(d, p, 6, 9, 'papan'), null, 'di atas lantai:');
  sama(d.get(6, 9), B.PAPAN);
  benar(taruhBlok(d, p, 6, 9, 'papan'), 'tempat terisi seharusnya ditolak');
  benar(taruhBlok(d, p, 3, 3, 'papan'), 'blok melayang seharusnya ditolak');
  benar(taruhBlok(d, p, 4, 9, 'papan'), 'di badan pemain seharusnya ditolak');
  benar(taruhBlok(d, p, 5, 9, 'tongkat'), 'tongkat tidak bisa ditaruh');
  sama(taruhBlok(d, p, 4, 9, 'obor'), null, 'obor tidak padat, boleh di dekat pemain:');
});

uji('Rumah kecil: dibangun di tanah rata, ditolak jika tidak muat', () => {
  const d = duniaUji();
  const p = new Pemain(20.5, 10);
  sama(taruhRumah(d, p, 10, 9), null);
  sama(d.get(10, 5), B.PAPAN, 'atap:');
  sama(d.get(10, 8), B.PINTU, 'pintu:');
  sama(d.get(11, 8), B.UDARA, 'ruang dalam:');
  benar(taruhRumah(d, p, 12, 9), 'rumah kedua yang bertumpuk seharusnya ditolak');
  const q = new Pemain(5.5, 10);
  benar(taruhRumah(duniaUji(), q, 3, 9), 'rumah yang mengurung pemain seharusnya ditolak');
});

uji('Misi bangun: persegi panjang papan dikenali', () => {
  const d = duniaUji();
  for (let x = 20; x < 24; x++) for (let y = 7; y < 10; y++) d.set(x, y, B.PAPAN);
  benar(adaPersegi(d, 22, 9, 4, 3), '4 x 3 seharusnya ditemukan');
  benar(adaPersegi(d, 22, 9, 3, 2), '3 x 2 di dalamnya juga cukup');
  benar(!adaPersegi(d, 22, 9, 5, 3), '5 x 3 seharusnya tidak ada');
  d.set(21, 8, B.UDARA);
  benar(!adaPersegi(d, 22, 9, 4, 3), 'dinding berlubang seharusnya tidak dihitung');
});

uji('Misi: soal luas, keliling, dan ejaan bernilai benar', () => {
  for (const kelas of [4, 5, 6]) {
    const misi = daftarMisi(kelas);
    sama(new Set(misi.map(m => m.id)).size, misi.length, 'id misi unik:');
    for (const m of misi.filter(x => x.jenis === 'bangun')) {
      const s = soalBangun(m, kelas);
      sama(s.jawaban, m.tanya === 'keliling' ? 2 * (m.lebar + m.tinggi) : m.lebar * m.tinggi, m.id);
    }
  }
  const e = soalEja('Meja Kerja', 4);
  benar(periksaJawaban(e, 'meja kerja'), 'ejaan benar diterima');
  benar(periksaJawaban(e, 'Meja Kerja '), 'huruf besar dan spasi di akhir diabaikan');
  benar(!periksaJawaban(e, 'meja kreja'), 'ejaan salah ditolak');
});

uji('Diff dunia: hanya perubahan yang disimpan, dan bisa dimuat ulang', () => {
  const a = new Dunia(321);
  const t = a.titikMuncul();
  const x = Math.floor(t.x);
  a.set(x, t.y, B.UDARA);
  a.set(x + 1, t.y - 1, B.PAPAN);
  a.set(x + 2, t.y - 1, B.PAPAN);
  a.set(x + 2, t.y - 1, a.asli[(t.y - 1) * LEBAR + x + 2]); // kembali seperti asli: tidak perlu disimpan
  const diff = a.dataPerubahan();
  sama(diff.length, 4, 'dua perubahan (indeks, id):');
  const b = new Dunia(321);
  b.terapkanPerubahan(JSON.parse(JSON.stringify(diff)));
  benar(a.tile.every((v, i) => v === b.tile[i]), 'dunia setelah dimuat ulang berbeda');
  b.terapkanPerubahan([-5, 3, 'x', 2, 1e9, 1]); // data rusak dilewati
  benar(a.tile.every((v, i) => v === b.tile[i]), 'data rusak mengubah dunia');
});

uji('Peti harta ada di dalam gua dan isinya masuk akal', () => {
  const d = new Dunia(12345);
  let n = 0;
  for (let i = 0; i < d.tile.length; i++) {
    if (d.tile[i] !== B.PETI) continue;
    n++;
    const x = i % LEBAR;
    const y = Math.floor(i / LEBAR);
    benar(y >= d.tanahAlami[x] + 10, 'peti terlalu dangkal');
    benar(d.padat(x, y + 1), 'peti harus di atas lantai');
  }
  benar(n >= 5, `peti terlalu sedikit: ${n}`);
  benar(isiPeti(100).some(([id]) => id === 'bijih emas'), 'peti dalam berisi emas');
  benar(!isiPeti(60).some(([id]) => id === 'bijih emas'), 'peti dangkal tanpa emas');
});

uji('Jangkauan menambang sekitar 4,5 blok', () => {
  const p = new Pemain(10.5, 20);
  benar(terjangkau(p, 12, 18), 'dekat seharusnya terjangkau');
  benar(!terjangkau(p, 20, 18), 'jauh seharusnya tidak terjangkau');
});

uji('Ikon barang: setiap barang punya gambar 12 x 12 atau blok', () => {
  for (const [id, b] of Object.entries(BARANG)) {
    if (b.blok !== undefined) continue;
    const ik = IKON_BARANG[id];
    benar(ik, `ikon ${id} tidak ada`);
    sama(ik[0].length, 12, `${id} tinggi:`);
    ik[0].forEach((baris, i) => sama(baris.length, 12, `${id} baris ${i}:`));
  }
});
