// Kebun Ceria — menanam, merawat, beternak, dan berbagi hasil panen.
// Belajar: siklus hidup tumbuhan, IPA dari bank soal, pecahan/persen saat membagi panen, jenis makanan hewan.

import { el, isiUlang, pixelSvg, toast, modal, pujian } from '../../core/ui.js';
import { TANAMAN, HEWAN, BARANG_KEBUN, INFO_KOMPOS, INFO_HUJAN } from '../../../data/kebun.js';
import {
  rapikan, jumlah, benihId, tahapKe, statusPetak, hariSampaiPanen, tanam, siram, beriKompos, panen,
  buatKompos, ambilRumput, beriMakan, ambilProduk, hargaJual, jual, beli, hargaPetak, tidur, soalSiklus, soalBagi,
  bagikan, soalJenisMakan, PETAK_MAKS, RUMPUT_PER_HARI, SISA_PER_KOMPOS,
} from './logika.js';
import { svgPetak, svgTahap, svgHewan } from './gambar.js';

const ikon = pixelSvg([
  '............',
  '.....gg.....',
  '....gggg....',
  '...gg..gg...',
  '.....gg.....',
  '..rr.gg.rr..',
  '.rrrrggrrrr.',
  '.rrrrggrrrr.',
  '..rr.gg.rr..',
  'dddddddddddd',
  'dbdddbdddbdd',
  'dddddddddddd',
], { g: '#2f9e44', r: '#e03131', d: '#8b5a2b', b: '#6b4226' }, { latar: '#d3f9d8', pad: 1 });

// Topik IPA di bank soal untuk pertanyaan saat panen.
const TOPIK_TUMBUHAN = { 4: ['Bagian Tumbuhan', 'Fotosintesis'], 5: ['Ekosistem'], 6: ['Perkembangbiakan Tumbuhan'] };
const NAMA_STATUS = { kosong: 'kosong', siap: 'siap dipanen', layu: 'layu, perlu disiram', haus: 'perlu disiram', tumbuh: 'sudah disiram' };
const LENCANA = { siap: '✨', layu: '🥀', haus: '💧' };

let s = null;

const namaBarang = id => TANAMAN[id]?.nama ?? BARANG_KEBUN[id]?.nama ?? (id.startsWith('benih-') ? `Benih ${TANAMAN[id.slice(6)]?.nama.toLowerCase()}` : id);
const emojiBarang = id => TANAMAN[id]?.emoji ?? BARANG_KEBUN[id]?.emoji ?? (id.startsWith('benih-') ? '🌱' : '📦');

function simpan() {
  if (s) s.ctx.store.set('kebun', s.k);
}

function pesan(teks) {
  s.el.pesan.textContent = teks;
}

// ---------- Tampilan ----------

