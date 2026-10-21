// Jelajah Nusantara — berlayar ke tiap wilayah, kenali provinsi, ibu kota, budaya, dan sejarah Islam Nusantara.
// Kelas 4: provinsi & ibu kota. Kelas 5: + rumah adat & budaya. Kelas 6: + sejarah Islam Nusantara.

import { el, isiUlang, pixelSvg, toast, modal, konfirmasi, pujian, bintang } from '../../core/ui.js';
import { PROVINSI, WILAYAH, JENIS_BUDAYA, JENIS_ISLAM, provinsi } from '../../../data/nusantara.js';
import { PULAU, TETANGGA, TAMPILAN, LEBAR, TINGGI, proyeksi, jalurSvg, kotakTampilan, batasiTampilan } from './peta.js';
import { buatMisi, hitungBintang, provinsiWilayah, JUMLAH_MISI } from './misi.js';

const ikon = pixelSvg([
  '............',
  '..gg........',
  '.gggg...yy..',
  '.ggggg.yyyy.',
  '..ggg...yy..',
  '............',
  '....pppp....',
  '...pppppp...',
  '.....pp..rr.',
  '........rrr.',
  '.........r..',
  '............',
], { g: '#2f9e44', y: '#f59f00', p: '#9c36b5', r: '#e03131' }, { latar: '#a5d8ff', pad: 1 });

const NS = 'http://www.w3.org/2000/svg';
const WILAYAH_ID = Object.keys(WILAYAH);
const MAKS_PERCOBAAN = 3;
const BATAS_NAMA = 420; // nama provinsi tampil jika lebar tampilan (satuan peta) sekecil ini
const LABEL_WILAYAH = {
  sumatra: [99.0, -2.6], jawa: [109.6, -9.1], nusa: [119.0, -10.95], kalimantan: [113.0, 0.4],
  sulawesi: [122.4, -6.7], maluku: [130.0, -5.5], papua: [138.6, -0.9],
};

let s = null;

function svg(tag, attr = {}, ...anak) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attr)) if (v != null) e.setAttribute(k, v);
  for (const a of anak.flat()) if (a != null) e.append(a);
  return e;
}

/** Pixel art di dalam SVG peta (kapal), bukan string. */
function gridSvg(grid, palet) {
  const g = svg('g');
  grid.forEach((baris, y) => [...baris].forEach((c, x) => {
    if (palet[c]) g.append(svg('rect', { x, y, width: 1.02, height: 1.02, fill: palet[c] }));
  }));
  return g;
}

const KAPAL = [
  '.....m......',
  '.....mw.....',
  '.....mww....',
  '.....mwww...',
  '.....mwwww..',
  '.....m......',
  'bbbbbbbbbbbb',
  '.bbbbbbbbbb.',
  '..bbbbbbbb..',
];

const dataKosong = () => ({ v: 1, stempel: {}, bintang: {}, ronde: 0 });
function rapikan(d) {
  const x = { ...dataKosong(), ...(d && typeof d === 'object' ? d : {}) };
  x.stempel = { ...(x.stempel ?? {}) };
  x.bintang = { ...(x.bintang ?? {}) };
  return x;
}

const jumlahStempel = d => PROVINSI.filter(p => d.stempel[p.id]).length;
const stempelWilayah = (d, w) => provinsiWilayah(w).filter(p => d.stempel[p.id]).length;

function simpan() {
  if (s) s.ctx.store.set('jelajah', s.d);
}

// ---------- Peta ----------

