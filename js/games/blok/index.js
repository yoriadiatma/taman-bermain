// Blok Petualang — dunia 2D berbasis tile ala sandbox.
// Menambang, menaruh blok, tas, membuat barang (dengan soal hitungan), peti terkunci
// (dengan soal dari bank soal), misi belajar, Buku Barang (ejaan), dan penyimpanan diff.

import { el, pixelSvg, toast, konfirmasi } from '../../core/ui.js';
import { Dunia, LEBAR, TINGGI, LAUT, seedAcak } from './dunia.js';
import { Pemain } from './pemain.js';
import { Penggambar, terangSiang } from './render.js';
import { pasangKontrol } from './kontrol.js';
import { B, BLOK, namaBlok } from './blok.js';
import { BARANG, namaBarang } from './barang.js';
import { Inventori, HOTBAR } from './inventori.js';
import { soalResep, maksKali } from './resep.js';
import { terjangkau, infoTambang, taruhBlok, taruhRumah, adaPersegi, isiPeti } from './aksi.js';
import { daftarMisi, soalBangun, soalRumah, soalEja, xpKeLevel } from './misi.js';
import { gambarHotbar, panelTas, panelBuat, panelMisi, panelBuku, panelBantuan } from './panel.js';

const SATU_HARI = 8 * 60; // detik: satu siklus siang-malam

const ikon = pixelSvg([
  '............',
  '............',
  '.....yy.....',
  '....yyyy....',
  '.....yy.....',
  '............',
  'gggggggggggg',
  'gggggggggggg',
  'ddddddddsdd.',
  'ddsddddddddd',
  'ssssssssssss',
  'sosssssoasss',
], { y: '#ffd43b', g: '#4caf50', d: '#8b5a2b', s: '#8a8f98', o: '#1f2125', a: '#f7cf2a' }, { latar: '#74c0fc', pad: 1 });

const CATATAN_KOSONG = () => ({ ditambang: {}, dibuat: {}, ditaruh: {}, pernahAir: false, petiDibuka: 0, pernahPunya: [], dieja: [] });
const tambahHitung = (obj, k, n = 1) => { obj[k] = (obj[k] ?? 0) + n; };

let s = null;

// ---------- Bantuan kecil ----------

function posisiAman(dunia, data) {
  if (!data || !Number.isFinite(data.x) || !Number.isFinite(data.y)) return null;
  if (data.x < 1 || data.x > LEBAR - 1 || data.y < 2 || data.y > TINGGI - 2) return null;
  const p = new Pemain(data.x, data.y);
  for (let ty = Math.floor(p.y - p.tinggi); ty <= Math.floor(p.y - 1e-6); ty++) {
    if (dunia.padat(Math.floor(p.x - p.lebar / 2), ty) || dunia.padat(Math.floor(p.x + p.lebar / 2), ty)) return null;
  }
  return data;
}

function teksKetinggian(y) {
  const n = LAUT - Math.floor(y);
  if (n > 0) return `Ketinggian: ${n} blok di atas permukaan laut`;
  if (n < 0) return `Kedalaman: ${-n} blok di bawah permukaan laut`;
  return 'Tepat di permukaan laut';
}

function pesan(teks) {
  if (!s) return;
  s.el.pesan.textContent = teks;
  clearTimeout(s.tundaPesan);
  s.tundaPesan = setTimeout(() => { if (s) s.el.pesan.textContent = ''; }, 3500);
}

const dipegang = () => s.inv.kotak[s.pilihan]?.id ?? null;

function tambahXp(n) {
  const sebelum = xpKeLevel(s.xp);
  s.xp += n;
  if (xpKeLevel(s.xp) > sebelum) {
    s.ctx.audio.main('levelup');
    toast(`MasyaAllah! Kamu naik ke Level ${xpKeLevel(s.xp)}!`, 'sukses', 3000);
  }
  perbaruiHud();
}

/** Masukkan barang ke tas; catat barang baru untuk Buku Barang. */
function dapat(id, n = 1) {
  const sisa = s.inv.tambah(id, n);
  if (sisa > 0) pesan(`Tas penuh! ${sisa} ${namaBarang(id)} tidak terbawa.`);
  if (!s.catatan.pernahPunya.includes(id)) {
    s.catatan.pernahPunya.push(id);
    toast(`Barang baru: ${namaBarang(id)}! Eja namanya di 📖 Buku Barang.`, 'info', 3000);
  }
  perbaruiTas();
}

