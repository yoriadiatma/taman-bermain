// permainan.js — permainan catur: lawan komputer atau 2 pemain di satu perangkat.

import { el, konfirmasi } from '../../core/ui.js';
import { Catur, NAMA_BIDAK, NAMA_WARNA, namaKotak, tipe, warnaBidak, lawan, sanIndonesia } from './mesin.js';
import { buatPapan, pilihPromosi, tutupDialogPromosi } from './papan.js';
import { mintaLangkah, hentikan } from './komputer.js';
import { bacaPengaturan, ubahPengaturan, bacaStatistik, simpanStatistik } from './simpanan.js';

export const NAMA_TINGKAT = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' };

const PESAN_REMIS = {
  pat: 'Remis (pat): pemain yang mendapat giliran tidak punya langkah legal, padahal rajanya tidak sedang diskak.',
  'tiga-kali': 'Remis: posisi yang sama sudah terjadi tiga kali.',
  '50-langkah': 'Remis (aturan 50 langkah): 50 langkah berturut-turut tanpa langkah pion dan tanpa makan bidak.',
  materi: 'Remis: bidak yang tersisa tidak cukup untuk membuat skakmat.',
};

const tunggu = ms => new Promise(r => setTimeout(r, ms));

/** Muat permainan tersimpan. Mengembalikan data permainan (dengan objek Catur) atau null. */
export function muatTersimpan(store) {
  const data = store.get('permainan');
  if (!data) return null;
  try {
    const game = new Catur(data.fenAwal);
    for (const u of data.langkah) if (!game.jalan(u)) throw new Error(`langkah ${u} tidak legal`);
    return { ...data, mode: data.mode ?? 'dua', game };
  } catch (e) {
    console.warn('Permainan catur tersimpan tidak bisa dimuat:', e);
    return null;
  }
}

/**
 * Tampilkan permainan. opsi: { mode: 'dua' | 'komputer', tingkat, warnaPemain, lanjutkan, kembali() }.
 * Mengembalikan { bersihkan(), simpan() }.
 */