function render() {
  const k = s.k;
  isiUlang(s.el.bilah,
    el('span', { class: 'kb-info' }, `📅 Hari ke-${k.hari}`),
    el('span', { class: 'kb-info' }, k.cuaca === 'hujan' ? '🌧️ Hujan' : '☀️ Cerah'),
    el('span', { class: 'kb-info' }, `🪙 ${k.koin} koin`),
    el('span', { class: 'kb-info' }, `💚 Kebaikan ${k.kebaikan}`),
    el('button', {
      type: 'button', class: `tombol kedua kecil${s.modeKompos ? ' aktif' : ''}`, 'aria-pressed': String(s.modeKompos),
      onclick: () => { s.modeKompos = !s.modeKompos; pesan(s.modeKompos ? `Mode kompos: ketuk petak untuk memberi kompos (punya ${jumlah(k, 'kompos')}).` : ''); render(); },
    }, `♻️ Beri kompos (${jumlah(k, 'kompos')})`),
    el('button', { type: 'button', class: 'tombol utama', onclick: tidurMalam }, '🌙 Tidur'));

  isiUlang(s.el.petak, k.petak.map((t, i) => {
    const st = statusPetak(t);
    const nama = t ? TANAMAN[t.id].nama : 'Petak kosong';
    const tahap = t ? TANAMAN[t.id].tahap[tahapKe(t)] : 'Ketuk untuk menanam';
    return el('button', {
      type: 'button', class: `kb-petak ${st}`, 'data-sunyi': true,
      'aria-label': `Petak ${i + 1}: ${t ? `${nama}, ${tahap.toLowerCase()}, ${NAMA_STATUS[st]}` : 'kosong'}${t?.pupuk ? ', sudah diberi kompos' : ''}`,
      onclick: () => ketukPetak(i),
    },
    el('span', { class: 'kb-gambar', html: svgPetak(t, k.cuaca === 'hujan') }),
    LENCANA[st] && el('span', { class: 'kb-lencana', 'aria-hidden': 'true' }, LENCANA[st]),
    el('span', { class: 'kb-nama' }, nama),
    el('span', { class: 'kb-tahap' }, tahap));
  }));

  isiUlang(s.el.kandang,
    el('div', { class: 'kb-hewan kb-rumput' },
      el('span', { class: 'kb-emoji', 'aria-hidden': 'true' }, '🌿'),
      el('strong', {}, 'Padang rumput'),
      el('span', { class: 'catatan' }, `Rumput hari ini: ${RUMPUT_PER_HARI - k.rumputDiambil}`),
      el('button', { type: 'button', class: 'tombol kedua kecil', disabled: k.rumputDiambil >= RUMPUT_PER_HARI, onclick: () => aksi(() => ambilRumput(k), `Kamu mengambil ${RUMPUT_PER_HARI} rumput.`) }, 'Ambil rumput')),
    k.hewan.map((h, i) => {
      const d = HEWAN[h.id];
      const produk = BARANG_KEBUN[d.produk];
      return el('div', { class: 'kb-hewan' },
        el('span', { class: 'kb-gambar-hewan', html: svgHewan(h.id) }),
        el('strong', {}, d.nama),
        el('span', { class: 'catatan' }, h.makan ? '😊 Sudah makan' : `🍽️ Lapar (makan ${d.jumlahMakan} ${namaBarang(d.makanan).toLowerCase()})`),
        el('div', { class: 'baris-tombol' },
          el('button', { type: 'button', class: 'tombol kedua kecil', disabled: h.makan, onclick: () => aksi(() => beriMakan(k, i), `${d.nama} makan dengan lahap.`) }, 'Beri makan'),
          el('button', {
            type: 'button', class: 'tombol utama kecil', disabled: !h.produk,
            onclick: () => { const r = ambilProduk(k, i); if (typeof r === 'string') pesan(r); else { s.ctx.audio.main('benar'); pesan(`Dapat ${r.n} ${produk.nama.toLowerCase()}!`); simpan(); render(); } },
          }, `${produk.emoji} Ambil (${h.produk})`)));
    }),
    !k.hewan.length && el('p', { class: 'catatan' }, 'Belum ada hewan. Beli ayam, kambing, atau sapi di Toko.'));

  isiUlang(s.el.tab, ['gudang', 'toko', 'info'].map(id => el('button', {
    type: 'button', role: 'tab', class: 'tombol kedua kecil', 'aria-selected': String(s.tab === id),
    onclick: () => { s.tab = id; render(); },
  }, { gudang: '🏠 Gudang', toko: '🏪 Toko', info: '📖 Info' }[id])));
  isiUlang(s.el.panel, { gudang: panelGudang, toko: panelToko, info: panelInfo }[s.tab]());
}

function panelGudang() {
  const k = s.k;
  const barang = Object.keys(k.gudang).filter(id => !id.startsWith('benih-') && hargaJual(id) > 0);
  const benih = Object.keys(k.gudang).filter(id => id.startsWith('benih-'));
  const baris = id => el('li', {},
    el('span', { class: 'kb-emoji', 'aria-hidden': 'true' }, emojiBarang(id)),
    el('span', {}, `${namaBarang(id)}: ${jumlah(k, id)}`));
  return el('div', {},
    el('h3', {}, 'Hasil kebun & ternak'),
    barang.length
      ? el('ul', { class: 'kb-daftar' }, barang.map(id => el('li', {},
        el('span', { class: 'kb-emoji', 'aria-hidden': 'true' }, emojiBarang(id)),
        el('span', {}, `${namaBarang(id)}: ${jumlah(k, id)} (🪙${hargaJual(id)}/buah)`),
        el('span', { class: 'baris-tombol' },
          el('button', { type: 'button', class: 'tombol kedua kecil', onclick: () => aksi(() => jual(k, id, 1), `Terjual 1 ${namaBarang(id).toLowerCase()}.`) }, 'Jual 1'),
          el('button', { type: 'button', class: 'tombol kedua kecil', onclick: () => { const n = jumlah(k, id); aksi(() => jual(k, id, n), `Terjual ${n} ${namaBarang(id).toLowerCase()} = ${n * hargaJual(id)} koin.`); } }, 'Jual semua')))))
      : el('p', { class: 'catatan' }, 'Belum ada hasil panen.'),
    el('h3', {}, 'Benih'),
    benih.length ? el('ul', { class: 'kb-daftar' }, benih.map(baris)) : el('p', { class: 'catatan' }, 'Benih habis. Beli di Toko.'),
    el('h3', {}, 'Makanan ternak & kompos'),
    el('ul', { class: 'kb-daftar' }, ['rumput', 'sisa', 'kompos'].map(baris)),
    el('button', {
      type: 'button', class: 'tombol kedua kecil', disabled: jumlah(k, 'sisa') < SISA_PER_KOMPOS,
      onclick: () => aksi(() => buatKompos(k), `Kompos jadi! ${INFO_KOMPOS}`),
    }, `♻️ Buat kompos (${SISA_PER_KOMPOS} sisa → 1 kompos)`),
    el('p', { class: 'catatan' }, 'Kompos membuat hasil panen 50% lebih banyak.'));
}