function perbaruiTas() {
  gambarHotbar(s);
  if (s.panel === 'tas') bukaPanel('tas');
}

function perbaruiHud() {
  if (!s) return;
  const { pemain, dunia, el: e } = s;
  e.waktu.textContent = terangSiang(s.waktu) > 0.5 ? '☀️ Siang' : '🌙 Malam';
  e.posisi.textContent = teksKetinggian(pemain.y);
  e.level.textContent = `⭐ Level ${xpKeLevel(s.xp)} · ${s.xp} XP`;
  if (e.fps) e.fps.textContent = `${s.fps} FPS`;
  const kaki = dunia.get(Math.floor(pemain.x), Math.floor(pemain.y));
  e.pijakan.textContent = pemain.diAir ? 'Sedang berenang' : pemain.diTanah ? `Berdiri di atas: ${namaBlok(kaki)}` : '';
  e.mode.textContent = s.mode === 'tambang' ? '⛏ Mode: Tambang' : '🧱 Mode: Taruh';
  e.mode.setAttribute('aria-pressed', String(s.mode === 'taruh'));
}

// ---------- Panel ----------

const PANEL = { tas: panelTas, buat: panelBuat, misi: panelMisi, buku: panelBuku, bantuan: panelBantuan };

function bukaPanel(nama) {
  s.panel = nama;
  s.el.panel.replaceChildren(PANEL[nama](s));
  s.el.panel.hidden = false;
}

function tutupPanel() {
  if (!s) return;
  s.panel = null;
  s.el.panel.hidden = true;
  s.el.panel.replaceChildren();
  if (!s.ctx.store.get('bantuanDilihat')) s.ctx.store.set('bantuanDilihat', true);
}

const alihPanel = nama => (s.panel === nama ? tutupPanel() : bukaPanel(nama));

// ---------- Menambang & menaruh ----------

function hancurkan(x, y, id) {
  s.dunia.set(x, y, B.UDARA);
  const hasil = BLOK[id].hasil;
  if (hasil) {
    dapat(hasil, 1);
    tambahHitung(s.catatan.ditambang, hasil);
  }
  s.ctx.audio.main('klik');
  s.progres = 0;
}

async function bukaPeti(x, y) {
  if (s.sibuk) return;
  s.sibuk = true;
  s.menambang = false;
  const hasil = await s.ctx.quiz.tanya({ judul: '🔒 Peti terkunci! Jawab soal ini untuk membukanya.' });
  if (!s) return;
  s.sibuk = false;
  if (!hasil.benar && hasil.soal) {
    pesan('Peti masih terkunci. Coba lagi nanti ya!');
    return;
  }
  s.dunia.set(x, y, B.UDARA);
  const isi = isiPeti(y);
  for (const [id, n] of isi) dapat(id, n);
  s.catatan.petiDibuka++;
  tambahXp(hasil.benarPertama ? 15 : 8);
  toast(`Peti terbuka! Isinya: ${isi.map(([id, n]) => `${n} ${namaBarang(id)}`).join(', ')}.`, 'sukses', 4000);
  periksaMisiSiap();
}

function taruh(x, y) {
  const id = dipegang();
  if (!id) return pesan('Pilih barang di hotbar dulu.');
  if (!terjangkau(s.pemain, x, y)) return pesan('Terlalu jauh. Mendekatlah dulu.');
  const barang = BARANG[id];
  let galat;
  if (barang?.bangunan) galat = taruhRumah(s.dunia, s.pemain, x, y);
  else if (barang?.blok !== undefined) galat = taruhBlok(s.dunia, s.pemain, x, y, id);
  else galat = `${namaBarang(id)} tidak bisa ditaruh. Barang ini dipakai untuk membuat barang lain.`;
  if (galat) return pesan(galat);
  s.inv.pakai(s.pilihan);
  tambahHitung(s.catatan.ditaruh, id);
  s.ctx.audio.main('klik');
  perbaruiTas();
  periksaMisiSiap();
}

