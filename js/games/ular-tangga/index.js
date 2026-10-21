// Ular Tangga Matematika — 1 sampai 4 pemain di satu perangkat (boleh melawan komputer).
// Petak ❓ memberi soal matematika sesuai kelas masing-masing pemain.

import { el, pixelSvg, konfirmasi, pujian } from '../../core/ui.js';
import { KELAS_TERSEDIA } from '../../core/profile.js';
import { AKHIR, BONUS, TANGGA, ULAR, SOAL, lintasan, efekPetak, koordinat, lemparDadu } from './aturan.js';

const ikon = pixelSvg([
  '............',
  '.y........g.',
  '.yyyy....gg.',
  '.y..y...gg..',
  '.yyyy..gg...',
  '.y..y.gg....',
  '.yyyy.g.....',
  '.y..ygg.....',
  '.yyyygg.....',
  '.y..y.gggg..',
  '.yyyy....kg.',
  '.y..y.......',
], { y: '#c48a4a', g: '#2f9e44', k: '#1f2430' }, { latar: '#ffe8b8', pad: 1 });

const WARNA = ['#e03131', '#1c6fd1', '#2f9e44', '#f08c00'];
const PELUANG_KOMPUTER_BENAR = 0.65;
const tunggu = ms => new Promise(r => setTimeout(r, ms));

let s = null;

// ---------- Gambar papan ----------

function svgTangga(a, b) {
  const p = koordinat(a);
  const q = koordinat(b);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const panjang = Math.hypot(dx, dy);
  const nx = (-dy / panjang) * 2.2;
  const ny = (dx / panjang) * 2.2;
  let anak = '';
  for (let t = 4 / panjang; t < 1; t += 5 / panjang) {
    const x = p.x + dx * t;
    const y = p.y + dy * t;
    anak += `<line x1="${(x - nx).toFixed(2)}" y1="${(y - ny).toFixed(2)}" x2="${(x + nx).toFixed(2)}" y2="${(y + ny).toFixed(2)}"/>`;
  }
  return `<g class="ut-tangga" stroke="#7a4f28" stroke-linecap="round">
    <line x1="${p.x - nx}" y1="${p.y - ny}" x2="${q.x - nx}" y2="${q.y - ny}" stroke-width="1.3"/>
    <line x1="${p.x + nx}" y1="${p.y + ny}" x2="${q.x + nx}" y2="${q.y + ny}" stroke-width="1.3"/>
    <g stroke-width="0.9">${anak}</g></g>`;
}

function svgUlar(kepala, ekor) {
  const h = koordinat(kepala);
  const t = koordinat(ekor);
  const dx = t.x - h.x;
  const dy = t.y - h.y;
  const panjang = Math.hypot(dx, dy);
  const nx = (-dy / panjang) * 6;
  const ny = (dx / panjang) * 6;
  const c1 = `${(h.x + dx / 3 + nx).toFixed(2)} ${(h.y + dy / 3 + ny).toFixed(2)}`;
  const c2 = `${(h.x + (2 * dx) / 3 - nx).toFixed(2)} ${(h.y + (2 * dy) / 3 - ny).toFixed(2)}`;
  const d = `M${h.x} ${h.y} C${c1} ${c2} ${t.x} ${t.y}`;
  return `<g class="ut-ular">
    <path d="${d}" fill="none" stroke="#1b5e20" stroke-width="3.6" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#51cf66" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="2 1.5"/>
    <circle cx="${h.x}" cy="${h.y}" r="2.6" fill="#2f9e44" stroke="#1b5e20" stroke-width="0.8"/>
    <circle cx="${h.x - 0.9}" cy="${h.y - 0.6}" r="0.55" fill="#fff"/><circle cx="${h.x + 0.9}" cy="${h.y - 0.6}" r="0.55" fill="#fff"/></g>`;
}