function panelToko() {
  const k = s.k;
  return el('div', {},
    el('h3', {}, 'Benih'),
    el('ul', { class: 'kb-daftar' }, Object.entries(TANAMAN).map(([id, d]) => el('li', {},
      el('span', { class: 'kb-emoji', 'aria-hidden': 'true' }, d.emoji),
      el('span', {}, `${d.nama}: 🪙${d.hargaBenih}, panen ${d.hasil} setelah ${hariSampaiPanen(id)} hari disiram`),
      el('button', { type: 'button', class: 'tombol kedua kecil', disabled: k.koin < d.hargaBenih, onclick: () => aksi(() => beli(k, 'benih', id), `Benih ${d.nama.toLowerCase()} dibeli.`) }, 'Beli')))),
    el('h3', {}, 'Hewan ternak'),
    el('ul', { class: 'kb-daftar' }, Object.entries(HEWAN).map(([id, d]) => el('li', {},
      el('span', { class: 'kb-gambar-kecil', html: svgHewan(id) }),
      el('span', {}, `${d.nama}: 🪙${d.harga} (punya ${k.hewan.filter(h => h.id === id).length}/${d.maks})`),
      el('button', { type: 'button', class: 'tombol kedua kecil', disabled: k.koin < d.harga, onclick: () => beliHewan(id) }, 'Beli')))),
    el('h3', {}, 'Lahan'),
    k.petak.length < PETAK_MAKS
      ? el('button', { type: 'button', class: 'tombol kedua kecil', disabled: k.koin < hargaPetak(k), onclick: () => aksi(() => beli(k, 'petak'), 'Kebunmu bertambah luas!') }, `➕ Tambah petak (🪙${hargaPetak(k)})`)
      : el('p', { class: 'catatan' }, 'Kebunmu sudah paling luas.'));
}

function panelInfo() {
  return el('div', {},
    el('p', { class: 'catatan' }, 'Tanaman tumbuh satu langkah setiap malam jika sudah disiram. Jika 2 hari tidak disiram, tanaman layu dan berhenti tumbuh sampai disiram lagi.'),
    Object.entries(TANAMAN).map(([id, d]) => el('details', { class: 'kb-info-tanaman' },
      el('summary', {}, `${d.emoji} ${d.nama}`),
      el('div', { class: 'kb-tahap-daftar' }, d.tahap.map((nama, i) => el('figure', {},
        el('span', { html: svgTahap(id, i) }), el('figcaption', {}, nama)))),
      el('p', {}, d.info))),
    Object.entries(HEWAN).map(([id, d]) => el('details', { class: 'kb-info-tanaman' },
      el('summary', {}, `${d.nama}`),
      el('p', {}, d.info))));
}

// ---------- Aksi ----------

/** Jalankan aksi logika; tampilkan pesan kesalahan atau pesan berhasil. */
function aksi(fn, berhasil) {
  const galat = fn();
  if (galat) { pesan(galat); s.ctx.audio.main('salah'); return false; }
  pesan(berhasil);
  simpan();
  render();
  return true;
}