function tileDari(e) {
  const r = s.el.kanvas.getBoundingClientRect();
  const p = s.penggambar.keDunia(e.clientX - r.left, e.clientY - r.top, s.kamera);
  return { x: Math.floor(p.x), y: Math.floor(p.y) };
}

function saatTekan(e) {
  e.preventDefault();
  if (s.sibuk) return;
  const t = tileDari(e);
  s.tunjuk = t;
  try { s.el.kanvas.setPointerCapture(e.pointerId); } catch { /* tidak masalah */ }
  const id = s.dunia.get(t.x, t.y);
  if (id === B.PETI && terjangkau(s.pemain, t.x, t.y)) {
    bukaPeti(t.x, t.y);
    return;
  }
  if (e.button === 2 || s.mode === 'taruh') {
    taruh(t.x, t.y);
    return;
  }
  if (!terjangkau(s.pemain, t.x, t.y)) {
    if (id !== B.UDARA) pesan('Terlalu jauh. Mendekatlah dulu.');
    return;
  }
  s.menambang = true;
  s.progres = 0;
}

function saatGeser(e) {
  const t = tileDari(e);
  if (!s.tunjuk || t.x !== s.tunjuk.x || t.y !== s.tunjuk.y) {
    s.tunjuk = t;
    s.progres = 0;
  }
}

function saatLepas() {
  s.menambang = false;
  s.progres = 0;
}

function lanjutTambang(dt) {
  if (!s.menambang || !s.tunjuk) return;
  const { x, y } = s.tunjuk;
  const id = s.dunia.get(x, y);
  if (id === B.UDARA || id === B.AIR || !terjangkau(s.pemain, x, y)) { s.progres = 0; return; }
  const info = infoTambang(id, dipegang());
  if (!info.bisa) {
    pesan(info.alasan);
    s.menambang = false;
    return;
  }
  s.progres += dt / info.detik;
  if (s.progres >= 1) hancurkan(x, y, id);
}

// ---------- Membuat barang ----------

function dekatStasiun(jenis) {
  const id = jenis === 'meja' ? B.MEJA_KERJA : B.TUNGKU;
  return s.dunia.adaDekat(Math.floor(s.pemain.x), Math.floor(s.pemain.y - 1), id, 4);
}

async function buat(resep, kali) {
  const total = resep.jumlah * kali;
  if (s.inv.muat(resep.hasil) < total) return pesan('Tas penuh. Kosongkan beberapa kotak dulu.');
  const soal = soalResep(resep, kali, s.ctx.kelas, id => namaBarang(id).toLowerCase());
  const hasil = await s.ctx.quiz.tanya({ soal, judul: `Membuat ${namaBarang(resep.hasil)}` });
  if (!s) return;
  if (!hasil.benar) return pesan('Barang belum jadi. Coba hitung lagi ya!');
  if (maksKali(resep, s.inv) < kali || (resep.stasiun && !dekatStasiun(resep.stasiun))) return pesan('Bahan atau tempat kerja tidak lagi cukup.');
  for (const [id, n] of resep.bahan) s.inv.ambil(id, n * kali);
  dapat(resep.hasil, total);
  tambahHitung(s.catatan.dibuat, resep.hasil, total);
  tambahXp(hasil.benarPertama ? 5 : 2);
  toast(`Jadi: ${total} ${namaBarang(resep.hasil)}!`, 'sukses', 2000);
  periksaMisiSiap();
}

// ---------- Misi & Buku Barang ----------

function statusMisi(m) {
  if (s.dataMisi[m.id] === 'selesai') return 'selesai';
  if (m.jenis === 'bangun') return 'aktif';
  return m.cek(s.catatan) ? 'siap' : 'belum';
}

/** Beri tahu anak jika ada misi yang siap diselesaikan (digabung menjadi satu pemberitahuan). */
function periksaMisiSiap() {
  const baru = s.misi.filter(m => statusMisi(m) === 'siap' && !s.diberitahu.has(m.id));
  if (!baru.length) return;
  baru.forEach(m => s.diberitahu.add(m.id));
  toast(baru.length === 1
    ? `Misi "${baru[0].judul}" siap diselesaikan! Buka 📜 Misi.`
    : `${baru.length} misi siap diselesaikan! Buka 📜 Misi.`, 'sukses', 3500);
}

