// Tebak Angka — game uji untuk registry (Tahap 1).
// Anak menebak angka rahasia dengan petunjuk "terlalu kecil/besar" dan garis
// bilangan yang menyempit. Strategi terbaik: tebak angka di tengah rentang.

import { el, pixelSvg, papanAngka, pujian, bintang } from '../../core/ui.js';

const BATAS = { 4: 100, 5: 500, 6: 1000 };

const ikon = pixelSvg([
  '............',
  '....wwww....',
  '...ww..ww...',
  '...ww..ww...',
  '.......ww...',
  '......ww....',
  '.....ww.....',
  '.....ww.....',
  '............',
  '.....ww.....',
  '.....ww.....',
  '............',
], { w: '#ffffff' }, { latar: '#7048e8', pad: 1 });

const batasUntuk = kelas => BATAS[kelas] ?? 100;
// Jumlah tebakan terbanyak yang dibutuhkan jika selalu menebak tepat di tengah rentang.
const tebakanIdeal = n => Math.ceil(Math.log2(n + 1));

function hitungBintang(percobaan, n) {
  const ideal = tebakanIdeal(n);
  if (percobaan <= ideal) return 3;
  if (percobaan <= ideal + 3) return 2;
  return 1;
}

function ronde(n) {
  return { n, rahasia: 1 + Math.floor(Math.random() * n), tebakan: [], bawah: 1, atas: n, selesai: false };
}

let s = null; // { ctx, state, el: {...}, papan }

function render() {
  const { state, el: e } = s;
  const persen = x => ((x - 1) / (state.n - 1)) * 100;
  e.rentang.style.left = `${persen(state.bawah)}%`;
  e.rentang.style.width = `${Math.max(persen(state.atas) - persen(state.bawah), 0.8)}%`;
  e.labelBawah.textContent = state.bawah;
  e.labelAtas.textContent = state.atas;
  e.info.textContent = state.selesai
    ? `Angka rahasianya ${state.rahasia}.`
    : `Angkanya di antara ${state.bawah} dan ${state.atas}.`;
  e.riwayat.replaceChildren(...state.tebakan.map(t => el('li', { class: `ta-chip ${t.hasil}` },
    `${t.angka} ${t.hasil === 'kecil' ? '↑ terlalu kecil' : t.hasil === 'besar' ? '↓ terlalu besar' : '✓ benar!'}`)));
  e.penanda.replaceChildren(...state.tebakan.map(t => el('span', { class: `ta-penanda ${t.hasil}`, style: { left: `${persen(t.angka)}%` } })));
  e.main.hidden = state.selesai;
  e.menang.hidden = !state.selesai;
  if (state.selesai) {
    const b = hitungBintang(state.tebakan.length, state.n);
    e.menang.replaceChildren(
      el('h2', {}, pujian()),
      bintang(b),
      el('p', {}, `Kamu berhasil dengan ${state.tebakan.length} tebakan. Kalau selalu menebak angka di tengah rentang, paling banyak cukup ${tebakanIdeal(state.n)} tebakan.`),
      el('button', { class: 'tombol utama', type: 'button', onclick: mainLagi }, 'Main lagi'));
  }
}

function pesan(teks, jenis = '') {
  s.el.pesan.textContent = teks;
  s.el.pesan.className = `ta-pesan ${jenis}`;
}