function buatPapan() {
  const petak = [];
  for (let v = 0; v < 10; v++) {
    for (let c = 0; c < 10; c++) {
      const baris = 9 - v;
      const n = baris * 10 + (baris % 2 === 0 ? c : 9 - c) + 1;
      const soal = SOAL.includes(n);
      const label = `Petak ${n}${soal ? ', soal' : ''}${TANGGA[n] ? `, tangga ke ${TANGGA[n]}` : ''}${ULAR[n] ? `, ular ke ${ULAR[n]}` : ''}`;
      petak.push(el('div', { class: `ut-petak${(v + c) % 2 ? ' gelap' : ''}${soal ? ' soal' : ''}`, role: 'img', 'aria-label': label },
        el('span', { class: 'ut-nomor' }, n),
        soal && el('span', { class: 'ut-tanya', 'aria-hidden': 'true' }, '?'),
        n === AKHIR && el('span', { class: 'ut-finis', 'aria-hidden': 'true' }, '🏁')));
    }
  }
  const gambar = Object.entries(TANGGA).map(([a, b]) => svgTangga(+a, b)).join('') +
    Object.entries(ULAR).map(([a, b]) => svgUlar(+a, b)).join('');
  return el('div', { class: 'ut-papan' },
    el('div', { class: 'ut-grid' }, petak),
    el('div', { class: 'ut-gambar', html: `<svg viewBox="0 0 100 100" aria-hidden="true">${gambar}</svg>` }));
}