function buatPeta() {
  const sea = svg('pattern', { id: 'jn-ombak', width: 24, height: 12, patternUnits: 'userSpaceOnUse' },
    svg('rect', { width: 24, height: 12, fill: '#a5d8ff' }),
    svg('path', { d: 'M2 8 q3 -3 6 0 q3 3 6 0', fill: 'none', stroke: '#74c0fc', 'stroke-width': 1 }));
  const yKhatulistiwa = proyeksi([0, 0])[1];
  const peta = svg('svg', { class: 'jn-peta', xmlns: NS, role: 'group', 'aria-label': 'Peta sederhana Indonesia. Ketuk pin untuk memilih provinsi.' },
    svg('defs', {}, sea),
    svg('rect', { x: -600, y: -600, width: LEBAR + 1200, height: TINGGI + 1200, fill: 'url(#jn-ombak)' }),
    svg('g', { class: 'jn-tetangga', 'aria-hidden': 'true' }, TETANGGA.map(t => svg('path', { d: jalurSvg(t.titik) }))),
    svg('line', { class: 'jn-khatulistiwa', x1: -600, x2: LEBAR + 600, y1: yKhatulistiwa, y2: yKhatulistiwa, 'aria-hidden': 'true' }),
    svg('g', { class: 'jn-pulau', 'aria-hidden': 'true' }, PULAU.map(p => svg('path', {
      d: jalurSvg(p.titik), fill: WILAYAH[p.wilayah].warna, stroke: WILAYAH[p.wilayah].garis, 'data-wilayah': p.wilayah,
    }))));
  // Label yang ukurannya tetap di layar (diskalakan ulang setiap tampilan berubah).
  const label = [];
  const tambahLabel = (pos, teks, kelas) => {
    const [x, y] = proyeksi(pos);
    const g = svg('g', { class: kelas, 'aria-hidden': 'true' }, svg('text', { 'text-anchor': 'middle' }, teks));
    label.push({ g, x, y });
    return g;
  };
  const gLabel = svg('g', {},
    TETANGGA.map(t => tambahLabel(t.label, t.nama, 'jn-label-negara')),
    WILAYAH_ID.map(w => tambahLabel(LABEL_WILAYAH[w], WILAYAH[w].nama.toUpperCase(), 'jn-label-wilayah')));
  // Label khatulistiwa di laut utara Papua (tidak menutupi pulau).
  const [xk] = proyeksi([131.8, 0]);
  const khatulistiwa = svg('g', { class: 'jn-label-khatulistiwa', 'aria-hidden': 'true' }, svg('text', { y: -4 }, 'Khatulistiwa 0°'));
  label.push({ g: khatulistiwa, x: xk, y: yKhatulistiwa });

  const pin = new Map();
  const gPin = svg('g', { class: 'jn-pin-lapis' });
  for (const p of PROVINSI) {
    const [x, y] = proyeksi(p.pos);
    const posLabel = { atas: [0, -11, 'middle'], bawah: [0, 19, 'middle'], kiri: [-10, 4, 'end'], kanan: [10, 4, 'start'] }[p.label ?? 'bawah'];
    const g = svg('g', { class: 'jn-pin', tabindex: 0, role: 'button', 'data-prov': p.id, 'aria-label': p.nama },
      svg('circle', { class: 'jn-pin-hit', r: 15 }),
      svg('circle', { class: 'jn-pin-cincin', r: 11 }),
      svg('circle', { class: 'jn-pin-titik', r: 6 }),
      svg('text', { class: 'jn-pin-nama', x: posLabel[0], y: posLabel[1], 'text-anchor': posLabel[2] }, p.nama));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ketukPin(p.id); }
    });
    gPin.append(g);
    pin.set(p.id, { g, x, y });
  }
  const kapal = svg('g', { class: 'jn-kapal', 'aria-hidden': 'true' },
    svg('g', { class: 'jn-kapal-goyang' }, gridSvg(KAPAL, { m: '#6b4226', w: '#fff', b: '#c92a2a' })));
  peta.append(gLabel, khatulistiwa, gPin, kapal);
  return { peta, pin, label, kapal };
}

/** Skala: satuan peta per piksel layar. */
const skala = () => s.v.w / (s.lebarPx || 800);

