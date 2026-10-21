// Petualangan Kata — labirin: kumpulkan huruf secara berurutan untuk menyusun kata baku.
// Belajar ejaan bahasa Indonesia: kata baku, imbuhan, kata ulang, sinonim/antonim, kosakata IPA & Islami.

import { el, isiUlang, pixelSvg, avatarSvg, pujian, bintang } from '../../core/ui.js';
import { KATA } from '../../../data/kata.js';
import { buatLevel, cariJalan, bisaDilewati, hitungBintang } from './labirin.js';

const ikon = pixelSvg([
  '############',
  '#..........#',
  '#.##.####..#',
  '#.#..#..#..#',
  '#.#.yy..#.##',
  '#...yy.##..#',
  '###.##.....#',
  '#.....##.#.#',
  '#.##.....#.#',
  '#..#.###.#.#',
  '#....#.....#',
  '############',
], { '#': '#2f9e44', '.': '#fff3bf', y: '#f59f00' }, { pad: 0 });

const KECEPATAN = 7; // tile per detik
const ARAH = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };

let s = null;

const daftarKata = kelas => KATA[kelas] ?? KATA[4];
const kemajuan = () => s.ctx.store.get('kemajuan', {})[s.ctx.kelas] ?? { bintang: {} };
function simpanBintang(i, b) {
  const semua = s.ctx.store.get('kemajuan', {});
  const k = semua[s.ctx.kelas] ?? { bintang: {} };
  k.bintang[i] = Math.max(k.bintang[i] ?? 0, b);
  semua[s.ctx.kelas] = k;
  s.ctx.store.set('kemajuan', semua);
}

// ---------- Peta level & kamus ----------

function tampilPeta() {
  hentikan();
  const daftar = daftarKata(s.ctx.kelas);
  const kb = kemajuan().bintang;
  const kamus = s.ctx.store.get('kamus', []);
  s.wadah.replaceChildren(el('div', { class: 'kt-menu' },
    el('p', {}, 'Baca petunjuknya, lalu jelajahi labirin dan kumpulkan huruf-huruf kata jawabannya secara berurutan. Hati-hati dengan huruf pengecoh!'),
    el('div', { class: 'kt-level' }, daftar.map((k, i) => {
      const terbuka = i === 0 || (kb[i - 1] ?? 0) > 0;
      return el('button', {
        type: 'button', class: `kt-tombol-level${kb[i] ? ' selesai' : ''}`, disabled: !terbuka,
        'aria-label': `Level ${i + 1}${terbuka ? '' : ', terkunci'}${kb[i] ? `, ${kb[i]} bintang` : ''}`,
        onclick: () => mulai(i),
      }, el('strong', {}, terbuka ? i + 1 : '🔒'), kb[i] ? bintang(kb[i]) : el('span', { class: 'catatan' }, terbuka ? 'Main' : 'Terkunci'));
    })),
    el('details', { class: 'kt-kamus', open: kamus.length > 0 },
      el('summary', {}, `📖 Kamus Kata (${kamus.length} kata)`),
      kamus.length
        ? el('ul', {}, kamus.map(k => el('li', {}, el('strong', {}, k.kata.toLowerCase()), ` — ${k.penjelasan}`)))
        : el('p', { class: 'catatan' }, 'Kata yang berhasil kamu susun akan tercatat di sini.'))));
}

// ---------- Permainan ----------

function hentikan() {
  if (!s) return;
  cancelAnimationFrame(s.raf);
  s.raf = 0;
  s.main = null;
}

