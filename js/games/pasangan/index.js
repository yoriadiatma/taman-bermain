// Pasangan Kilat — game mengingat (memory match) bertema belajar.
// Buka dua kartu; jika berpasangan, kartu tetap terbuka dan penjelasannya muncul.

import { el, isiUlang, pixelSvg, pujian, bintang } from '../../core/ui.js';
import { TEMA, UKURAN_KELAS, ukuranBawaan, buatKartu, hitungBintang } from './kartu.js';

const ikon = pixelSvg([
  '............',
  '.bbbb..pppp.',
  '.bwwb..pwwp.',
  '.bwwb..pwwp.',
  '.bwwb..pwwp.',
  '.bbbb..pppp.',
  '............',
  '.pppp..bbbb.',
  '.pyyp..byyb.',
  '.pyyp..byyb.',
  '.pyyp..byyb.',
  '.pppp..bbbb.',
], { b: '#1c6fd1', p: '#d6336c', w: '#ffffff', y: '#ffd43b' }, { latar: '#fff3bf', pad: 1 });

const KOLOM = { 8: 4, 12: 4, 16: 4, 20: 5, 24: 6 };
const LAMA_TUTUP = 950; // ms sebelum kartu yang tidak berpasangan ditutup lagi

let s = null;

const formatWaktu = detik => `${Math.floor(detik / 60)}:${String(Math.floor(detik % 60)).padStart(2, '0')}`;