function terapkanTampilan() {
  const v = s.v;
  const e = s.el;
  e.peta.setAttribute('viewBox', `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`);
  const k = skala();
  const kPin = v.w > BATAS_NAMA * 1.4 ? k * 0.75 : k;
  for (const { g, x, y } of s.pin.values()) g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${kPin.toFixed(4)})`);
  for (const l of s.label) l.g.setAttribute('transform', `translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) scale(${k.toFixed(4)})`);
  const [kx, ky] = s.kapalPos;
  s.kapal.setAttribute('transform', `translate(${kx.toFixed(2)} ${ky.toFixed(2)}) scale(${(k * 2.6).toFixed(4)}) translate(-6 -9)`);
  e.peta.classList.toggle('tampil-nama', v.w <= BATAS_NAMA && s.mode !== 'misi');
  e.peta.classList.toggle('ikhtisar', v.w > BATAS_NAMA * 1.4);
}

const mulus = t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Geser tampilan (dan kapal) dengan animasi. */
function animasiKe(target, kapalKe = null, durasi = 650) {
  cancelAnimationFrame(s.anim);
  const dari = { ...s.v };
  const kapalDari = [...s.kapalPos];
  const kurangGerak = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const mulai = performance.now();
  const langkah = now => {
    if (!s) return;
    const t = kurangGerak ? 1 : Math.min(1, (now - mulai) / durasi);
    const m = mulus(t);
    s.v = { x: dari.x + (target.x - dari.x) * m, y: dari.y + (target.y - dari.y) * m, w: dari.w + (target.w - dari.w) * m, h: dari.h + (target.h - dari.h) * m };
    if (kapalKe) s.kapalPos = [kapalDari[0] + (kapalKe[0] - kapalDari[0]) * m, kapalDari[1] + (kapalKe[1] - kapalDari[1]) * m];
    terapkanTampilan();
    if (t < 1) s.anim = requestAnimationFrame(langkah);
  };
  s.anim = requestAnimationFrame(langkah);
}

/** Pindah ke wilayah (atau 'indonesia'): kapal berlayar dan peta diperbesar. */
function berlayar(id) {
  const t = TAMPILAN[id] ?? TAMPILAN.indonesia;
  animasiKe(kotakTampilan(id, s.rasio), proyeksi(t.kapal));
}

function perbesar(f, sx = s.lebarPx / 2, sy = s.tinggiPx / 2) {
  const v = s.v;
  const ux = v.x + (sx / s.lebarPx) * v.w;
  const uy = v.y + (sy / s.tinggiPx) * v.h;
  const w = v.w / f;
  const h = v.h / f;
  s.v = batasiTampilan({ x: ux - (sx / s.lebarPx) * w, y: uy - (sy / s.tinggiPx) * h, w, h }, s.rasio);
  terapkanTampilan();
}

function ukurPeta() {
  const r = s.el.peta.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const rasioBaru = r.width / r.height;
  s.lebarPx = r.width;
  s.tinggiPx = r.height;
  if (Math.abs(rasioBaru - s.rasio) > 0.001) {
    // Pertahankan titik tengah dan lebar tampilan.
    const cx = s.v.x + s.v.w / 2;
    const cy = s.v.y + s.v.h / 2;
    s.rasio = rasioBaru;
    s.v = batasiTampilan({ x: cx - s.v.w / 2, y: cy - s.v.w / rasioBaru / 2, w: s.v.w, h: s.v.w / rasioBaru }, s.rasio);
  }
  terapkanTampilan();
}

/** Pin terlihat yang paling dekat dengan titik layar (maks. 26 px), agar pin yang berdekatan tetap mudah diketuk. */
function pinTerdekat(cx, cy) {
  const r = s.el.peta.getBoundingClientRect();
  const k = skala();
  const ux = s.v.x + (cx - r.left) * k;
  const uy = s.v.y + (cy - r.top) * k;
  let terbaik = null;
  let jarak = 26 * k;
  for (const [id, { g, x, y }] of s.pin) {
    if (g.classList.contains('luar')) continue;
    const d = Math.hypot(x - ux, y - uy);
    if (d < jarak) { jarak = d; terbaik = id; }
  }
  return terbaik;
}

function pasangGeser(peta) {
  const jari = new Map();
  let awal = null;
  peta.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    jari.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { peta.setPointerCapture(e.pointerId); } catch { /* event sintetis */ }
    awal = { v: { ...s.v }, titik: new Map([...jari].map(([k, p]) => [k, { ...p }])), pin: jari.size === 1 ? pinTerdekat(e.clientX, e.clientY) : null, geser: false };
  });
  peta.addEventListener('pointermove', e => {
    if (!jari.has(e.pointerId) || !awal) return;
    jari.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = peta.getBoundingClientRect();
    if (jari.size === 1) {
      const a = awal.titik.get(e.pointerId);
      if (!a) return;
      const dx = e.clientX - a.x;
      const dy = e.clientY - a.y;
      if (!awal.geser && Math.hypot(dx, dy) < 8) return;
      awal.geser = true;
      cancelAnimationFrame(s.anim);
      const k = awal.v.w / r.width;
      s.v = batasiTampilan({ ...awal.v, x: awal.v.x - dx * k, y: awal.v.y - dy * k }, s.rasio);
      terapkanTampilan();
    } else if (jari.size === 2) {
      const [p1, p2] = [...jari.values()];
      const ids = [...jari.keys()];
      const a1 = awal.titik.get(ids[0]);
      const a2 = awal.titik.get(ids[1]);
      if (!a1 || !a2) { awal = { v: { ...s.v }, titik: new Map([...jari].map(([k, p]) => [k, { ...p }])), pin: null, geser: true }; return; }
      awal.geser = true;
      cancelAnimationFrame(s.anim);
      const f = Math.hypot(p1.x - p2.x, p1.y - p2.y) / Math.max(1, Math.hypot(a1.x - a2.x, a1.y - a2.y));
      const mx = (a1.x + a2.x) / 2 - r.left;
      const my = (a1.y + a2.y) / 2 - r.top;
      const ux = awal.v.x + (mx / r.width) * awal.v.w;
      const uy = awal.v.y + (my / r.height) * awal.v.h;
      const w = awal.v.w / f;
      const h = awal.v.h / f;
      const nx = (p1.x + p2.x) / 2 - r.left;
      const ny = (p1.y + p2.y) / 2 - r.top;
      s.v = batasiTampilan({ x: ux - (nx / r.width) * w, y: uy - (ny / r.height) * h, w, h }, s.rasio);
      terapkanTampilan();
    }
  });
  const lepas = e => {
    if (!jari.has(e.pointerId)) return;
    jari.delete(e.pointerId);
    if (awal && !awal.geser && awal.pin && e.type === 'pointerup') ketukPin(awal.pin);
    // Sisa satu jari setelah mencubit: mulai geser baru dari posisi sekarang.
    awal = jari.size ? { v: { ...s.v }, titik: new Map([...jari].map(([k, p]) => [k, { ...p }])), pin: null, geser: true } : null;
  };
  peta.addEventListener('pointerup', lepas);
  peta.addEventListener('pointercancel', lepas);
  // Gulir biasa tetap menggulir halaman; Ctrl + gulir (atau cubit di touchpad) memperbesar peta.
  peta.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = peta.getBoundingClientRect();
    cancelAnimationFrame(s.anim);
    perbesar(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
}

function perbaruiPin() {
  const m = s.misi;
  for (const [id, { g }] of s.pin) {
    const p = provinsi(id);
    const luar = s.mode === 'misi' && p.wilayah !== s.wilayah;
    g.classList.toggle('luar', luar);
    g.classList.toggle('stempel', !!s.d.stempel[id]);
    g.classList.toggle('terpilih', s.mode === 'jelajah' && s.pilih === id);
    g.classList.toggle('salah', !!m?.salah.has(id));
    g.classList.toggle('sorot', s.sorot === id);
    g.setAttribute('aria-label', `${p.nama}${s.d.stempel[id] ? ', sudah dapat stempel' : ''}`);
    if (luar) g.setAttribute('tabindex', '-1'); else g.setAttribute('tabindex', '0');
  }
}

// ---------- Panel ----------

function render() {
  const e = s.el;
  e.akar.classList.toggle('misi', s.mode === 'misi');
  const n = jumlahStempel(s.d);
  const totalBintang = WILAYAH_ID.reduce((a, w) => a + (s.d.bintang[w] ?? 0), 0);
  isiUlang(e.bilah,
    el('span', { class: 'jn-info' }, `📮 Stempel ${n}/${PROVINSI.length}`),
    el('span', { class: 'jn-info' }, `⭐ ${totalBintang}/${WILAYAH_ID.length * 3}`),
    el('button', { type: 'button', class: 'tombol kedua kecil', onclick: bukaPaspor }, '📘 Paspor'));

  const dalamMisi = s.mode === 'misi';
  isiUlang(e.wilayah, ['indonesia', ...WILAYAH_ID].map(w => el('button', {
    type: 'button', class: 'tombol kedua kecil', disabled: dalamMisi,
    'aria-pressed': String((s.wilayah ?? 'indonesia') === w),
    onclick: () => pilihWilayah(w === 'indonesia' ? null : w),
  }, w === 'indonesia' ? '🗺️ Indonesia' : `${WILAYAH[w].nama}${s.d.bintang[w] ? ` ${'★'.repeat(s.d.bintang[w])}` : ''}`)));

  isiUlang(e.panel, { jelajah: panelJelajah, misi: panelMisi, hasil: panelHasil }[s.mode]());
  perbaruiPin();
  terapkanTampilan();
}

function panelJelajah() {
  if (s.pilih) return kartuProvinsi(provinsi(s.pilih));
  if (!s.wilayah) {
    return el('div', {},
      el('h2', {}, `Assalamu'alaikum, ${s.ctx.profil.nama}!`),
      el('p', {}, 'Ayo berlayar keliling Nusantara. Pilih wilayah, lalu ketuk pin provinsi untuk melihat infonya. Selesaikan misi untuk mengumpulkan stempel paspor.'),
      el('div', { class: 'jn-daftar-wilayah' }, WILAYAH_ID.map(w => el('button', {
        type: 'button', class: 'jn-kartu-wilayah', style: { background: WILAYAH[w].warna, borderColor: WILAYAH[w].garis },
        onclick: () => pilihWilayah(w),
      },
      el('strong', {}, WILAYAH[w].nama),
      el('span', {}, `${provinsiWilayah(w).length} provinsi · 📮 ${stempelWilayah(s.d, w)}`),
      bintang(s.d.bintang[w] ?? 0)))));
  }
  const w = s.wilayah;
  const daftar = provinsiWilayah(w);
  return el('div', {},
    el('h2', {}, `⛵ Wilayah ${WILAYAH[w].nama}`),
    el('p', { class: 'catatan' }, `${daftar.length} provinsi · 📮 ${stempelWilayah(s.d, w)}/${daftar.length} stempel · `, bintang(s.d.bintang[w] ?? 0)),
    el('button', { type: 'button', class: 'tombol utama', onclick: mulaiMisi }, `🚩 Mulai misi (${JUMLAH_MISI} soal)`),
    el('p', { class: 'catatan' }, 'Ketuk pin di peta atau pilih nama provinsi untuk melihat infonya:'),
    el('ul', { class: 'jn-daftar-prov' }, daftar.map(p => el('li', {},
      el('button', { type: 'button', class: 'tombol kedua kecil', onclick: () => ketukPin(p.id) }, `${s.d.stempel[p.id] ? '📮 ' : ''}${p.nama}`)))));
}