function mulai(i) {
  hentikan();
  const entri = daftarKata(s.ctx.kelas)[i];
  const level = buatLevel(entri, s.ctx.kelas, 1000 + i * 31 + s.ctx.kelas);
  const m = {
    i, entri, ...level,
    huruf: level.huruf.map(h => ({ ...h })),
    pos: { ...level.awal },
    gambar: { x: level.awal.x, y: level.awal.y },
    dari: null, ke: null, t: 0,
    antre: [],
    n: 0, salah: 0, salahTile: new Set(),
    mulaiPada: performance.now(),
    sibuk: false, selesai: false,
    sorot: null,
    ambilSaatSampai: null, // kunci kotak huruf yang diketuk: diambil otomatis saat sampai
  };
  s.main = m;

  const e = {
    kanvas: el('canvas', { class: 'kt-kanvas', 'aria-label': `Labirin. Petunjuk: ${entri.petunjuk}` }),
    kata: el('div', { class: 'kt-kata', 'aria-live': 'polite' }),
    pesan: el('p', { class: 'kt-pesan', 'aria-live': 'polite' }),
    akhir: el('div', { class: 'panel kt-akhir', hidden: true }),
    ambil: el('button', { type: 'button', class: 'tombol utama kecil', disabled: true, onclick: () => ambil() }, '✋ Ambil huruf'),
  };
  s.el = e;
  const tombolArah = (arah, label, simbol) => {
    const b = el('button', { type: 'button', class: `kt-arah kt-arah-${label}`, 'aria-label': label, 'data-sunyi': true }, simbol);
    b.addEventListener('pointerdown', ev => { ev.preventDefault(); s.arahSentuh = arah; m.antre = []; });
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(t, () => { s.arahSentuh = null; });
    return b;
  };

  s.wadah.replaceChildren(el('div', { class: 'kt' },
    el('div', { class: 'kt-atas' },
      el('div', { class: 'kt-petunjuk' }, el('span', { class: 'catatan' }, `Level ${i + 1} · Petunjuk:`), el('strong', {}, entri.petunjuk)),
      e.kata,
      el('div', { class: 'baris-tombol' },
        e.ambil,
        el('button', { type: 'button', class: 'tombol kedua kecil', onclick: beriPetunjuk }, '💡 Huruf berikutnya'),
        el('button', { type: 'button', class: 'tombol kedua kecil', onclick: () => mulai(i) }, 'Ulangi'),
        el('button', { type: 'button', class: 'tombol kedua kecil', onclick: tampilPeta }, '← Peta level'))),
    e.pesan,
    e.akhir,
    el('div', { class: 'kt-papan' },
      e.kanvas,
      el('div', { class: 'kt-dpad' },
        tombolArah([0, -1], 'atas', '▲'), tombolArah([-1, 0], 'kiri', '◀'), tombolArah([1, 0], 'kanan', '▶'), tombolArah([0, 1], 'bawah', '▼'),
        el('button', { type: 'button', class: 'kt-arah kt-arah-ambil', 'aria-label': 'Ambil huruf', 'data-sunyi': true, onclick: () => ambil() }, '✋')))));

  e.kanvas.addEventListener('pointerdown', ketukKanvas);
  ukurKanvas();
  gambarKata();
  pesan('Berjalan dengan tombol panah/WASD atau ketuk lorong. Ambil huruf dengan Spasi, tombol ✋, atau ketuk hurufnya.');
  s.waktuTerakhir = performance.now();
  s.raf = requestAnimationFrame(putaran);
}

function pesan(teks, jenis = '') {
  s.el.pesan.textContent = teks;
  s.el.pesan.className = `kt-pesan ${jenis}`;
}

function gambarKata() {
  const m = s.main;
  isiUlang(s.el.kata, [...m.kata].map((h, i) => el('span', { class: `kt-huruf${i < m.n ? ' terisi' : ''}${h === '-' ? ' hubung' : ''}` }, i < m.n ? h : '')));
  s.el.kata.setAttribute('aria-label', `Terkumpul: ${m.kata.slice(0, m.n) || 'belum ada'}, ${m.kata.length - m.n} huruf lagi`);
}

function ukurKanvas() {
  const m = s.main;
  const H = m.peta.length;
  const W = m.peta[0].length;
  const lebar = Math.min(s.wadah.clientWidth || 600, 900);
  const tinggiMaks = Math.max(260, window.innerHeight - 300);
  const T = Math.max(18, Math.min(48, Math.floor(Math.min(lebar / W, tinggiMaks / H))));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const k = s.el.kanvas;
  k.width = W * T * dpr;
  k.height = H * T * dpr;
  k.style.width = `${W * T}px`;
  k.style.height = `${H * T}px`;
  m.T = T;
  m.dpr = dpr;
}