function tandaiMisiSelesai(m) {
  s.dataMisi[m.id] = 'selesai';
  for (const [id, n] of m.hadiah ?? []) dapat(id, n);
  tambahXp(m.xp);
  s.ctx.audio.main('levelup');
  toast(`Alhamdulillah, misi "${m.judul}" selesai! +${m.xp} XP`, 'sukses', 3500);
}

async function selesaikanMisi(m) {
  if (statusMisi(m) !== 'siap') return;
  const opsi = m.jenis === 'rumah' ? { soal: soalRumah(s.ctx.kelas) } : m.soal;
  if (opsi) {
    const hasil = await s.ctx.quiz.tanya({ ...opsi, judul: `Misi: ${m.judul}` });
    if (!s) return;
    if (hasil.soal && !hasil.benar) return pesan('Hampir! Coba selesaikan misinya lagi nanti.');
  }
  tandaiMisiSelesai(m);
}

async function mulaiBangun(m) {
  const hasil = await s.ctx.quiz.tanya({ soal: soalBangun(m, s.ctx.kelas), judul: `Misi: ${m.judul}` });
  if (!s || !hasil.benar) return;
  s.dataMisi[m.id] = 'dijawab';
  toast(`Sekarang bangun dinding papan ${m.lebar} × ${m.tinggi}, lalu tekan "Periksa bangunan".`, 'info', 4000);
}

async function periksaBangunan(m) {
  if (adaPersegi(s.dunia, Math.floor(s.pemain.x), Math.floor(s.pemain.y - 1), m.lebar, m.tinggi)) tandaiMisiSelesai(m);
  else pesan(`Belum ada dinding papan penuh ${m.lebar} × ${m.tinggi} blok di dekatmu.`);
}

async function eja(id) {
  const hasil = await s.ctx.quiz.tanya({ soal: soalEja(namaBarang(id), s.ctx.kelas), judul: '📖 Buku Barang' });
  if (!s || !hasil.benar) return;
  if (!s.catatan.dieja.includes(id)) s.catatan.dieja.push(id);
  tambahXp(5);
}

// ---------- Putaran permainan ----------

function putaran(sekarang) {
  if (!s) return;
  const dt = Math.min(0.1, (sekarang - s.waktuTerakhir) / 1000 || 0);
  s.waktuTerakhir = sekarang;
  const { pemain, dunia, penggambar } = s;

  pemain.perbarui(dt, s.kontrol.input, dunia);
  if (pemain.diAir && !s.catatan.pernahAir) {
    s.catatan.pernahAir = true;
    periksaMisiSiap();
  }
  lanjutTambang(dt);
  s.waktu = (s.waktu + dt / SATU_HARI) % 1;

  const lt = penggambar.lebarTile;
  const tt = penggambar.tinggiTile;
  const tx = Math.max(0, Math.min(LEBAR - lt, pemain.x - lt / 2));
  const ty = Math.max(0, Math.min(TINGGI - tt, pemain.y - 1 - tt / 2));
  const k = 1 - Math.pow(0.001, dt);
  s.kamera.x += (tx - s.kamera.x) * k;
  s.kamera.y += (ty - s.kamera.y) * k;

  const sorot = s.tunjuk ? { ...s.tunjuk, jangkau: terjangkau(pemain, s.tunjuk.x, s.tunjuk.y) } : null;
  const retak = s.menambang && s.tunjuk ? { ...s.tunjuk, progres: s.progres } : null;
  penggambar.gambar({ dunia, pemain, kamera: s.kamera, waktu: s.waktu, sorot, retak });

  s.bingkai++;
  if (sekarang - s.hudTerakhir > 250) {
    s.fps = Math.round((s.bingkai * 1000) / (sekarang - s.hudTerakhir));
    s.bingkai = 0;
    s.hudTerakhir = sekarang;
    perbaruiHud();
  }
  s.rafId = requestAnimationFrame(putaran);
}

function simpan() {
  if (!s) return;
  const st = s.ctx.store;
  st.set('pemain', { x: +s.pemain.x.toFixed(3), y: +s.pemain.y.toFixed(3) });
  st.set('waktu', +s.waktu.toFixed(4));
  st.set('karakter', s.karakter);
  st.set('perubahan', s.dunia.dataPerubahan());
  st.set('inventori', s.inv.data());
  st.set('pilihan', s.pilihan);
  st.set('catatan', s.catatan);
  st.set('misi', s.dataMisi);
  st.set('xp', s.xp);
}