function kartuProvinsi(p) {
  const baris = (label, ...isi) => el('div', { class: 'jn-baris' }, el('dt', {}, label), el('dd', {}, ...isi));
  return el('article', { class: 'jn-kartu', 'aria-labelledby': 'jn-judul-prov' },
    el('div', { class: 'jn-kartu-kepala', style: { background: WILAYAH[p.wilayah].warna } },
      el('h2', { id: 'jn-judul-prov' }, p.nama),
      el('span', { class: `jn-cap${s.d.stempel[p.id] ? ' ada' : ''}` }, s.d.stempel[p.id] ? '📮 Stempel ✔' : 'Belum ada stempel')),
    el('dl', {},
      baris('🏛️ Ibu kota', p.ibuKota),
      baris('🧭 Wilayah', WILAYAH[p.wilayah].nama),
      p.rumahAdat && baris('🏠 Rumah adat', p.rumahAdat.nama, p.rumahAdat.ket && el('span', { class: 'catatan' }, ` — ${p.rumahAdat.ket}`)),
      p.budaya?.length && baris('🎭 Budaya & alam', el('ul', {}, p.budaya.map(b => el('li', {},
        el('strong', {}, b.nama), ` (${JENIS_BUDAYA[b.jenis].toLowerCase()})`, b.ket && ` — ${b.ket}`)))),
      p.islam?.length && baris('🕌 Jejak Islam', el('ul', {}, p.islam.map(x => el('li', {},
        el('strong', {}, x.nama), ` (${JENIS_ISLAM[x.jenis]}) — ${x.ket}`)))),
      p.catatan && baris('💡 Tahukah kamu?', p.catatan)),
    el('div', { class: 'baris-tombol' },
      el('button', { type: 'button', class: 'tombol kedua kecil', onclick: () => { s.pilih = null; render(); } }, `← Wilayah ${WILAYAH[p.wilayah].nama}`),
      el('button', { type: 'button', class: 'tombol utama kecil', onclick: mulaiMisi }, '🚩 Mulai misi')));
}