function ketukKanvas(ev) {
  const m = s.main;
  if (!m || m.sibuk || m.selesai) return;
  const r = s.el.kanvas.getBoundingClientRect();
  const x = Math.floor(((ev.clientX - r.left) / r.width) * m.peta[0].length);
  const y = Math.floor(((ev.clientY - r.top) / r.height) * m.peta.length);
  if (!bisaDilewati(m.peta, x, y)) return;
  const adaHuruf = m.huruf.some(h => h.x === x && h.y === y);
  m.ambilSaatSampai = adaHuruf ? `${x},${y}` : null;
  if (x === m.pos.x && y === m.pos.y) { if (adaHuruf) ambil(); return; }
  const jalan = cariJalan(m.peta, m.pos, { x, y });
  if (jalan) m.antre = jalan;
}

function beriPetunjuk() {
  const m = s.main;
  if (!m || m.selesai) return;
  const h = m.kata[m.n];
  m.salah++;
  m.sorot = h;
  pesan(`💡 Huruf berikutnya adalah "${h}". Kotak huruf ${h} berkedip di labirin.`, 'info');
}

/** Coba melangkah satu tile ke arah (dx, dy). */
function langkah(dx, dy) {
  const m = s.main;
  const x = m.pos.x + dx;
  const y = m.pos.y + dy;
  if (!bisaDilewati(m.peta, x, y)) return false;
  if (m.peta[y][x] === 'P') { bukaGerbang(x, y); return false; }
  m.dari = { ...m.pos };
  m.ke = { x, y };
  m.t = 0;
  return true;
}

async function bukaGerbang(x, y) {
  const m = s.main;
  m.sibuk = true;
  m.antre = [];
  s.arahSentuh = null;
  s.arahKunci = null;
  const r = await s.ctx.quiz.tanya({ mapel: 'bahasa', judul: '🚪 Gerbang terkunci! Jawab soal ini untuk membukanya.' });
  if (!s || s.main !== m) return;
  m.peta[y][x] = '.';
  m.sibuk = false;
  pesan(r.benar ? `${pujian()} Gerbang terbuka.` : 'Gerbang terbuka. Ingat jawaban yang benar, ya!', r.benar ? 'benar' : '');
}

const hurufDiSini = m => m.huruf.findIndex(h => h.x === m.pos.x && h.y === m.pos.y);

/** Dipanggil setiap kali pemain tiba di sebuah kotak. Menginjak huruf belum berarti mengambilnya. */
function sampai() {
  const m = s.main;
  const i = hurufDiSini(m);
  s.el.ambil.disabled = i < 0;
  if (i < 0) return;
  if (m.ambilSaatSampai === `${m.pos.x},${m.pos.y}` && !m.antre.length) {
    m.ambilSaatSampai = null;
    ambil();
    return;
  }
  if (!m.antre.length) pesan(`Kamu berdiri di huruf "${m.huruf[i].h}". Ambil hurufnya jika ini huruf berikutnya.`);
}

/** Ambil huruf di kotak tempat pemain berdiri. */
function ambil() {
  const m = s.main;
  if (!m || m.selesai || m.sibuk || m.ke) return;
  const i = hurufDiSini(m);
  if (i < 0) { pesan('Tidak ada huruf di sini.'); return; }
  const h = m.huruf[i];
  if (h.h === m.kata[m.n]) {
    m.huruf.splice(i, 1);
    m.n++;
    m.sorot = null;
    s.el.ambil.disabled = true;
    s.ctx.audio.main('benar');
    gambarKata();
    if (m.n === m.kata.length) { menang(); return; }
    pesan(`Huruf "${h.h}" terkumpul! Cari huruf berikutnya.`, 'benar');
  } else {
    const kunci = `${h.x},${h.y}`;
    if (!m.salahTile.has(kunci)) { m.salahTile.add(kunci); m.salah++; }
    s.ctx.audio.main('salah');
    pesan(`Huruf "${h.h}" belum tepat untuk huruf ke-${m.n + 1}. Pikirkan ejaan kata yang benar.`, 'salah');
  }
}