async function ketukPetak(i) {
  if (s.sibuk) return;
  const k = s.k;
  const t = k.petak[i];
  if (s.modeKompos) {
    if (aksi(() => beriKompos(k, i), 'Kompos ditaburkan. Hasil panen nanti lebih banyak!')) s.ctx.audio.main('benar');
    return;
  }
  const st = statusPetak(t);
  if (st === 'kosong') return pilihBenih(i);
  if (st === 'siap') return panenPetak(i);
  if (st === 'haus' || st === 'layu') {
    if (aksi(() => siram(k, i), st === 'layu' ? 'Disiram! Besok tanamannya segar kembali.' : 'Disiram! Tanaman akan tumbuh saat malam.')) s.ctx.audio.main('klik');
    return;
  }
  const d = TANAMAN[t.id];
  const sisaHari = hariSampaiPanen(t.id) - t.umur;
  pesan(`${d.nama} (${d.tahap[tahapKe(t)].toLowerCase()}) sudah disiram. ${sisaHari} malam lagi siap panen.`);
}

async function pilihBenih(i) {
  const k = s.k;
  const ada = Object.keys(TANAMAN).filter(id => jumlah(k, benihId(id)) > 0);
  if (!ada.length) { pesan('Kamu belum punya benih. Beli di Toko.'); s.tab = 'toko'; render(); return; }
  const id = await modal({
    judul: `Tanam apa di petak ${i + 1}?`,
    tombol: [...ada.map(b => ({ teks: `${TANAMAN[b].emoji} ${TANAMAN[b].nama} (${jumlah(k, benihId(b))})`, nilai: b, kelas: 'kedua' })), { teks: 'Batal', nilai: null }],
  });
  if (!s || !id) return;
  if (aksi(() => tanam(k, i, id), `Benih ${TANAMAN[id].nama.toLowerCase()} ditanam. Jangan lupa disiram!`)) s.ctx.audio.main('klik');
}

async function panenPetak(i) {
  const k = s.k;
  const t = k.petak[i];
  const d = TANAMAN[t.id];
  const kelas = s.ctx.kelas;
  s.sibuk = true;
  // Bergantian: soal urutan siklus hidup, lalu soal IPA dari bank soal.
  const pakaiSiklus = (s.ctx.store.get('giliranSoal', 0) % 2) === 0;
  s.ctx.store.set('giliranSoal', s.ctx.store.get('giliranSoal', 0) + 1);
  const r = await s.ctx.quiz.tanya(pakaiSiklus
    ? { soal: soalSiklus(t.id, kelas), judul: `🧺 Panen ${d.nama.toLowerCase()}! Jawab untuk bonus.` }
    : { mapel: 'ipa', topik: TOPIK_TUMBUHAN[kelas] ?? TOPIK_TUMBUHAN[4], judul: `🧺 Panen ${d.nama.toLowerCase()}! Jawab untuk bonus.` });
  if (!s) return;
  const bonus = r.benar ? 2 : 0;
  const hasil = panen(k, i, bonus);
  s.ctx.audio.main('levelup');
  toast(`Alhamdulillah, panen ${hasil.n} ${d.nama.toLowerCase()}!${bonus ? ' (+2 bonus karena jawabanmu benar)' : ''}`, 'sukses', 3000);
  simpan();
  render();
  // Berbagi hasil panen dengan tetangga (latihan pecahan/persen).
  const soal = hasil.n >= 4 && Math.random() < 0.6 ? soalBagi(hasil.id, hasil.n, kelas) : null;
  if (soal) {
    await modal({
      judul: '🤝 Tetangga datang berkunjung',
      isi: `Tetanggamu belum panen. Yuk, berbagi sebagian ${d.nama.toLowerCase()} hasil panenmu!`,
      tombol: [{ teks: 'Ayo berbagi', nilai: true, kelas: 'utama' }],
    });
    if (!s) return;
    const r2 = await s.ctx.quiz.tanya({ soal, judul: '🤝 Berbagi hasil panen' });
    if (!s) return;
    const n = bagikan(k, hasil.id, soal.jawaban);
    toast(`${r2.benar ? pujian() + ' ' : ''}Kamu membagikan ${n} ${d.nama.toLowerCase()}. Tetangga berterima kasih dan mendoakanmu. 💚 Kebaikan +1`, 'sukses', 4000);
    simpan();
    render();
  }
  s.sibuk = false;
}