function titikKemajuan(m) {
  return el('ol', { class: 'jn-titik', 'aria-label': `Misi ${m.i + 1} dari ${m.daftar.length}` }, m.daftar.map((_, i) => {
    const h = m.hasil[i]; // 'pertama' | 'benar' | 'salah'
    return el('li', { class: h ?? (i === m.i ? 'kini' : '') }, h === 'salah' ? '✖' : h ? '✔' : i + 1);
  }));
}

function panelMisi() {
  const m = s.misi;
  const misi = m.daftar[m.i];
  const p = provinsi(misi.prov);
  const isi = [
    el('p', { class: 'jn-misi-ke' }, `🚩 Misi ${m.i + 1} dari ${m.daftar.length} · ${WILAYAH[s.wilayah].nama}`),
    titikKemajuan(m),
    el('p', { class: 'jn-tanya' }, misi.teks),
  ];
  if (m.status === 'tanya') {
    if (misi.jenis === 'ketuk') {
      isi.push(el('p', { class: 'catatan' }, `👆 Ketuk pin di peta. Kesempatan: ${MAKS_PERCOBAAN - m.percobaan}`));
      if (m.umpan) isi.push(el('p', { class: 'jn-umpan salah', role: 'status' }, m.umpan));
      if (m.percobaan >= 2) isi.push(el('p', { class: 'jn-petunjuk' }, el('strong', {}, 'Petunjuk: '), misi.soal.petunjuk));
    } else {
      isi.push(el('p', { class: 'catatan' }, 'Jawab soal di jendela.'));
    }
  } else {
    isi.push(
      el('p', { class: `jn-umpan ${m.benarAkhir ? 'benar' : 'salah'}`, role: 'status' },
        m.benarAkhir ? `${pujian()} ` : 'Tidak apa-apa. ',
        `Ini letak provinsi `, el('strong', {}, p.nama), ' (ditandai di peta).'),
      el('p', { class: 'jn-penjelasan' }, misi.soal.penjelasan),
      el('button', { type: 'button', class: 'tombol utama', 'data-fokus': true, onclick: lanjutMisi }, m.i + 1 < m.daftar.length ? 'Lanjut ➜' : 'Lihat hasil ➜'));
  }
  isi.push(el('button', { type: 'button', class: 'tombol kedua kecil jn-berhenti', onclick: berhentiMisi }, '✋ Berhenti misi'));
  return el('div', { class: 'jn-misi' }, isi);
}