function tombolPapanKetik(e) {
  if (document.querySelector('.modal-latar') || /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName ?? '')) return;
  if (/^Digit[1-9]$/.test(e.code)) { s.pilihKotak(Number(e.code.slice(5)) - 1); return; }
  if (e.code === 'KeyE') alihPanel('tas');
  if (e.code === 'Escape' && s.panel) tutupPanel();
}

const definisi = {
  id: 'blok',
  nama: 'Blok Petualang',
  deskripsi: 'Tambang, bangun, dan buat barang di dunia blok. Hitung bahan, buka peti dengan soal, selesaikan misi.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: ['matematika', 'ipa', 'bahasa'],
  css: 'css/blok.css',

  mount(container, ctx) {
    const store = ctx.store;
    let data = store.get('dunia');
    if (!data || !Number.isInteger(data.seed)) {
      data = { v: 1, seed: seedAcak() };
      store.set('dunia', data);
    }
    const dunia = new Dunia(data.seed);
    dunia.terapkanPerubahan(store.get('perubahan', []));
    const pos = posisiAman(dunia, store.get('pemain')) ?? dunia.titikMuncul();
    const karakter = store.get('karakter') ?? (ctx.profil.avatar === 'jilbab' ? 'jilbab' : 'peci');
    const debug = /[?&]debug\b/.test(location.search);

    const kanvas = el('canvas', { class: 'blok-kanvas', 'aria-label': 'Dunia Blok Petualang. Tahan klik untuk menambang, klik kanan untuk menaruh.' });
    const kontrol = pasangKontrol();
    const e = {
      kanvas,
      waktu: el('span', {}),
      posisi: el('span', {}),
      level: el('span', {}),
      pijakan: el('span', {}),
      fps: debug ? el('span', {}) : null,
      pesan: el('p', { class: 'blok-pesan', 'aria-live': 'polite' }),
      hotbar: el('div', { class: 'blok-hotbar', role: 'group', 'aria-label': 'Hotbar' }),
      panel: el('div', { class: 'blok-panel panel', hidden: true }),
      mode: el('button', { class: 'tombol kedua kecil blok-mode', type: 'button', onclick: () => { s.mode = s.mode === 'tambang' ? 'taruh' : 'tambang'; perbaruiHud(); } }),
    };
    const tombol = (label, teks, onclick) => el('button', { class: 'tombol kedua kecil', type: 'button', 'aria-label': label, title: label, onclick }, teks);

    const bingkai = el('div', { class: 'blok' },
      kanvas,
      el('div', { class: 'blok-hud' }, e.waktu, e.level, e.posisi, e.pijakan, e.fps),
      el('div', { class: 'blok-tombol-atas' },
        e.mode,
        tombol('Tas (E)', '🎒', () => alihPanel('tas')),
        tombol('Buat barang', '🔨', () => alihPanel('buat')),
        tombol('Misi', '📜', () => alihPanel('misi')),
        tombol('Buku Barang', '📖', () => alihPanel('buku')),
        tombol('Bantuan', '?', () => alihPanel('bantuan'))),
      e.pesan,
      e.hotbar,
      kontrol.elemenSentuh,
      e.panel);
    container.append(bingkai);

    const penggambar = new Penggambar(kanvas);
    penggambar.setKarakter(karakter);
    const amati = new ResizeObserver(([entri]) => penggambar.ukur(entri.contentRect.width, entri.contentRect.height));
    amati.observe(bingkai);
    const r = bingkai.getBoundingClientRect();
    penggambar.ukur(r.width, r.height);

    const pemain = new Pemain(pos.x, pos.y);
    s = {
      ctx, container, dunia, pemain, penggambar, kontrol, karakter, amati, el: e,
      atlas: penggambar.atlas,
      inv: new Inventori(store.get('inventori')),
      pilihan: Math.min(HOTBAR - 1, Math.max(0, store.get('pilihan', 0) | 0)),
      catatan: { ...CATATAN_KOSONG(), ...store.get('catatan', {}) },
      dataMisi: store.get('misi', {}),
      xp: store.get('xp', 0),
      misi: daftarMisi(ctx.kelas),
      diberitahu: new Set(),
      mode: 'tambang',
      panel: null,
      tunjuk: null,
      menambang: false,
      progres: 0,
      sibuk: false,
      waktu: store.get('waktu', 0.05),
      kamera: {
        x: Math.max(0, Math.min(LEBAR - penggambar.lebarTile, pemain.x - penggambar.lebarTile / 2)),
        y: Math.max(0, Math.min(TINGGI - penggambar.tinggiTile, pemain.y - 1 - penggambar.tinggiTile / 2)),
      },
      waktuTerakhir: performance.now(),
      hudTerakhir: performance.now(),
      bingkai: 0,
      fps: 0,
      rafId: 0,
      // Fungsi untuk panel.js
      pilihKotak(i) { s.pilihan = i; gambarHotbar(s); pesan(s.inv.kotak[i] ? namaBarang(s.inv.kotak[i].id) : `Kotak ${i + 1} kosong`); },
      tutupPanel,
      perbaruiTas,
      dekatStasiun,
      buat,
      statusMisi,
      selesaikanMisi,
      mulaiBangun,
      periksaBangunan,
      eja,
      gantiKarakter() {
        s.karakter = s.karakter === 'peci' ? 'jilbab' : 'peci';
        s.penggambar.setKarakter(s.karakter);
      },
      async duniaBaru() {
        if (!(await konfirmasi('Dunia, bangunan, dan isi tasmu akan diganti dengan yang baru. XP dan misi yang selesai tetap ada.', { judul: 'Buat dunia baru?', ya: 'Buat dunia baru', bahaya: true }))) return;
        if (!s) return;
        const { ctx: c, container: wadah } = s;
        c.store.set('dunia', { v: 1, seed: seedAcak() });
        for (const k of ['perubahan', 'pemain', 'inventori']) c.store.remove(k);
        lepasGame();
        wadah.replaceChildren();
        definisi.mount(wadah, c);
      },
    };
    if (s.catatan.pernahPunya.length === 0) {
      for (const k of s.inv.kotak) if (k && !s.catatan.pernahPunya.includes(k.id)) s.catatan.pernahPunya.push(k.id);
    }

    kanvas.addEventListener('pointerdown', saatTekan);
    kanvas.addEventListener('pointermove', saatGeser);
    kanvas.addEventListener('pointerup', saatLepas);
    kanvas.addEventListener('pointercancel', saatLepas);
    kanvas.addEventListener('pointerleave', () => { if (s && !s.menambang) s.tunjuk = null; });
    kanvas.addEventListener('contextmenu', ev => ev.preventDefault());
    kanvas.addEventListener('wheel', ev => {
      ev.preventDefault();
      s.pilihKotak((s.pilihan + (ev.deltaY > 0 ? 1 : HOTBAR - 1)) % HOTBAR);
    }, { passive: false });
    window.addEventListener('keydown', tombolPapanKetik);

    // Untuk memeriksa keadaan game dari konsol (?debug di URL).
    if (debug) window.__blok = Object.assign(s, { _lanjutTambang: lanjutTambang });
    gambarHotbar(s);
    perbaruiHud();
    if (!store.get('bantuanDilihat')) bukaPanel('bantuan');
    periksaMisiSiap();
    s.rafId = requestAnimationFrame(putaran);
  },

  unmount() {
    lepasGame(); // simpan() sudah dipanggil layar permainan sebelum unmount
  },

  simpan,

  progres(store, profil) {
    if (!store.get('dunia')) return { bintang: 0, teks: 'Belum pernah main' };
    const misi = daftarMisi(profil.kelas);
    const data = store.get('misi', {});
    const selesai = misi.filter(m => data[m.id] === 'selesai').length;
    const bintang = selesai >= misi.length ? 3 : selesai >= 6 ? 2 : selesai >= 3 ? 1 : 0;
    return { bintang, teks: `Level ${xpKeLevel(store.get('xp', 0))} · Misi ${selesai}/${misi.length}` };
  },
};

export default definisi;

function lepasGame() {
  if (!s) return;
  cancelAnimationFrame(s.rafId);
  clearTimeout(s.tundaPesan);
  s.kontrol.lepas();
  s.amati.disconnect();
  window.removeEventListener('keydown', tombolPapanKetik);
  s = null;
}