export function tampilPermainan(wadah, ctx, opsi) {
  const tersimpan = opsi.lanjutkan ? muatTersimpan(ctx.store) : null;
  const s = {
    mode: tersimpan?.mode ?? opsi.mode,
    tingkat: tersimpan?.tingkat ?? opsi.tingkat ?? 'mudah',
    warnaPemain: tersimpan?.warnaPemain ?? opsi.warnaPemain ?? 'w',
    game: tersimpan?.game ?? new Catur(),
    tercatat: tersimpan?.tercatat ?? false,
    pilih: null,
    tujuan: [],
    petunjuk: null,
    token: 0,
    berpikir: false,
    aktif: true,
  };
  const lawanKomputer = s.mode === 'komputer';
  const giliranManusia = () => !lawanKomputer || s.game.giliran === s.warnaPemain;

  const papan = buatPapan({ saatKlik: klikKotak });
  papan.setPutar(tersimpan?.putar ?? (lawanKomputer && s.warnaPemain === 'b'));

  const e = {
    status: el('p', { class: 'catur-status', 'aria-live': 'polite' }),
    pesan: el('p', { class: 'catur-pesan', 'aria-live': 'polite' }),
    akhir: el('div', { class: 'catur-akhir', hidden: true },
      el('button', { class: 'tombol utama', type: 'button', onclick: () => mulaiBaru(false) }, 'Main lagi'),
      el('button', { class: 'tombol kedua', type: 'button', onclick: opsi.kembali }, 'Menu catur')),
    batal: el('button', { class: 'tombol kedua', type: 'button', onclick: batalLangkah }, '↶ Batal langkah'),
    petunjuk: el('button', { class: 'tombol kedua', type: 'button', onclick: mintaPetunjuk }, '💡 Petunjuk'),
    riwayat: el('ol', { class: 'catur-riwayat', 'aria-label': 'Riwayat langkah' }),
    cekLegal: el('input', { type: 'checkbox', id: 'opsi-legal' }),
    cekTerancam: el('input', { type: 'checkbox', id: 'opsi-terancam' }),
  };
  const peng = bacaPengaturan(ctx.store);
  e.cekLegal.checked = peng.langkahLegal;
  e.cekTerancam.checked = peng.terancam;
  e.cekLegal.addEventListener('change', () => { ubahPengaturan(ctx.store, { langkahLegal: e.cekLegal.checked }); render(); });
  e.cekTerancam.addEventListener('change', () => { ubahPengaturan(ctx.store, { terancam: e.cekTerancam.checked }); render(); });

  const judul = lawanKomputer
    ? `Lawan Komputer (${NAMA_TINGKAT[s.tingkat]}) — kamu ${NAMA_WARNA[s.warnaPemain]}`
    : '2 Pemain';

  wadah.replaceChildren(el('div', { class: 'catur' },
    el('div', { class: 'catur-kiri' }, e.status, papan.elemen, e.pesan, e.akhir),
    el('div', { class: 'catur-kanan' },
      el('p', { class: 'catur-judul-mode' }, judul),
      el('div', { class: 'baris-tombol' },
        e.batal,
        e.petunjuk,
        el('button', { class: 'tombol kedua', type: 'button', onclick: () => { papan.setPutar(!papan.putar); simpan(); } }, '⇅ Putar papan'),
        el('button', { class: 'tombol kedua', type: 'button', onclick: () => mulaiBaru(true) }, 'Permainan baru'),
        el('button', { class: 'tombol kedua', type: 'button', onclick: opsi.kembali }, '← Menu catur')),
      el('div', { class: 'catur-opsi' },
        el('label', { for: 'opsi-legal' }, e.cekLegal, ' Tampilkan langkah yang boleh'),
        el('label', { for: 'opsi-terancam' }, e.cekTerancam, ' Tandai bidakku yang sedang diserang')),
      el('h2', {}, 'Riwayat langkah'),
      e.riwayat,
      el('details', { class: 'catur-bantuan' },
        el('summary', {}, 'Cara bermain & arti notasi'),
        el('p', {}, 'Ketuk bidak milikmu, lalu ketuk titik hijau untuk melangkah. Lingkaran merah berarti kamu bisa memakan bidak lawan. ' +
          'Bidak bergaris oranye sedang diserang lawan.'),
        el('p', {}, 'Notasi: R = Raja, M = Menteri, B = Benteng, G = Gajah, K = Kuda, pion tanpa huruf. ' +
          'x = makan, + = skak, # = skakmat, O-O = rokade pendek, O-O-O = rokade panjang.')))));

  // ---------- Penyimpanan & statistik ----------

  function simpan() {
    if (!s.aktif) return;
    ctx.store.set('permainan', {
      mode: s.mode, tingkat: s.tingkat, warnaPemain: s.warnaPemain,
      fenAwal: s.game.fenAwal, langkah: s.game.riwayat.map(m => m.uci),
      putar: papan.putar, tercatat: s.tercatat,
    });
  }

  function catatHasil(st) {
    if (s.tercatat) return;
    s.tercatat = true;
    const stat = bacaStatistik(ctx.store);
    if (lawanKomputer) {
      const t = stat.komputer[s.tingkat];
      if (!st.pemenang) t.remis++;
      else if (st.pemenang === s.warnaPemain) t.menang++;
      else t.kalah++;
    } else {
      const d = stat.duaPemain;
      d.selesai++;
      if (st.pemenang === 'w') d.menangPutih++;
      else if (st.pemenang === 'b') d.menangHitam++;
      else d.remis++;
    }
    simpanStatistik(ctx.store, stat);
    simpan();
  }

  // ---------- Tampilan ----------

  function pesanAkhir(st) {
    if (st.alasan !== 'skakmat') return PESAN_REMIS[st.alasan];
    if (!lawanKomputer) return `Skakmat! ${NAMA_WARNA[st.pemenang]} menang.`;
    return st.pemenang === s.warnaPemain
      ? 'Skakmat! Alhamdulillah, kamu menang!'
      : 'Skakmat. Komputer menang kali ini. Ayo coba lagi!';
  }

  function render() {
    const g = s.game;
    const st = g.status();
    const peng = bacaPengaturan(ctx.store);
    const terakhir = g.riwayat[g.riwayat.length - 1];
    // Tandai bidak milik pemain (atau milik yang sedang giliran pada mode 2 pemain) yang diserang lawan.
    const warnaDijaga = lawanKomputer ? s.warnaPemain : g.giliran;
    const terancam = new Set();
    if (peng.terancam && !st.selesai) {
      g.papan.forEach((p, sq) => {
        if (p && warnaBidak(p) === warnaDijaga && tipe(p) !== 'k' && g.diserang(sq, lawan(warnaDijaga))) terancam.add(sq);
      });
    }
    papan.gambar({
      papan: g.papan,
      pilih: s.pilih,
      tujuan: peng.langkahLegal ? new Map(s.tujuan.map(m => [m.ke, !!m.makan])) : new Map(),
      terakhir,
      diskak: st.skak ? g.raja[g.giliran] : -1,
      terancam,
      petunjuk: s.petunjuk,
      kunci: !giliranManusia() || st.selesai,
    });

    if (st.selesai) {
      e.status.textContent = pesanAkhir(st);
      e.status.className = 'catur-status selesai';
      catatHasil(st);
    } else if (lawanKomputer && !giliranManusia()) {
      e.status.textContent = 'Komputer sedang berpikir…';
      e.status.className = `catur-status giliran-${g.giliran}`;
    } else {
      const siapa = lawanKomputer ? `Giliranmu (${NAMA_WARNA[g.giliran]})` : `Giliran ${NAMA_WARNA[g.giliran]}`;
      e.status.textContent = siapa + (st.skak ? ' — Skak! Selamatkan rajamu.' : '');
      e.status.className = `catur-status giliran-${g.giliran}${st.skak ? ' skak' : ''}`;
    }
    e.akhir.hidden = !st.selesai;
    e.batal.disabled = g.riwayat.length === 0;
    e.petunjuk.disabled = st.selesai || !giliranManusia() || s.berpikir;

    const baris = [];
    g.riwayat.forEach((m, i) => {
      if (m.warna === 'w' || i === 0) baris.push({ w: '', b: '' });
      baris[baris.length - 1][m.warna] = sanIndonesia(m.san);
    });
    e.riwayat.replaceChildren(...baris.map((b, i) => el('li', {},
      el('span', { class: 'no' }, `${i + 1}.`), el('span', {}, b.w || '…'), el('span', {}, b.b))));
    e.riwayat.scrollTop = e.riwayat.scrollHeight;
  }

  const pesan = teks => { e.pesan.textContent = teks; };

  // ---------- Langkah ----------

  async function giliranKomputer() {
    if (!lawanKomputer || giliranManusia() || s.game.status().selesai) return;
    const token = ++s.token;
    const fen = s.game.fen();
    const mulai = Date.now();
    render();
    let hasil;
    try {
      hasil = await mintaLangkah(fen, s.tingkat);
    } catch (err) {
      console.error(err);
      if (s.aktif && token === s.token) pesan('Komputer mengalami masalah. Tekan "Batal langkah" lalu coba lagi.');
      return;
    }
    await tunggu(Math.max(0, 500 - (Date.now() - mulai))); // beri jeda agar langkah komputer terlihat
    if (!s.aktif || token !== s.token || s.game.fen() !== fen || !hasil.uci) return;
    const m = s.game.jalan(hasil.uci);
    if (!m) return;
    pesan(m.makan ? `Komputer: ${NAMA_BIDAK[tipe(m.bidak)]} memakan ${NAMA_BIDAK[tipe(m.makan)].toLowerCase()} (${sanIndonesia(m.san)}).` : `Komputer melangkah ${sanIndonesia(m.san)}.`);
    simpan();
    render();
    if (s.game.status().selesai) ctx.audio.main(s.game.status().pemenang === s.warnaPemain ? 'levelup' : 'salah');
  }

  async function jalankan(pilihan) {
    let m = pilihan[0];
    if (pilihan.length > 1) {
      const pr = await pilihPromosi(warnaBidak(m.bidak));
      if (!s.aktif || !pr) return;
      m = pilihan.find(x => x.promosi === pr);
    }
    const hasil = s.game.jalan(m);
    if (!hasil) return;
    s.pilih = null;
    s.tujuan = [];
    s.petunjuk = null;
    pesan(hasil.makan ? `${NAMA_BIDAK[tipe(hasil.bidak)]} memakan ${NAMA_BIDAK[tipe(hasil.makan)].toLowerCase()}.` : '');
    simpan();
    render();
    const st = s.game.status();
    if (st.selesai) ctx.audio.main(st.pemenang && (!lawanKomputer || st.pemenang === s.warnaPemain) ? 'levelup' : 'benar');
    else giliranKomputer();
  }

  function klikKotak(sq) {
    const g = s.game;
    if (g.status().selesai) return;
    if (!giliranManusia()) {
      pesan('Tunggu sebentar, komputer sedang berpikir.');
      return;
    }
    const p = g.papan[sq];
    const cocok = s.tujuan.filter(m => m.ke === sq);
    if (s.pilih !== null && cocok.length) {
      jalankan(cocok);
      return;
    }
    if (p && warnaBidak(p) === g.giliran) {
      if (s.pilih === sq) {
        s.pilih = null;
        s.tujuan = [];
        pesan('');
      } else {
        s.pilih = sq;
        s.tujuan = g.langkahLegal(sq);
        if (s.tujuan.length) pesan('');
        else if (g.skak()) pesan('Rajamu sedang diskak! Pilih bidak yang bisa menyelamatkan raja.');
        else if (g.terkunci(sq)) pesan(`${NAMA_BIDAK[tipe(p)]} ini tidak boleh bergerak, karena rajamu akan terancam.`);
        else pesan(`${NAMA_BIDAK[tipe(p)]} ini belum punya langkah. Coba bidak lain.`);
      }
    } else {
      if (s.pilih !== null) {
        const bolehTanpaSorot = !bacaPengaturan(ctx.store).langkahLegal;
        pesan(bolehTanpaSorot ? 'Langkah itu tidak boleh. Coba kotak lain.' : 'Langkah itu tidak boleh. Pilih salah satu titik hijau.');
      } else if (p) {
        pesan(lawanKomputer ? 'Itu bidak komputer. Ketuk bidakmu sendiri.' : `Sekarang giliran ${NAMA_WARNA[g.giliran]}.`);
      }
      s.pilih = null;
      s.tujuan = [];
    }
    render();
  }

  function batalLangkah() {
    const g = s.game;
    if (!g.riwayat.length) return;
    s.token++; // abaikan jawaban komputer yang masih dihitung
    g.batal();
    // Lawan komputer: batalkan sampai kembali ke giliran pemain.
    while (lawanKomputer && g.riwayat.length && g.giliran !== s.warnaPemain) g.batal();
    s.pilih = null;
    s.tujuan = [];
    s.petunjuk = null;
    if (s.tercatat && !g.status().selesai) s.tercatat = false;
    pesan('Langkah dibatalkan.');
    simpan();
    render();
    giliranKomputer();
  }

  async function mintaPetunjuk() {
    if (!giliranManusia() || s.berpikir) return;
    s.berpikir = true;
    pesan('Mencari langkah yang bagus…');
    render();
    const fen = s.game.fen();
    let hasil = null;
    try { hasil = await mintaLangkah(fen, 'petunjuk'); } catch (err) { console.error(err); }
    s.berpikir = false;
    if (!s.aktif || s.game.fen() !== fen || !hasil?.uci) { if (s.aktif) render(); return; }
    const m = s.game.langkahLegal().find(x => Catur.uci(x) === hasil.uci);
    s.petunjuk = { dari: m.dari, ke: m.ke };
    pesan(`Petunjuk: coba gerakkan ${NAMA_BIDAK[tipe(m.bidak)]} dari ${namaKotak(m.dari)} ke ${namaKotak(m.ke)}.`);
    render();
  }

  async function mulaiBaru(tanya) {
    if (tanya && s.game.riwayat.length && !s.game.status().selesai &&
      !(await konfirmasi('Permainan yang sedang berjalan akan dihapus.', { judul: 'Mulai permainan baru?', ya: 'Mulai baru' }))) return;
    if (!s.aktif) return;
    s.token++;
    s.game = new Catur();
    s.pilih = null;
    s.tujuan = [];
    s.petunjuk = null;
    s.tercatat = false;
    pesan('');
    simpan();
    render();
    giliranKomputer();
  }

  simpan();
  render();
  giliranKomputer();

  return {
    simpan,
    bersihkan() {
      simpan();
      s.aktif = false;
      s.token++;
      hentikan();
      tutupDialogPromosi();
    },
  };
}