function panelHasil() {
  const m = s.misi;
  const b = hitungBintang(m.benarPertama, m.daftar.length);
  return el('div', { class: 'jn-hasil' },
    el('h2', {}, '🎉 Misi selesai!'),
    el('div', { class: 'jn-bintang-besar' }, bintang(b)),
    el('p', {}, `Benar pada percobaan pertama: ${m.benarPertama} dari ${m.daftar.length}.`),
    m.stempelBaru.length
      ? el('div', {}, el('p', {}, el('strong', {}, 'Stempel baru di paspormu:')),
        el('ul', { class: 'jn-stempel-baru' }, m.stempelBaru.map(id => el('li', {}, `📮 ${provinsi(id).nama}`))))
      : el('p', { class: 'catatan' }, 'Tidak ada stempel baru kali ini. Coba provinsi lain di wilayah ini!'),
    el('div', { class: 'baris-tombol' },
      el('button', { type: 'button', class: 'tombol utama', 'data-fokus': true, onclick: mulaiMisi }, '🔁 Misi lagi'),
      !m.bonus && el('button', { type: 'button', class: 'tombol kedua', onclick: soalBonus }, '🎁 Soal bonus'),
      el('button', { type: 'button', class: 'tombol kedua', onclick: () => { s.mode = 'jelajah'; render(); } }, '🗺️ Jelajah lagi')));
}

// Di layar sempit panel berada di bawah peta.
const layarSempit = () => window.matchMedia('(max-width: 900px)').matches;

function fokusPanel() {
  s.el.panel.querySelector('[data-fokus]')?.focus({ preventScroll: true });
}

// ---------- Aksi ----------

function pilihWilayah(w) {
  if (s.mode === 'misi') return;
  s.mode = 'jelajah';
  s.wilayah = w;
  s.pilih = null;
  s.ctx.audio.main('klik');
  berlayar(w ?? 'indonesia');
  render();
}