function menang() {
  const m = s.main;
  m.selesai = true;
  m.antre = [];
  const b = hitungBintang(m.salah);
  const detik = Math.round((performance.now() - m.mulaiPada) / 1000);
  simpanBintang(m.i, b);
  const kamus = s.ctx.store.get('kamus', []);
  if (!kamus.some(k => k.kata === m.kata)) {
    kamus.push({ kata: m.kata, penjelasan: m.entri.penjelasan, kelas: s.ctx.kelas });
    s.ctx.store.set('kamus', kamus);
  }
  s.ctx.quiz.catat({ id: `kata-${m.kata}`, mapel: 'bahasa', kelas: s.ctx.kelas, topik: 'Ejaan', tipe: 'teks', pertanyaan: m.entri.petunjuk, jawaban: m.kata }, m.salah === 0);
  s.ctx.audio.main('levelup');
  const ada = daftarKata(s.ctx.kelas)[m.i + 1];
  s.el.akhir.hidden = false;
  isiUlang(s.el.akhir,
    el('h2', {}, pujian()),
    el('p', { class: 'kt-jawaban' }, m.kata),
    bintang(b),
    el('p', {}, m.entri.penjelasan),
    el('p', { class: 'catatan' }, `Waktu ${Math.floor(detik / 60)}:${String(detik % 60).padStart(2, '0')} · salah ambil/petunjuk: ${m.salah}. Kata ini masuk ke 📖 Kamus Kata.`),
    el('div', { class: 'baris-tombol' },
      ada && el('button', { type: 'button', class: 'tombol utama', onclick: () => mulai(m.i + 1) }, 'Level berikutnya'),
      el('button', { type: 'button', class: 'tombol kedua', onclick: tampilPeta }, 'Peta level')));
  pesan('');
}

function putaran(sekarang) {
  if (!s?.main) return;
  const m = s.main;
  const dt = Math.min(0.05, (sekarang - s.waktuTerakhir) / 1000);
  s.waktuTerakhir = sekarang;

  if (m.ke) {
    m.t += dt * KECEPATAN;
    if (m.t >= 1) {
      m.pos = { ...m.ke };
      m.ke = null;
      m.dari = null;
      sampai();
    }
  }
  if (!m.ke && !m.sibuk && !m.selesai) {
    const arah = s.arahSentuh ?? s.arahKunci;
    if (arah) {
      m.antre = [];
      langkah(arah[0], arah[1]);
    } else if (m.antre.length) {
      const [x, y] = m.antre.shift();
      if (!langkah(x - m.pos.x, y - m.pos.y)) m.antre = [];
    }
  }
  const x = m.ke ? m.dari.x + (m.ke.x - m.dari.x) * m.t : m.pos.x;
  const y = m.ke ? m.dari.y + (m.ke.y - m.dari.y) * m.t : m.pos.y;
  gambar(x, y, sekarang);
  s.raf = requestAnimationFrame(putaran);
}