async function beliHewan(id) {
  const k = s.k;
  const pertama = !k.hewan.some(h => h.id === id) && !(s.ctx.store.get('kenalHewan', []).includes(id));
  if (!aksi(() => beli(k, 'hewan', id), `${HEWAN[id].nama} baru tiba di kandang!`)) return;
  s.ctx.audio.main('levelup');
  if (pertama) {
    s.ctx.store.set('kenalHewan', [...s.ctx.store.get('kenalHewan', []), id]);
    await s.ctx.quiz.tanya({ soal: soalJenisMakan(id, s.ctx.kelas), judul: `Kenalan dengan ${HEWAN[id].nama.toLowerCase()}` });
  }
}

async function tidurMalam() {
  if (s.sibuk) return;
  const k = s.k;
  const belum = k.petak.filter(t => t && statusPetak(t) === 'haus').length;
  if (belum && !(await modal({
    judul: 'Tidur sekarang?',
    isi: `Masih ada ${belum} tanaman yang belum disiram. Tanaman yang tidak disiram tidak tumbuh malam ini.`,
    tombol: [{ teks: 'Siram dulu', nilai: false, kelas: 'kedua' }, { teks: 'Tetap tidur', nilai: true, kelas: 'utama' }],
  }))) return;
  if (!s) return;
  const r = tidur(k);
  s.modeKompos = false;
  simpan();
  render();
  const baris = [];
  if (r.tumbuh) baris.push(`🌱 ${r.tumbuh} tanaman tumbuh.`);
  for (const x of r.tahapBaru) baris.push(`✨ ${TANAMAN[x.id].nama} di petak ${x.petak + 1} sekarang: ${TANAMAN[x.id].tahap[x.tahap].toLowerCase()}.`);
  if (r.pulih) baris.push(`💚 ${r.pulih} tanaman segar kembali.`);
  if (r.layu) baris.push(`🥀 ${r.layu} tanaman layu karena 2 hari tidak disiram. Siram supaya segar lagi.`);
  if (r.produk) baris.push(`🥚 Hewan ternak menghasilkan ${r.produk} produk. Ambil di kandang.`);
  if (r.hujan) baris.push(`🌧️ ${INFO_HUJAN}`);
  if (!baris.length) baris.push('Malam yang tenang.');
  await modal({
    judul: `☀️ Selamat pagi! Hari ke-${k.hari}`,
    isi: el('ul', { class: 'kb-ringkasan' }, baris.map(b => el('li', {}, b))),
    tombol: [{ teks: 'Bismillah, mulai hari', nilai: true, kelas: 'utama' }],
  });
}

export default {
  id: 'kebun',
  nama: 'Kebun Ceria',
  deskripsi: 'Tanam, siram, dan panen sayur serta pelihara ternak. Belajar siklus tumbuhan dan pecahan saat berbagi panen.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: ['ipa', 'matematika'],
  css: 'css/kebun.css',

  mount(container, ctx) {
    s = {
      ctx, k: rapikan(ctx.store.get('kebun')), tab: 'gudang', modeKompos: false, sibuk: false,
      el: {
        bilah: el('div', { class: 'kb-bilah' }),
        petak: el('div', { class: 'kb-grid' }),
        kandang: el('div', { class: 'kb-kandang' }),
        tab: el('div', { class: 'kb-tab', role: 'tablist' }),
        panel: el('div', { class: 'kb-panel' }),
        pesan: el('p', { class: 'kb-pesan', 'aria-live': 'polite' }),
      },
    };
    if (!ctx.store.get('kebun')) simpan();
    const e = s.el;
    container.append(el('div', { class: 'kb' },
      e.bilah,
      e.pesan,
      el('div', { class: 'kb-utama' },
        el('div', {},
          el('h2', {}, '🌱 Kebun'),
          el('p', { class: 'catatan' }, 'Ketuk petak: tanam benih, siram (💧), atau panen (✨).'),
          e.petak,
          el('h2', {}, '🏡 Kandang'),
          e.kandang),
        el('div', { class: 'kb-kanan panel' }, e.tab, e.panel))));
    pesan(`Assalamu'alaikum, ${ctx.profil.nama}! Selamat berkebun.`);
    render();
  },

  unmount() {
    s = null;
  },

  simpan,

  progres(store) {
    const k = store.get('kebun');
    if (!k) return { bintang: 0, teks: 'Belum pernah berkebun' };
    const n = k.catatan?.panen ?? 0;
    return { bintang: n >= 40 ? 3 : n >= 15 ? 2 : n >= 3 ? 1 : 0, teks: `Hari ke-${k.hari} · ${n} kali panen · kebaikan ${k.kebaikan ?? 0}` };
  },
};