function ketukPin(id) {
  const p = provinsi(id);
  if (!p) return;
  if (s.mode !== 'misi') {
    s.mode = 'jelajah';
    s.ctx.audio.main('klik');
    s.pilih = id;
    if (s.wilayah !== p.wilayah) { s.wilayah = p.wilayah; berlayar(p.wilayah); }
    render();
    if (layarSempit()) s.el.panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    return;
  }
  const m = s.misi;
  const misi = m.daftar[m.i];
  if (m.status !== 'tanya' || misi.jenis !== 'ketuk' || p.wilayah !== s.wilayah) return;
  m.percobaan++;
  if (id === misi.prov) {
    if (m.percobaan === 1) m.benarPertama++;
    s.ctx.quiz.catat(misi.soal, m.percobaan === 1);
    s.ctx.audio.main('benar');
    akhiriMisi(true);
    return;
  }
  if (m.percobaan === 1) s.ctx.quiz.catat(misi.soal, false);
  s.ctx.audio.main('salah');
  m.salah.add(id);
  if (m.percobaan >= MAKS_PERCOBAAN) { akhiriMisi(false); return; }
  m.umpan = `Itu provinsi ${p.nama} (ibu kota ${p.ibuKota}). Coba lagi!`;
  render();
}

function akhiriMisi(benar) {
  const m = s.misi;
  const misi = m.daftar[m.i];
  m.status = 'jawab';
  m.benarAkhir = benar;
  m.hasil[m.i] = benar ? (m.percobaan === 1 ? 'pertama' : 'benar') : 'salah';
  if (benar) beriStempel(misi.prov);
  s.sorot = misi.prov;
  render();
  fokusPanel();
}

function beriStempel(id) {
  if (s.d.stempel[id]) return;
  s.d.stempel[id] = true;
  s.misi?.stempelBaru.push(id);
  simpan();
  toast(`📮 Stempel ${provinsi(id).nama} masuk paspor!`, 'sukses', 2200);
}