function tebak(teks) {
  const { state, ctx, papan } = s;
  const angka = Number(teks);
  papan.kosongkan();
  if (!Number.isInteger(angka) || angka < 1 || angka > state.n) {
    pesan(`Masukkan angka 1 sampai ${state.n}.`, 'peringatan');
    return;
  }
  if (angka < state.bawah || angka > state.atas) {
    // Tidak dihitung sebagai tebakan: cukup diingatkan.
    pesan(`Ingat, angkanya di antara ${state.bawah} dan ${state.atas}. Coba lagi ya.`, 'peringatan');
    ctx.audio.main('salah');
    return;
  }
  if (angka === state.rahasia) {
    state.tebakan.push({ angka, hasil: 'benar' });
    state.selesai = true;
    const b = hitungBintang(state.tebakan.length, state.n);
    const terbaik = ctx.store.get('terbaik', {});
    const lama = terbaik[state.n];
    if (!lama || state.tebakan.length < lama.percobaan) {
      terbaik[state.n] = { percobaan: state.tebakan.length, bintang: b };
      ctx.store.set('terbaik', terbaik);
    }
    ctx.store.set('dimainkan', ctx.store.get('dimainkan', 0) + 1);
    ctx.audio.main(b === 3 ? 'levelup' : 'benar');
    pesan('');
  } else if (angka < state.rahasia) {
    state.tebakan.push({ angka, hasil: 'kecil' });
    state.bawah = angka + 1;
    pesan(`${angka} terlalu kecil. Coba angka yang lebih besar.`);
  } else {
    state.tebakan.push({ angka, hasil: 'besar' });
    state.atas = angka - 1;
    pesan(`${angka} terlalu besar. Coba angka yang lebih kecil.`);
  }
  simpan();
  render();
  if (!state.selesai) papan.fokus();
}

function petunjuk() {
  const { bawah, atas } = s.state;
  const tengah = Math.floor((bawah + atas) / 2);
  pesan(`Petunjuk: coba angka di tengah. (${bawah} + ${atas}) : 2 = ${tengah}${(bawah + atas) % 2 ? ' sisa 1' : ''}. Jadi coba ${tengah}.`, 'info');
}

function mainLagi() {
  s.state = ronde(batasUntuk(s.ctx.kelas));
  pesan('');
  simpan();
  render();
  s.papan.fokus();
}

function simpan() {
  if (s) s.ctx.store.set('ronde', s.state);
}

export default {
  id: 'tebak-angka',
  nama: 'Tebak Angka',
  deskripsi: 'Tebak angka rahasia dengan petunjuk lebih besar atau lebih kecil. (Game uji)',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: 'matematika',
  css: 'css/tebak-angka.css',

  mount(container, ctx) {
    const n = batasUntuk(ctx.kelas);
    const lama = ctx.store.get('ronde');
    const state = lama && lama.n === n && !lama.selesai ? lama : ronde(n);

    const papan = papanAngka({ saatKirim: tebak, maksDigit: String(n).length, label: 'Tebakanmu', teksKirim: 'Tebak' });
    const e = {
      rentang: el('div', { class: 'ta-rentang' }),
      penanda: el('div', { class: 'ta-penanda-wadah' }),
      labelBawah: el('span', {}),
      labelAtas: el('span', {}),
      info: el('p', { class: 'ta-info' }),
      pesan: el('p', { class: 'ta-pesan', 'aria-live': 'polite' }),
      riwayat: el('ol', { class: 'ta-riwayat', 'aria-label': 'Tebakan sebelumnya' }),
      main: null,
      menang: el('div', { class: 'panel ta-menang', hidden: true }),
    };
    e.main = el('div', { class: 'ta-main' },
      papan.elemen,
      el('button', { class: 'tombol kedua', type: 'button', onclick: petunjuk }, 'Petunjuk'));

    container.append(el('div', { class: 'ta' },
      el('p', { class: 'ta-soal' }, `Aku memikirkan sebuah angka dari 1 sampai ${n}. Bisakah kamu menebaknya?`),
      el('div', { class: 'ta-garis', 'aria-hidden': 'true' },
        e.rentang,
        e.penanda,
        el('span', { class: 'ta-ujung kiri' }, '1'),
        el('span', { class: 'ta-ujung kanan' }, String(n))),
      el('p', { class: 'ta-batas' }, 'Rentang: ', e.labelBawah, ' – ', e.labelAtas),
      e.info,
      e.pesan,
      e.main,
      e.menang,
      e.riwayat));

    s = { ctx, state, el: e, papan };
    render();
    papan.fokus();
  },

  unmount() {
    s = null;
  },

  simpan,

  progres(store, profil) {
    const n = batasUntuk(profil.kelas);
    const t = store.get('terbaik', {})[n];
    return t
      ? { bintang: t.bintang, teks: `Terbaik: ${t.percobaan} tebakan` }
      : { bintang: 0, teks: 'Belum pernah main' };
  },
};