function gambar(px, py, waktu) {
  const m = s.main;
  const ctx = s.el.kanvas.getContext('2d');
  const T = m.T * m.dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let y = 0; y < m.peta.length; y++) {
    for (let x = 0; x < m.peta[0].length; x++) {
      const c = m.peta[y][x];
      if (c === '#') {
        ctx.fillStyle = '#2f9e44';
        ctx.fillRect(x * T, y * T, T, T);
        ctx.fillStyle = '#237032';
        ctx.fillRect(x * T, y * T + T * 0.75, T, T * 0.25);
        ctx.fillStyle = '#40c057';
        ctx.fillRect(x * T + T * 0.15, y * T + T * 0.15, T * 0.2, T * 0.2);
        ctx.fillRect(x * T + T * 0.6, y * T + T * 0.4, T * 0.2, T * 0.2);
      } else {
        ctx.fillStyle = (x + y) % 2 ? '#fff3bf' : '#ffec99';
        ctx.fillRect(x * T, y * T, T, T);
        if (c === 'P') {
          ctx.fillStyle = '#8b5a2b';
          ctx.fillRect(x * T + T * 0.1, y * T + T * 0.05, T * 0.8, T * 0.9);
          ctx.fillStyle = '#5c3d20';
          ctx.fillRect(x * T + T * 0.48, y * T + T * 0.05, T * 0.04, T * 0.9);
          ctx.fillStyle = '#ffd43b';
          ctx.fillRect(x * T + T * 0.38, y * T + T * 0.4, T * 0.24, T * 0.22);
          ctx.fillStyle = '#5c3d20';
          ctx.fillRect(x * T + T * 0.47, y * T + T * 0.47, T * 0.06, T * 0.1);
        }
      }
    }
  }
  // Huruf
  const kedip = Math.floor(waktu / 300) % 2 === 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(T * 0.6)}px system-ui, sans-serif`;
  for (const h of m.huruf) {
    const disorot = m.sorot === h.h && kedip;
    ctx.fillStyle = disorot ? '#ff922b' : '#fab005';
    ctx.fillRect(h.x * T + T * 0.08, h.y * T + T * 0.08, T * 0.84, T * 0.84);
    ctx.fillStyle = '#8f5b00';
    ctx.fillRect(h.x * T + T * 0.08, h.y * T + T * 0.8, T * 0.84, T * 0.12);
    ctx.fillStyle = '#1f2430';
    ctx.fillText(h.h === '-' ? '–' : h.h, h.x * T + T / 2, h.y * T + T * 0.48);
  }
  // Pemain (avatar profil)
  if (s.gambarAvatar?.complete) {
    const lompat = m.ke ? Math.sin(m.t * Math.PI) * T * 0.08 : 0;
    ctx.drawImage(s.gambarAvatar, px * T + T * 0.06, py * T + T * 0.06 - lompat, T * 0.88, T * 0.88);
  }
}

function tombolBawah(ev) {
  if (!s?.main || document.querySelector('.modal-latar') || /INPUT|TEXTAREA|SELECT/.test(ev.target?.tagName ?? '')) return;
  if (ev.code === 'Space' || ev.code === 'Enter') {
    if (ev.target?.tagName === 'BUTTON' && !ev.target.closest('.kt-papan')) return; // biarkan tombol lain bekerja biasa
    ev.preventDefault();
    ambil();
    return;
  }
  const arah = ARAH[ev.code];
  if (!arah) return;
  ev.preventDefault();
  s.arahKunci = arah;
}

function tombolAtas(ev) {
  if (s && ARAH[ev.code] && s.arahKunci === ARAH[ev.code]) s.arahKunci = null;
}

function saatUkur() {
  if (s?.main) ukurKanvas();
}

export default {
  id: 'kata',
  nama: 'Petualangan Kata',
  deskripsi: 'Jelajahi labirin, kumpulkan huruf secara berurutan, dan susun kata dengan ejaan yang benar.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: 'bahasa',
  css: 'css/kata.css',

  mount(container, ctx) {
    s = { ctx, wadah: el('div', { class: 'kt-wadah' }), main: null, raf: 0, arahKunci: null, arahSentuh: null };
    s.gambarAvatar = new Image();
    s.gambarAvatar.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg(ctx.profil.avatar))}`;
    if (/[?&]debug\b/.test(location.search)) window.__kata = s; // untuk pemeriksaan dari konsol
    container.append(s.wadah);
    window.addEventListener('keydown', tombolBawah);
    window.addEventListener('keyup', tombolAtas);
    window.addEventListener('resize', saatUkur);
    tampilPeta();
  },

  unmount() {
    hentikan();
    window.removeEventListener('keydown', tombolBawah);
    window.removeEventListener('keyup', tombolAtas);
    window.removeEventListener('resize', saatUkur);
    s = null;
  },

  progres(store, profil) {
    const k = store.get('kemajuan', {})[profil.kelas]?.bintang ?? {};
    const selesai = Object.keys(k).length;
    const total = daftarKata(profil.kelas).length;
    if (!selesai) return { bintang: 0, teks: 'Belum pernah main' };
    return { bintang: selesai >= total ? 3 : selesai >= 8 ? 2 : 1, teks: `Level ${selesai}/${total} · ${store.get('kamus', []).length} kata di kamus` };
  },
};