/** Gambar pecahan: lingkaran dibagi q bagian, p bagian diarsir. */
function svgPecahan(p, q) {
  const r = 40;
  let isi = '';
  for (let i = 0; i < q; i++) {
    const a0 = (i / q) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / q) * Math.PI * 2 - Math.PI / 2;
    const x0 = 50 + r * Math.cos(a0);
    const y0 = 50 + r * Math.sin(a0);
    const x1 = 50 + r * Math.cos(a1);
    const y1 = 50 + r * Math.sin(a1);
    const besar = 1 / q > 0.5 ? 1 : 0;
    isi += `<path d="M50 50 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${besar} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${i < p ? '#f08c00' : '#fff'}" stroke="#1f2430" stroke-width="2.5"/>`;
  }
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${isi}</svg>`;
}

function isiSisi(sisi) {
  if (sisi.jenis === 'pecahan') {
    const [p, q] = sisi.isi;
    return el('span', { class: 'pk-pecahan', 'aria-hidden': 'true' }, el('span', {}, p), el('span', {}, q));
  }
  if (sisi.jenis === 'gambarPecahan') return el('span', { class: 'pk-gambar', html: svgPecahan(...sisi.isi) });
  if (sisi.jenis === 'emoji') return el('span', { class: 'pk-emoji', 'aria-hidden': 'true' }, sisi.isi);
  return el('span', { class: `pk-teks${sisi.isi.length > 14 ? ' panjang' : ''}`, 'aria-hidden': 'true' }, sisi.isi);
}

// ---------- Menu ----------

function tampilMenu() {
  hentikanJam();
  const { ctx } = s;
  const rekor = ctx.store.get('rekor', {});
  const ukuranList = UKURAN_KELAS[ctx.kelas] ?? UKURAN_KELAS[4];
  if (!ukuranList.includes(s.ukuran)) s.ukuran = ukuranBawaan(ctx.kelas);

  const wadahUkuran = el('div', { class: 'baris-tombol', role: 'group', 'aria-label': 'Jumlah kartu' });
  const gambarUkuran = () => wadahUkuran.replaceChildren(...ukuranList.map(n => el('button', {
    type: 'button', class: 'tombol kedua', 'aria-pressed': String(n === s.ukuran),
    onclick: () => { s.ukuran = n; gambarUkuran(); gambarTema(); },
  }, `${n} kartu`)));
  const wadahTema = el('div', { class: 'pk-grid-tema' });
  const gambarTema = () => wadahTema.replaceChildren(...Object.entries(TEMA).map(([id, t]) => {
    const r = rekor[`${id}-${s.ukuran}`];
    return el('button', { type: 'button', class: 'pk-tema', onclick: () => mulai(id) },
      el('span', { class: 'pk-tema-ikon', 'aria-hidden': 'true' }, t.ikon),
      el('strong', {}, t.nama),
      el('span', { class: 'catatan' }, t.ket),
      r ? el('span', { class: 'pk-rekor' }, bintang(r.bintang), ` Rekor: ${formatWaktu(r.waktu)}, ${r.percobaan} percobaan`)
        : el('span', { class: 'pk-rekor catatan' }, 'Belum ada rekor'));
  }));
  gambarUkuran();
  gambarTema();

  s.wadah.replaceChildren(el('div', { class: 'pk-menu' },
    el('p', { class: 'label-besar' }, 'Berapa kartu?'), wadahUkuran,
    el('p', { class: 'label-besar' }, 'Pilih tema'), wadahTema,
    el('p', { class: 'catatan' }, 'Cara main: buka dua kartu. Jika keduanya berpasangan, kartu tetap terbuka. Temukan semua pasangan secepatnya dengan percobaan sesedikit mungkin!')));
}

// ---------- Permainan ----------

function hentikanJam() {
  clearInterval(s?.jam);
  clearTimeout(s?.tundaTutup);
}

function mulai(tema) {
  hentikanJam();
  const { pasangan, kartu } = buatKartu(tema, s.ctx.kelas, s.ukuran);
  Object.assign(s, {
    tema, pasangan, kartu,
    terbuka: [],           // indeks kartu yang sedang dibuka (maks 2)
    ketemu: new Set(),     // id pasangan yang sudah ditemukan
    percobaan: 0,
    mulaiPada: null,
    detik: 0,
    kunci: false,
  });

  const e = {
    waktu: el('span', {}, '0:00'),
    percobaan: el('span', {}, '0'),
    ketemu: el('span', {}, `0/${pasangan.length}`),
    penjelasan: el('p', { class: 'pk-penjelasan', 'aria-live': 'polite' }, 'Ketuk sebuah kartu untuk membukanya.'),
    grid: el('div', { class: 'pk-grid', style: { gridTemplateColumns: `repeat(${KOLOM[kartu.length] ?? 4}, minmax(0, 1fr))` } }),
    menang: el('div', { class: 'panel pk-menang', hidden: true }),
  };
  s.el = e;
  s.tombol = kartu.map((k, i) => el('button', {
    type: 'button', class: 'pk-kartu', 'data-sunyi': true, onclick: () => buka(i),
  },
  el('span', { class: 'pk-dalam' },
    el('span', { class: 'pk-belakang', 'aria-hidden': 'true' }, '?'),
    el('span', { class: 'pk-depan' }, isiSisi(k.sisi)))));
  s.tombol.forEach((b, i) => perbaruiKartu(i));
  e.grid.append(...s.tombol);

  s.wadah.replaceChildren(el('div', { class: 'pk' },
    el('div', { class: 'pk-bilah' },
      el('span', { class: 'pk-info' }, `${TEMA[tema].ikon} ${TEMA[tema].nama}`),
      el('span', { class: 'pk-info' }, '⏱ ', e.waktu),
      el('span', { class: 'pk-info' }, '🔁 Percobaan: ', e.percobaan),
      el('span', { class: 'pk-info' }, '✅ Pasangan: ', e.ketemu),
      el('span', { class: 'baris-tombol' },
        el('button', { type: 'button', class: 'tombol kedua kecil', onclick: () => mulai(tema) }, 'Acak ulang'),
        el('button', { type: 'button', class: 'tombol kedua kecil', onclick: tampilMenu }, '← Pilih tema'))),
    e.penjelasan,
    e.menang,
    e.grid));
}

function perbaruiKartu(i) {
  const b = s.tombol[i];
  const k = s.kartu[i];
  const terbuka = s.terbuka.includes(i) || s.ketemu.has(k.pasangan);
  b.classList.toggle('terbuka', terbuka);
  b.classList.toggle('ketemu', s.ketemu.has(k.pasangan));
  b.disabled = s.ketemu.has(k.pasangan);
  b.setAttribute('aria-label', `Kartu ${i + 1}: ${terbuka ? k.sisi.label : 'tertutup'}${s.ketemu.has(k.pasangan) ? ', sudah berpasangan' : ''}`);
}

function buka(i) {
  if (s.kunci || s.terbuka.includes(i) || s.ketemu.has(s.kartu[i].pasangan)) return;
  if (s.mulaiPada === null) {
    s.mulaiPada = Date.now();
    s.jam = setInterval(() => {
      s.detik = (Date.now() - s.mulaiPada) / 1000;
      s.el.waktu.textContent = formatWaktu(s.detik);
    }, 250);
  }
  s.ctx.audio.main('klik');
  s.terbuka.push(i);
  perbaruiKartu(i);
  if (s.terbuka.length < 2) return;

  s.percobaan++;
  s.el.percobaan.textContent = s.percobaan;
  const [a, b] = s.terbuka;
  const pa = s.kartu[a].pasangan;
  if (pa === s.kartu[b].pasangan) {
    s.ketemu.add(pa);
    s.terbuka = [];
    perbaruiKartu(a);
    perbaruiKartu(b);
    s.ctx.audio.main('benar');
    s.el.ketemu.textContent = `${s.ketemu.size}/${s.pasangan.length}`;
    s.el.penjelasan.textContent = `✔ ${s.pasangan[pa].penjelasan}`;
    if (s.ketemu.size === s.pasangan.length) menang();
  } else {
    s.kunci = true;
    s.el.penjelasan.textContent = 'Belum berpasangan. Ingat letaknya, lalu coba lagi!';
    s.tundaTutup = setTimeout(() => {
      if (!s) return;
      s.terbuka = [];
      s.kunci = false;
      perbaruiKartu(a);
      perbaruiKartu(b);
    }, LAMA_TUTUP);
  }
}

function menang() {
  hentikanJam();
  s.detik = (Date.now() - s.mulaiPada) / 1000;
  const n = s.pasangan.length;
  const b = hitungBintang(s.percobaan, n);
  const kunci = `${s.tema}-${s.kartu.length}`;
  const rekor = s.ctx.store.get('rekor', {});
  const lama = rekor[kunci];
  // Rekor baru jika bintang lebih banyak, atau bintang sama tetapi lebih cepat.
  const baru = !lama || b > lama.bintang || (b === lama.bintang && s.detik < lama.waktu);
  if (baru) {
    rekor[kunci] = { waktu: Math.round(s.detik), percobaan: s.percobaan, bintang: b };
    s.ctx.store.set('rekor', rekor);
  }
  s.ctx.store.set('dimainkan', s.ctx.store.get('dimainkan', 0) + 1);
  s.ctx.audio.main(b === 3 ? 'levelup' : 'benar');
  s.el.menang.hidden = false;
  isiUlang(s.el.menang,
    el('h2', {}, pujian()),
    bintang(b),
    el('p', {}, `Semua ${n} pasangan ditemukan dalam ${formatWaktu(s.detik)} dengan ${s.percobaan} percobaan.`),
    baru && lama && el('p', { class: 'pk-rekor-baru' }, '🏆 Rekor baru!'),
    el('p', { class: 'catatan' }, `Tips: percobaan paling sedikit adalah ${n} (setiap percobaan langsung berpasangan).`),
    el('div', { class: 'baris-tombol' },
      el('button', { type: 'button', class: 'tombol utama', onclick: () => mulai(s.tema) }, 'Main lagi'),
      el('button', { type: 'button', class: 'tombol kedua', onclick: tampilMenu }, 'Pilih tema lain')));
  s.el.menang.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
}

export default {
  id: 'pasangan',
  nama: 'Pasangan Kilat',
  deskripsi: 'Ingat letak kartu dan temukan pasangannya: hitungan, pecahan, kata, hewan & tumbuhan.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: ['matematika', 'bahasa', 'ipa'],
  css: 'css/pasangan.css',

  mount(container, ctx) {
    s = { ctx, wadah: el('div', { class: 'pk-wadah' }), ukuran: ukuranBawaan(ctx.kelas) };
    if (/[?&]debug\b/.test(location.search)) window.__pasangan = s; // untuk pemeriksaan dari konsol
    container.append(s.wadah);
    tampilMenu();
  },

  unmount() {
    hentikanJam();
    s = null;
  },

  progres(store) {
    const rekor = Object.values(store.get('rekor', {}));
    if (!rekor.length) return { bintang: 0, teks: 'Belum pernah main' };
    return { bintang: Math.max(...rekor.map(r => r.bintang)), teks: `${store.get('dimainkan', 0)} kali main · ${rekor.length} rekor` };
  },
};