const TITIK = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[25, 25], [50, 50], [75, 75]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]], 6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]] };
const svgDadu = n => `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#1f2430" stroke-width="6"/>${TITIK[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#1f2430"/>`).join('')}</svg>`;

// ---------- Penyimpanan ----------

function simpan() {
  if (!s?.pemain) return;
  s.ctx.store.set('permainan', { pemain: s.pemain, giliran: s.giliran, selesai: s.selesai, catatan: s.catatan.slice(-6) });
}

// ---------- Atur pemain ----------

function pemainBawaan(ctx) {
  return [
    { nama: ctx.profil.nama, kelas: ctx.kelas, jenis: 'manusia', profil: true },
    { nama: 'Komputer', kelas: ctx.kelas, jenis: 'komputer', profil: false },
  ];
}

function tampilAtur() {
  const { ctx } = s;
  const tersimpan = ctx.store.get('permainan');
  const bisaLanjut = tersimpan && !tersimpan.selesai && Array.isArray(tersimpan.pemain) && tersimpan.pemain.length >= 2;
  let daftar = (ctx.store.get('pemainTerakhir') ?? pemainBawaan(ctx)).map(p => ({ ...p }));
  const wadah = el('div', { class: 'ut-daftar-pemain' });
  const galat = el('p', { class: 'galat', role: 'alert' });

  function gambar() {
    wadah.replaceChildren(...daftar.map((p, i) => {
      const nama = el('input', { class: 'masukan', type: 'text', maxlength: '12', 'aria-label': `Nama pemain ${i + 1}`, value: p.nama });
      nama.addEventListener('input', () => { p.nama = nama.value; });
      const kelas = el('select', { class: 'masukan', 'aria-label': `Kelas pemain ${i + 1}` },
        KELAS_TERSEDIA.map(k => el('option', { value: String(k), selected: k === p.kelas }, `Kelas ${k}`)));
      kelas.addEventListener('change', () => { p.kelas = Number(kelas.value); });
      const jenis = el('select', { class: 'masukan', 'aria-label': `Jenis pemain ${i + 1}`, disabled: p.profil },
        el('option', { value: 'manusia', selected: p.jenis === 'manusia' }, 'Manusia'),
        el('option', { value: 'komputer', selected: p.jenis === 'komputer' }, 'Komputer'));
      jenis.addEventListener('change', () => { p.jenis = jenis.value; });
      return el('div', { class: 'ut-baris-pemain' },
        el('span', { class: 'ut-titik', style: { background: WARNA[i] }, 'aria-hidden': 'true' }),
        nama, kelas, jenis,
        daftar.length > 2 && !p.profil && el('button', {
          type: 'button', class: 'tombol kedua kecil', 'aria-label': `Hapus pemain ${i + 1}`,
          onclick: () => { daftar.splice(i, 1); gambar(); },
        }, '✕'));
    }));
  }
  gambar();

  function mulai() {
    const nama = daftar.map(p => p.nama.replace(/\s+/g, ' ').trim());
    if (nama.some(n => !n)) { galat.textContent = 'Setiap pemain harus punya nama.'; return; }
    if (new Set(nama).size !== nama.length) { galat.textContent = 'Nama pemain tidak boleh sama.'; return; }
    daftar = daftar.map((p, i) => ({ ...p, nama: nama[i] }));
    ctx.store.set('pemainTerakhir', daftar);
    mulaiPermainan({ pemain: daftar.map((p, i) => ({ ...p, warna: WARNA[i], posisi: 0 })), giliran: 0, selesai: false, catatan: [] });
  }

  s.wadah.replaceChildren(el('div', { class: 'ut-atur' },
    bisaLanjut && el('section', { class: 'panel ut-lanjut' },
      el('div', {}, el('h2', {}, 'Lanjutkan permainan'),
        el('p', {}, tersimpan.pemain.map(p => `${p.nama} di petak ${p.posisi}`).join(' · '))),
      el('button', { type: 'button', class: 'tombol utama', onclick: () => mulaiPermainan(tersimpan) }, 'Lanjutkan')),
    el('section', { class: 'panel' },
      el('h2', {}, 'Atur pemain'),
      el('p', { class: 'catatan' }, 'Setiap pemain mendapat soal sesuai kelasnya sendiri. Statistik soal hanya dicatat untuk pemain pemilik profil ini.'),
      wadah,
      daftar.length < 4 && el('button', {
        type: 'button', class: 'tombol kedua', onclick: () => {
          if (daftar.length >= 4) return;
          daftar.push({ nama: `Pemain ${daftar.length + 1}`, kelas: ctx.kelas, jenis: 'manusia', profil: false });
          tampilUlang();
        },
      }, '+ Tambah pemain'),
      galat,
      el('div', { class: 'baris-tombol' },
        el('button', { type: 'button', class: 'tombol utama', onclick: mulai }, 'Mulai bermain'))),
    el('section', { class: 'panel ut-aturan' },
      el('h2', {}, 'Aturan'),
      el('ul', {},
        el('li', {}, 'Lempar dadu lalu majukan pionmu.'),
        el('li', {}, '🪜 Berhenti di kaki tangga: naik ke atas. 🐍 Berhenti di kepala ular: turun ke ekornya.'),
        el('li', {}, `❓ Berhenti di petak soal: jawab soal matematika. Benar = maju ${BONUS} petak bonus. Salah = tetap di tempat.`),
        el('li', {}, 'Pemain pertama yang mencapai petak 100 menang!')))));

  function tampilUlang() {
    // Simpan isian lalu gambar ulang seluruh layar (tombol tambah bisa hilang saat 4 pemain).
    s.ctx.store.set('pemainTerakhir', daftar);
    tampilAtur();
  }
}

// ---------- Permainan ----------

function mulaiPermainan(data) {
  s.pemain = data.pemain.map(p => ({ ...p }));
  s.giliran = data.giliran ?? 0;
  s.selesai = !!data.selesai;
  s.catatan = [...(data.catatan ?? [])];
  s.sibuk = false;
  s.token++;

  const e = {
    papan: buatPapan(),
    status: el('p', { class: 'ut-status', 'aria-live': 'polite' }),
    dadu: el('div', { class: 'ut-dadu', html: svgDadu(1), role: 'img', 'aria-label': 'Dadu' }),
    lempar: el('button', { type: 'button', class: 'tombol utama ut-tombol-lempar', 'data-sunyi': true, onclick: () => giliran() }, '🎲 Lempar dadu'),
    daftar: el('ol', { class: 'ut-skor' }),
    log: el('ul', { class: 'ut-log', 'aria-live': 'polite' }),
    akhir: el('div', { class: 'panel ut-akhir', hidden: true }),
  };
  s.el = e;
  s.pion = s.pemain.map((p, i) => {
    const b = el('div', { class: 'ut-pion', style: { background: p.warna }, title: p.nama }, p.nama.charAt(0).toUpperCase());
    e.papan.append(b);
    return b;
  });

  s.wadah.replaceChildren(el('div', { class: 'ut' },
    el('div', { class: 'ut-kiri' }, e.papan),
    el('div', { class: 'ut-kanan' },
      e.status,
      el('div', { class: 'ut-aksi' }, e.dadu, e.lempar),
      e.akhir,
      e.daftar,
      el('h2', {}, 'Kejadian'),
      e.log,
      el('div', { class: 'baris-tombol' },
        el('button', {
          type: 'button', class: 'tombol kedua kecil',
          onclick: async () => {
            if (!s.selesai && !(await konfirmasi('Permainan yang sedang berjalan akan diakhiri.', { judul: 'Atur ulang pemain?', ya: 'Ya' }))) return;
            if (!s) return;
            s.token++;
            s.ctx.store.remove('permainan');
            tampilAtur();
          },
        }, '← Atur pemain')))));
  render();
  posisikanSemua();
  jalankanKomputerJikaPerlu();
}

function posisikanPion(i, cepat = false) {
  const p = s.pemain[i];
  const n = Math.max(1, p.posisi);
  const k = koordinat(n);
  const sePetak = s.pemain.filter(q => Math.max(1, q.posisi) === n);
  const urutan = sePetak.indexOf(p);
  const geser = sePetak.length > 1 ? [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]][urutan] : [0, 0];
  const b = s.pion[i];
  b.style.transitionDuration = cepat ? '0.15s' : '0.6s';
  b.style.left = `${k.x + geser[0]}%`;
  b.style.top = `${k.y + geser[1]}%`;
  b.style.opacity = p.posisi === 0 ? '0.75' : '1';
  b.setAttribute('aria-label', `${p.nama} di petak ${p.posisi || 'awal'}`);
}

const posisikanSemua = (cepat = true) => s.pemain.forEach((_, i) => posisikanPion(i, cepat));

function render() {
  const p = s.pemain[s.giliran];
  if (!s.selesai) {
    s.el.status.textContent = p.jenis === 'komputer' ? `Giliran ${p.nama} (komputer)…` : `Giliran ${p.nama}! Lempar dadunya.`;
    s.el.status.style.borderColor = p.warna;
  }
  s.el.lempar.disabled = s.selesai || s.sibuk || p.jenis === 'komputer';
  s.el.daftar.replaceChildren(...s.pemain.map((q, i) => el('li', { class: i === s.giliran && !s.selesai ? 'aktif' : '' },
    el('span', { class: 'ut-titik', style: { background: q.warna }, 'aria-hidden': 'true' }),
    el('span', {}, `${q.nama} (kelas ${q.kelas}${q.jenis === 'komputer' ? ', komputer' : ''})`),
    el('strong', {}, q.posisi ? `Petak ${q.posisi}` : 'Belum mulai'))));
  s.el.log.replaceChildren(...s.catatan.slice(-6).reverse().map(t => el('li', {}, t)));
}

function catat(teks) {
  s.catatan.push(teks);
  render();
}

async function animasiDadu() {
  const hasil = lemparDadu();
  s.el.dadu.classList.add('berputar');
  for (let i = 0; i < 8; i++) {
    if (!s) return hasil;
    s.el.dadu.innerHTML = svgDadu(lemparDadu());
    s.ctx.audio.main('klik');
    await tunggu(70);
  }
  if (!s) return hasil;
  s.el.dadu.innerHTML = svgDadu(hasil);
  s.el.dadu.setAttribute('aria-label', `Dadu: ${hasil}`);
  s.el.dadu.classList.remove('berputar');
  await tunggu(250);
  return hasil;
}

async function maju(i, langkah) {
  for (const n of langkah) {
    if (!s) return; // pemain keluar dari game di tengah animasi
    s.pemain[i].posisi = n;
    posisikanSemua(true);
    await tunggu(190);
  }
}

async function pindahLangsung(i, ke) {
  s.pemain[i].posisi = ke;
  posisikanPion(i, false);
  await tunggu(700);
  if (s) posisikanSemua(true);
}

async function terapkanEfek(i, bolehSoal, token) {
  const p = s.pemain[i];
  const e = efekPetak(p.posisi);
  if (e.jenis === 'tangga') {
    catat(`🪜 ${p.nama} naik tangga dari ${p.posisi} ke ${e.ke}!`);
    s.ctx.audio.main('benar');
    await pindahLangsung(i, e.ke);
  } else if (e.jenis === 'ular') {
    catat(`🐍 ${p.nama} turun lewat ular dari ${p.posisi} ke ${e.ke}.`);
    s.ctx.audio.main('salah');
    await pindahLangsung(i, e.ke);
  } else if (e.jenis === 'soal' && bolehSoal) {
    let benar;
    if (p.jenis === 'komputer') {
      await tunggu(600);
      benar = Math.random() < PELUANG_KOMPUTER_BENAR;
    } else {
      const opsi = { mapel: 'matematika', kelas: p.kelas, maksPercobaan: 2, judul: `❓ Soal untuk ${p.nama}` };
      if (!p.profil) Object.assign(opsi, { idProfil: null, catatStatistik: false });
      const hasil = await s.ctx.quiz.tanya(opsi);
      if (!s || token !== s.token) return;
      benar = hasil.benar || !hasil.soal;
    }
    if (benar) {
      catat(`❓ ${p.nama} menjawab benar! Bonus maju ${BONUS} petak.`);
      await maju(i, lintasan(p.posisi, BONUS));
      if (p.posisi < AKHIR) await terapkanEfek(i, false, token); // petak hasil bonus tidak memberi soal lagi
    } else {
      catat(`❓ ${p.nama} belum benar, tetap di petak ${p.posisi}.`);
    }
  }
}

async function giliran() {
  if (s.sibuk || s.selesai) return;
  const token = s.token;
  s.sibuk = true;
  render();
  const i = s.giliran;
  const p = s.pemain[i];
  const d = await animasiDadu();
  if (!s || token !== s.token) return;
  catat(`🎲 ${p.nama} mendapat angka ${d}.`);
  await maju(i, lintasan(p.posisi, d));
  if (!s || token !== s.token) return;
  if (p.posisi < AKHIR) await terapkanEfek(i, true, token);
  if (!s || token !== s.token) return;
  if (p.posisi >= AKHIR) {
    menang(i);
    return;
  }
  s.giliran = (s.giliran + 1) % s.pemain.length;
  s.sibuk = false;
  simpan();
  render();
  jalankanKomputerJikaPerlu();
}

function jalankanKomputerJikaPerlu() {
  if (s.selesai || s.pemain[s.giliran].jenis !== 'komputer') return;
  const token = s.token;
  setTimeout(() => { if (s && token === s.token) giliran(); }, 900);
}

function menang(i) {
  const p = s.pemain[i];
  s.selesai = true;
  s.sibuk = false;
  catat(`🏁 ${p.nama} sampai di petak 100 dan menang!`);
  const stat = s.ctx.store.get('statistik', { main: 0, menang: 0 });
  stat.main++;
  if (p.profil) stat.menang++;
  s.ctx.store.set('statistik', stat);
  s.ctx.audio.main('levelup');
  simpan();
  render();
  s.el.status.textContent = `🏁 ${p.nama} menang!`;
  s.el.akhir.hidden = false;
  s.el.akhir.replaceChildren(
    el('h2', {}, p.profil ? pujian() : `Selamat untuk ${p.nama}!`),
    el('p', {}, p.jenis === 'komputer' ? 'Komputer menang kali ini. Ayo coba lagi!' : `${p.nama} sampai duluan di petak 100.`),
    el('div', { class: 'baris-tombol' },
      el('button', {
        type: 'button', class: 'tombol utama',
        onclick: () => mulaiPermainan({ pemain: s.pemain.map(q => ({ ...q, posisi: 0 })), giliran: 0, selesai: false, catatan: [] }),
      }, 'Main lagi')));
}

export default {
  id: 'ular-tangga',
  nama: 'Ular Tangga Matematika',
  deskripsi: 'Main ular tangga berempat atau lawan komputer. Jawab soal matematika di petak ❓ untuk maju bonus.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: 'matematika',
  css: 'css/ular-tangga.css',

  mount(container, ctx) {
    s = { ctx, wadah: el('div', { class: 'ut-wadah' }), token: 0 };
    container.append(s.wadah);
    tampilAtur();
  },

  unmount() {
    if (s) s.token++;
    s = null;
  },

  simpan() {
    if (s && !s.sibuk) simpan();
  },

  progres(store) {
    const st = store.get('statistik');
    if (!st?.main) return { bintang: 0, teks: 'Belum pernah main' };
    return { bintang: Math.min(3, st.menang), teks: `Menang ${st.menang} dari ${st.main} permainan` };
  },
};