function mulaiMisi() {
  const w = s.wilayah ?? provinsi(s.pilih)?.wilayah;
  if (!w) return;
  s.wilayah = w;
  s.mode = 'misi';
  s.pilih = null;
  s.sorot = null;
  s.misi = { daftar: buatMisi(w, s.ctx.kelas), i: 0, percobaan: 0, benarPertama: 0, hasil: [], stempelBaru: [], salah: new Set(), status: 'tanya', umpan: '', bonus: false };
  berlayar(w);
  tampilkanMisi();
  if (layarSempit()) s.el.peta.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

async function tampilkanMisi() {
  const m = s.misi;
  const misi = m.daftar[m.i];
  m.percobaan = 0;
  m.status = 'tanya';
  m.umpan = '';
  m.salah = new Set();
  s.sorot = null;
  render();
  if (misi.jenis !== 'pilih') return;
  const token = m;
  const r = await s.ctx.quiz.tanya({ soal: misi.soal, judul: `🚩 Misi ${m.i + 1} dari ${m.daftar.length}` });
  if (!s || s.misi !== token || s.mode !== 'misi') return;
  m.percobaan = r.percobaan;
  if (r.benarPertama) m.benarPertama++;
  akhiriMisi(r.benar);
}

function lanjutMisi() {
  const m = s.misi;
  if (m.i + 1 < m.daftar.length) {
    m.i++;
    tampilkanMisi();
    return;
  }
  const b = hitungBintang(m.benarPertama, m.daftar.length);
  s.d.bintang[s.wilayah] = Math.max(s.d.bintang[s.wilayah] ?? 0, b);
  s.d.ronde++;
  simpan();
  s.mode = 'hasil';
  s.sorot = null;
  s.ctx.audio.main('levelup');
  render();
  fokusPanel();
}

async function berhentiMisi() {
  if (!(await konfirmasi('Misi yang sedang berjalan tidak dihitung. Stempel yang sudah didapat tetap tersimpan.', { judul: 'Berhenti misi?', ya: 'Berhenti', tidak: 'Lanjut misi' }))) return;
  if (!s) return;
  s.mode = 'jelajah';
  s.sorot = null;
  render();
}

async function soalBonus() {
  const m = s.misi;
  m.bonus = true;
  const r = await s.ctx.quiz.tanya({ mapel: 'nusantara', judul: '🎁 Soal bonus Pengetahuan Umum' });
  if (!s) return;
  if (r.benar) toast(`${pujian()} Kamu memang penjelajah hebat!`, 'sukses', 2500);
  render();
}

function bukaPaspor() {
  const isi = el('div', { class: 'jn-paspor' },
    el('p', {}, `Stempel terkumpul: ${jumlahStempel(s.d)} dari ${PROVINSI.length} provinsi.`),
    WILAYAH_ID.map(w => el('section', {},
      el('h3', {}, `${WILAYAH[w].nama} (${stempelWilayah(s.d, w)}/${provinsiWilayah(w).length})`),
      el('ul', {}, provinsiWilayah(w).map(p => el('li', {
        class: s.d.stempel[p.id] ? 'ada' : '',
        style: s.d.stempel[p.id] ? { borderColor: WILAYAH[w].garis, color: WILAYAH[w].garis } : null,
      }, s.d.stempel[p.id] ? `✔ ${p.nama}` : p.nama))))));
  modal({ judul: '📘 Paspor Nusantara', isi, tombol: [{ teks: 'Tutup', nilai: null, kelas: 'utama' }] });
}

export default {
  id: 'jelajah',
  nama: 'Jelajah Nusantara',
  deskripsi: 'Berlayar keliling Indonesia: kenali provinsi, ibu kota, rumah adat, budaya, dan jejak Islam Nusantara. Kumpulkan stempel paspor!',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: 'nusantara',
  css: 'css/jelajah.css',

  mount(container, ctx) {
    const { peta, pin, label, kapal } = buatPeta();
    s = {
      ctx, d: rapikan(ctx.store.get('jelajah')), mode: 'jelajah', wilayah: null, pilih: null, sorot: null, misi: null,
      v: { x: 0, y: 0, w: LEBAR, h: TINGGI }, rasio: LEBAR / TINGGI, lebarPx: 800, tinggiPx: 300,
      kapalPos: proyeksi(TAMPILAN.indonesia.kapal), anim: 0, pin, label, kapal,
      el: {
        bilah: el('div', { class: 'jn-bilah' }),
        wilayah: el('div', { class: 'jn-wilayah', role: 'toolbar', 'aria-label': 'Pilih wilayah' }),
        peta,
        panel: el('div', { class: 'jn-panel panel', 'aria-live': 'polite' }),
      },
    };
    const e = s.el;
    const tombolZoom = (teks, label2, fn) => el('button', { type: 'button', class: 'jn-zoom', 'aria-label': label2, onclick: fn }, teks);
    e.akar = el('div', { class: 'jn' },
      e.bilah,
      e.wilayah,
      el('div', { class: 'jn-utama' },
        el('div', { class: 'jn-wadah-peta' },
          peta,
          el('span', { class: 'jn-utara', 'aria-hidden': 'true' }, '▲', el('br'), 'U'),
          el('div', { class: 'jn-tombol-zoom' },
            tombolZoom('+', 'Perbesar peta', () => perbesar(1.4)),
            tombolZoom('−', 'Perkecil peta', () => perbesar(1 / 1.4)),
            tombolZoom('⤢', 'Tampilkan seluruh wilayah', () => berlayar(s.wilayah ?? 'indonesia'))),
          el('p', { class: 'jn-keterangan catatan' }, 'Geser peta dengan jari atau mouse; perbesar dengan tombol +/−, cubit, atau Ctrl + gulir. Peta sederhana, bukan peta berskala; letak pin hanya perkiraan.')),
        e.panel));
    container.append(e.akar);
    pasangGeser(peta);
    s.ro = new ResizeObserver(() => s && ukurPeta());
    s.ro.observe(peta);
    ukurPeta();
    s.v = kotakTampilan('indonesia', s.rasio);
    render();
    if (new URLSearchParams(location.search).has('debug')) window.__jelajah = { s: () => s, ketukPin, pilihWilayah, mulaiMisi, lanjutMisi };
  },

  unmount() {
    if (!s) return;
    cancelAnimationFrame(s.anim);
    s.ro?.disconnect();
    s = null;
  },

  simpan,

  progres(store) {
    const d = store.get('jelajah');
    if (!d) return { bintang: 0, teks: 'Belum pernah berlayar' };
    const n = PROVINSI.filter(p => d.stempel?.[p.id]).length;
    return { bintang: n >= 30 ? 3 : n >= 15 ? 2 : n >= 1 ? 1 : 0, teks: `📮 ${n}/${PROVINSI.length} stempel provinsi` };
  },
};
