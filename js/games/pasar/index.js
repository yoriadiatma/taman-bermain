// Pasar Mini — belajar penjumlahan, pengurangan, kembalian, persen, dan mengenal uang rupiah.
// Mode: Jadi Kasir (utama), Jadi Pembeli, Kenali Uang. Nilai adab: salam, jujur, infak.

import { el, isiUlang, pixelSvg, pujian, semangat, bintang, toast, modal } from '../../core/ui.js';
import { PECAHAN } from '../../../data/pasar.js';
import { rupiah, susunanTersedikit, pecahanUntuk } from './uang.js';
import { buatLaci, gambarUang } from './laci.js';
import {
  PELANGGAN_PER_HARI, levelToko, buatPembeli, soalTotal, soalKembalian, bintangPelanggan,
  soalInfak, buatTugasBelanja, buatTargetUang,
} from './skenario.js';

const ikon = pixelSvg([
  '............',
  'rwrwrwrwrwrw',
  'rwrwrwrwrwrw',
  '.rwrwrwrwrw.',
  '.k........k.',
  '.k.yy..gg.k.',
  '.k.yy..gg.k.',
  '.kbbbbbbbbk.',
  '.kb......bk.',
  '.kb.oo...bk.',
  '.kb.oo...bk.',
  '.kbbbbbbbbk.',
], { r: '#e03131', w: '#ffffff', k: '#5c3d20', y: '#ffd43b', g: '#51cf66', b: '#8b5a2b', o: '#f08c00' }, { latar: '#a5d8ff', pad: 1 });

const TOKO_KOSONG = { pelanggan: 0, pendapatan: 0, infak: 0, hari: 1, pelangganHari: 0, pendapatanHari: 0, jujur: 0, bintang: 0 };

let s = null;

const tokoData = () => ({ ...TOKO_KOSONG, ...s.ctx.store.get('toko', {}) });
const simpanToko = t => s.ctx.store.set('toko', t);

function pesan(elemen, teks, jenis = '') {
  elemen.textContent = teks;
  elemen.className = `ps-pesan ${jenis}`;
}

// ---------- Kerangka ----------

const MODE = { kasir: '🧾 Jadi Kasir', pembeli: '🛒 Jadi Pembeli', uang: '💰 Kenali Uang' };

function kepalaToko() {
  const t = tokoData();
  return el('div', { class: 'ps-toko panel' },
    el('div', { class: 'ps-papan-nama' }, `🏪 Warung ${s.ctx.profil.nama}`),
    el('div', { class: 'ps-statistik' },
      el('span', {}, `⭐ Level toko ${levelToko(t.pelanggan)}`),
      el('span', {}, `👥 ${t.pelanggan} pelanggan`),
      el('span', {}, `💵 Pendapatan ${rupiah(t.pendapatan)}`),
      el('span', {}, `🤲 Infak ${rupiah(t.infak)}`),
      el('span', {}, `📅 Hari ke-${t.hari} (${t.pelangganHari}/${PELANGGAN_PER_HARI} pelanggan)`)));
}

/** Gambar ulang papan nama warung setelah angka-angkanya berubah. */
function perbaruiKepala() {
  const baru = kepalaToko();
  s.el.kepala.replaceWith(baru);
  s.el.kepala = baru;
}

function tampil() {
  s.el = { isi: el('div', { class: 'ps-isi' }), kepala: kepalaToko() };
  s.wadah.replaceChildren(el('div', { class: 'ps' },
    s.el.kepala,
    el('div', { class: 'ps-tab', role: 'tablist' }, Object.entries(MODE).map(([id, nama]) => el('button', {
      type: 'button', role: 'tab', class: 'tombol kedua', 'aria-selected': String(id === s.mode),
      onclick: () => { s.mode = id; s.ctx.store.set('mode', id); tampil(); },
    }, nama))),
    s.el.isi));
  ({ kasir: modeKasir, pembeli: modePembeli, uang: modeUang })[s.mode]();
}

// ---------- Jadi Kasir ----------

function modeKasir() {
  const t = tokoData();
  const p = buatPembeli(s.ctx.kelas, levelToko(t.pelanggan));
  const hasil = { totalPertama: false, kembalianPertama: false, percobaanKembalian: 0, lembar: 0 };
  const e = {
    langkah: el('div', { class: 'ps-langkah' }),
    pesan: el('p', { class: 'ps-pesan', 'aria-live': 'polite' }),
    totalTeks: el('strong', {}, '???'),
  };

  const struk = el('div', { class: 'ps-struk' },
    el('p', { class: 'ps-judul-kecil' }, '🧾 Belanjaan'),
    el('ul', {}, p.daftar.map(d => el('li', {},
      el('span', { class: 'ps-emoji', 'aria-hidden': 'true' }, d.barang.emoji),
      el('span', {}, `${d.jumlah} × ${d.barang.nama}`),
      el('span', { class: 'ps-harga' }, `@ ${rupiah(d.harga)}`)))),
    p.diskon > 0 && el('p', { class: 'ps-diskon' }, `🏷️ Diskon ${p.diskon}% untuk semua belanjaan`),
    el('p', { class: 'ps-total' }, 'Total: ', e.totalTeks));

  isiUlang(s.el.isi, el('div', { class: 'ps-kasir' },
    el('div', { class: 'ps-pembeli panel' },
      el('div', { class: 'ps-wajah', 'aria-hidden': 'true' }, p.pembeli.emoji),
      el('div', {},
        el('p', { class: 'ps-ucapan' }, `"Assalamu'alaikum! Saya ${p.pembeli.nama}. Saya mau membeli ini, ya."`),
        struk)),
    el('div', { class: 'ps-kanan' }, e.langkah, e.pesan)));

  // Langkah 1: hitung total
  function langkahTotal() {
    isiUlang(e.langkah,
      el('p', { class: 'label-besar' }, 'Langkah 1: Hitung total belanjaan'),
      el('button', { type: 'button', class: 'tombol utama', onclick: hitungTotal }, '🧮 Hitung total'));
  }

  async function hitungTotal() {
    const r = await s.ctx.quiz.tanya({ soal: soalTotal(p, s.ctx.kelas), judul: '🧮 Hitung total belanjaan', maksPercobaan: 3 });
    if (!s) return;
    hasil.totalPertama = r.benarPertama;
    e.totalTeks.textContent = rupiah(p.total);
    pesan(e.pesan, r.benar ? `${pujian()} Totalnya ${rupiah(p.total)}.` : `Totalnya ${rupiah(p.total)}. Tidak apa-apa, ayo lanjut!`, r.benar ? 'benar' : '');
    // Sesekali pembeli tidak sengaja memberi uang lebih: kesempatan berbuat jujur.
    if (Math.random() < 0.2) await ujianJujur();
    if (!s) return;
    langkahKembalian();
  }

  async function ujianJujur() {
    const lebih = 1000;
    const pilihan = await modal({
      judul: '🤔 Uangnya kelebihan!',
      isi: `${p.pembeli.nama} tidak sengaja memberi uang lebih ${rupiah(lebih)} di luar pembayaran. Apa yang kamu lakukan?`,
      tombol: [
        { teks: 'Simpan saja', nilai: 'simpan', kelas: 'kedua' },
        { teks: 'Kembalikan uangnya', nilai: 'kembalikan', kelas: 'utama' },
      ],
    });
    if (!s) return;
    const t = tokoData();
    if (pilihan === 'kembalikan') {
      t.jujur++;
      simpanToko(t);
      perbaruiKepala();
      s.ctx.audio.main('benar');
      toast(`MasyaAllah, kamu jujur! ${p.pembeli.nama} berterima kasih. Pedagang yang jujur disukai pembeli.`, 'sukses', 4000);
    } else {
      await modal({ judul: 'Ayo berbuat jujur', isi: 'Uang itu bukan milik kita, jadi harus dikembalikan kepada pemiliknya. Yuk, kembalikan uangnya.', tombol: [{ teks: 'Kembalikan uangnya', nilai: true, kelas: 'utama' }] });
      toast(`Alhamdulillah, uangnya sudah dikembalikan kepada ${p.pembeli.nama}.`, 'info', 3000);
    }
  }

  // Langkah 2: susun kembalian
  function langkahKembalian() {
    const dibayar = p.bayar.reduce((a, b) => a + b, 0);
    const uangDiterima = el('div', { class: 'ps-diterima' }, p.bayar.map(n => gambarUang(pecahanUntuk(n), true)));
    if (p.kembalian === 0) {
      hasil.kembalianPertama = true;
      isiUlang(e.langkah,
        el('p', { class: 'label-besar' }, `Pembeli membayar ${rupiah(dibayar)}`), uangDiterima,
        el('p', {}, 'Uangnya pas, tidak ada kembalian.'),
        el('button', { type: 'button', class: 'tombol utama', onclick: selesai }, 'Terima kasih!'));
      return;
    }
    const laci = buatLaci({ pilihan: PECAHAN.filter(x => x.nilai < dibayar), judulLaci: 'Laci kasir', judulNampan: 'Nampan kembalian' });
    isiUlang(e.langkah,
      el('p', { class: 'label-besar' }, `Langkah 2: Pembeli membayar ${rupiah(dibayar)}`), uangDiterima,
      el('p', {}, `Belanjaan ${rupiah(p.total)}. Susun uang kembalian di nampan, lalu serahkan.`),
      laci.elemen,
      el('div', { class: 'baris-tombol' },
        el('button', { type: 'button', class: 'tombol kedua kecil', onclick: () => laci.kosongkan() }, 'Kosongkan nampan'),
        el('button', {
          type: 'button', class: 'tombol utama', onclick: () => {
            const n = laci.jumlah();
            hasil.percobaanKembalian++;
            const benar = n === p.kembalian;
            if (hasil.percobaanKembalian === 1) s.ctx.quiz.catat(soalKembalian(p, s.ctx.kelas), benar);
            if (benar) {
              hasil.kembalianPertama = hasil.percobaanKembalian === 1;
              hasil.lembar = laci.lembar();
              s.ctx.audio.main('benar');
              selesai();
              return;
            }
            s.ctx.audio.main('salah');
            const selisih = Math.abs(n - p.kembalian);
            let teks = n > p.kembalian ? `Kembaliannya kelebihan ${rupiah(selisih)}.` : `Kembaliannya kurang ${rupiah(selisih)}.`;
            if (hasil.percobaanKembalian >= 2) teks += ` Petunjuk: kembalian = ${rupiah(dibayar)} − ${rupiah(p.total)}.`;
            if (hasil.percobaanKembalian >= 3) teks += ` Jadi kembaliannya ${rupiah(p.kembalian)}.`;
            pesan(e.pesan, `${semangat()} ${teks}`, 'salah');
          },
        }, 'Serahkan kembalian')));
  }

  // Langkah 3: selesai
  function selesai() {
    const t = tokoData();
    const lvlLama = levelToko(t.pelanggan);
    const b = bintangPelanggan({ ...hasil, kembalian: p.kembalian });
    t.pelanggan++;
    t.pelangganHari++;
    t.pendapatan += p.total;
    t.pendapatanHari += p.total;
    t.bintang += b;
    simpanToko(t);
    perbaruiKepala();
    if (levelToko(t.pelanggan) > lvlLama) {
      s.ctx.audio.main('levelup');
      toast(`MasyaAllah! Warungmu naik ke level ${levelToko(t.pelanggan)}. Ada barang baru di rak!`, 'sukses', 4000);
    }
    const tersedikit = p.kembalian ? susunanTersedikit(p.kembalian) : [];
    isiUlang(e.langkah,
      el('p', { class: 'ps-ucapan' }, `"Terima kasih, ya! Assalamu'alaikum."`),
      bintang(b),
      p.kembalian > 0 && el('p', { class: 'catatan' },
        `Kembalian ${rupiah(p.kembalian)} paling sedikit bisa disusun dengan ${tersedikit.length} lembar/keping: ${tersedikit.map(rupiah).join(' + ')}.`),
      el('div', { class: 'baris-tombol' },
        el('button', {
          type: 'button', class: 'tombol utama',
          onclick: async () => { if (t.pelangganHari >= PELANGGAN_PER_HARI) await akhirHari(); if (s) tampil(); },
        }, t.pelangganHari >= PELANGGAN_PER_HARI ? 'Tutup warung hari ini' : 'Pembeli berikutnya')));
    pesan(e.pesan, `Wa'alaikumussalam! +${rupiah(p.total)} masuk ke kas warung.`, 'benar');
  }

  langkahTotal();
}

async function akhirHari() {
  const t = tokoData();
  const soal = soalInfak(t.pendapatanHari, s.ctx.kelas);
  await modal({
    judul: '🌙 Warung tutup',
    isi: `Alhamdulillah, hari ini kamu melayani ${t.pelangganHari} pembeli dan mendapat ${rupiah(t.pendapatanHari)}. Sebelum pulang, mari sisihkan sebagian untuk kotak infak.`,
    tombol: [{ teks: 'Hitung infak', nilai: true, kelas: 'utama' }],
  });
  if (!s) return;
  const r = await s.ctx.quiz.tanya({ soal, judul: '🤲 Kotak infak' });
  if (!s) return;
  const t2 = tokoData();
  if (r.benar) {
    t2.infak += soal.jawaban;
    toast(`Barakallah! ${rupiah(soal.jawaban)} dimasukkan ke kotak infak.`, 'sukses', 3500);
  }
  t2.hari++;
  t2.pelangganHari = 0;
  t2.pendapatanHari = 0;
  simpanToko(t2);
}

// ---------- Jadi Pembeli ----------

function modePembeli() {
  const tugas = buatTugasBelanja(s.ctx.kelas, levelToko(tokoData().pelanggan));
  const keranjang = new Map(); // id barang -> jumlah
  const e = {
    keranjang: el('ul', { class: 'ps-keranjang' }),
    langkah: el('div', { class: 'ps-langkah' }),
    pesan: el('p', { class: 'ps-pesan', 'aria-live': 'polite' }),
  };
  let tahap = 'pilih';

  function gambarKeranjang() {
    isiUlang(e.keranjang, keranjang.size
      ? [...keranjang].map(([id, n]) => {
        const b = tugas.rak.find(x => x.id === id);
        return el('li', {},
          el('span', { class: 'ps-emoji', 'aria-hidden': 'true' }, b.emoji), `${n} × ${b.nama}`,
          tahap === 'pilih' && el('button', {
            type: 'button', class: 'tombol kedua kecil', 'aria-label': `Kurangi ${b.nama}`,
            onclick: () => { keranjang.set(id, n - 1); if (n - 1 <= 0) keranjang.delete(id); gambarKeranjang(); },
          }, '−'));
      })
      : [el('li', { class: 'catatan' }, 'Keranjang masih kosong.')]);
  }

  const rak = el('div', { class: 'ps-rak' }, tugas.rak.map(b => el('button', {
    type: 'button', class: 'ps-barang', onclick: () => {
      if (tahap !== 'pilih') return;
      keranjang.set(b.id, (keranjang.get(b.id) ?? 0) + 1);
      gambarKeranjang();
    },
  }, el('span', { class: 'ps-emoji besar', 'aria-hidden': 'true' }, b.emoji), el('strong', {}, b.nama), el('span', {}, rupiah(b.harga)))));

  async function periksaKeranjang() {
    const salah = [];
    for (const d of tugas.daftar) {
      const ada = keranjang.get(d.barang.id) ?? 0;
      if (ada < d.jumlah) salah.push(`${d.barang.nama} kurang ${d.jumlah - ada}`);
      if (ada > d.jumlah) salah.push(`${d.barang.nama} kelebihan ${ada - d.jumlah}`);
    }
    for (const [id] of keranjang) if (!tugas.daftar.some(d => d.barang.id === id)) salah.push(`${tugas.rak.find(b => b.id === id).nama} tidak ada di daftar`);
    if (salah.length) { pesan(e.pesan, `Cek lagi daftarnya: ${salah.join(', ')}.`, 'salah'); return; }
    tahap = 'bayar';
    gambarKeranjang();
    const r = await s.ctx.quiz.tanya({
      soal: {
        id: 'pasar-belanja-total', mapel: 'matematika', kelas: s.ctx.kelas, topik: 'Uang dan Belanja', tipe: 'angka',
        pertanyaan: `Belanjaanmu:\n${tugas.daftar.map(d => `${d.jumlah} × ${d.barang.emoji} ${d.barang.nama} @ ${rupiah(d.barang.harga)}`).join('\n')}\nBerapa total yang harus kamu bayar?`,
        jawaban: tugas.total,
        petunjuk: 'Kalikan jumlah dengan harga setiap barang, lalu jumlahkan semuanya.',
        penjelasan: `Totalnya ${rupiah(tugas.total)}.`,
      },
      judul: '🛒 Hitung total belanjaanmu',
    });
    if (!s) return;
    pesan(e.pesan, `Totalnya ${rupiah(tugas.total)}. Sekarang ambil uang dari dompet untuk membayar.`, r.benar ? 'benar' : '');
    langkahBayar();
  }

  function langkahBayar() {
    const dompet = buatLaci({ stok: tugas.dompet.map(n => (n === 500 ? PECAHAN.find(p => p.nilai === 500) : pecahanUntuk(n))), judulLaci: 'Dompetmu', judulNampan: 'Uang yang dibayar' });
    isiUlang(e.langkah,
      el('p', { class: 'label-besar' }, `Bayar ${rupiah(tugas.total)}`),
      dompet.elemen,
      el('button', {
        type: 'button', class: 'tombol utama', onclick: async () => {
          const bayar = dompet.jumlah();
          if (bayar < tugas.total) { pesan(e.pesan, `Uangnya kurang ${rupiah(tugas.total - bayar)}. Tambahkan uang lagi.`, 'salah'); return; }
          const kembali = bayar - tugas.total;
          const r = await s.ctx.quiz.tanya({
            soal: {
              id: 'pasar-belanja-kembalian', mapel: 'matematika', kelas: s.ctx.kelas, topik: 'Uang dan Belanja', tipe: 'angka',
              pertanyaan: `Kamu membayar ${rupiah(bayar)} untuk belanjaan ${rupiah(tugas.total)}. Berapa kembalian yang harus kamu terima?`,
              jawaban: kembali,
              petunjuk: `Kembalian = uang yang dibayar − total belanja = ${rupiah(bayar)} − ${rupiah(tugas.total)}.`,
              penjelasan: `${rupiah(bayar)} − ${rupiah(tugas.total)} = ${rupiah(kembali)}.`,
            },
            judul: '💵 Hitung kembalianmu',
          });
          if (!s) return;
          if (r.benar) s.ctx.audio.main('levelup');
          isiUlang(e.langkah,
            el('p', { class: 'ps-ucapan' }, r.benar ? `${pujian()} Kembalianmu ${rupiah(kembali)}.` : `Kembalianmu ${rupiah(kembali)}. Terus berlatih, ya!`),
            el('p', {}, 'Jangan lupa mengucapkan terima kasih kepada penjual. 😊'),
            el('button', { type: 'button', class: 'tombol utama', onclick: modePembeli }, 'Belanja lagi'));
        },
      }, 'Bayar ke penjual'));
  }

  isiUlang(s.el.isi, el('div', { class: 'ps-belanja' },
    el('div', { class: 'panel ps-tugas' },
      el('p', { class: 'ps-ucapan' }, '"Nak, tolong belikan ini di warung, ya."'),
      el('ul', {}, tugas.daftar.map(d => el('li', {}, el('span', { class: 'ps-emoji', 'aria-hidden': 'true' }, d.barang.emoji), `${d.jumlah} ${d.barang.nama}`)))),
    el('div', {},
      el('p', { class: 'label-besar' }, 'Rak warung (ketuk untuk memasukkan ke keranjang)'),
      rak,
      el('p', { class: 'label-besar' }, '🧺 Keranjangmu'),
      e.keranjang,
      e.langkah,
      e.pesan)));
  isiUlang(e.langkah, el('button', { type: 'button', class: 'tombol utama', onclick: periksaKeranjang }, 'Selesai memilih'));
  gambarKeranjang();
}

// ---------- Kenali Uang ----------

function modeUang() {
  const target = buatTargetUang(s.ctx.kelas);
  const tersedikit = susunanTersedikit(target);
  const e = { pesan: el('p', { class: 'ps-pesan', 'aria-live': 'polite' }), aksi: el('div', { class: 'baris-tombol' }) };
  const laci = buatLaci({ pilihan: PECAHAN.filter(p => p.nilai <= target), judulLaci: 'Pilih uang', judulNampan: 'Susunanmu' });
  let percobaan = 0;

  function periksa() {
    const n = laci.jumlah();
    percobaan++;
    const benar = n === target;
    if (percobaan === 1) {
      s.ctx.quiz.catat({ id: 'pasar-susun', mapel: 'matematika', kelas: s.ctx.kelas, topik: 'Uang dan Belanja', tipe: 'angka', pertanyaan: `Susun ${rupiah(target)}`, jawaban: target }, benar);
    }
    if (!benar) {
      s.ctx.audio.main('salah');
      pesan(e.pesan, `${semangat()} Uangmu ${n > target ? 'kelebihan' : 'kurang'} ${rupiah(Math.abs(n - target))}.`, 'salah');
      return;
    }
    const lembar = laci.lembar();
    const b = lembar <= tersedikit.length ? 3 : lembar <= tersedikit.length + 2 ? 2 : 1;
    s.ctx.audio.main(b === 3 ? 'levelup' : 'benar');
    const rekor = s.ctx.store.get('uangBenar', 0) + 1;
    s.ctx.store.set('uangBenar', rekor);
    isiUlang(e.pesan, `${pujian()} `, bintang(b));
    e.pesan.className = 'ps-pesan benar';
    isiUlang(e.aksi,
      el('p', { class: 'catatan' }, lembar <= tersedikit.length
        ? `Hebat, kamu memakai uang paling sedikit (${lembar} lembar/keping).`
        : `Susunan paling sedikit: ${tersedikit.length} lembar/keping (${tersedikit.map(rupiah).join(' + ')}).`),
      el('button', { type: 'button', class: 'tombol utama', onclick: modeUang }, 'Soal berikutnya'));
  }

  isiUlang(s.el.isi, el('div', { class: 'ps-kenali' },
    el('p', { class: 'ps-target' }, 'Susun uang tepat ', el('strong', {}, rupiah(target))),
    el('p', { class: 'catatan' }, 'Bintang 3 jika kamu memakai lembar/keping sesedikit mungkin.'),
    laci.elemen,
    e.pesan,
    e.aksi));
  isiUlang(e.aksi,
    el('button', { type: 'button', class: 'tombol kedua kecil', onclick: () => laci.kosongkan() }, 'Kosongkan'),
    el('button', { type: 'button', class: 'tombol utama', onclick: periksa }, 'Periksa'));
}

export default {
  id: 'pasar',
  nama: 'Pasar Mini',
  deskripsi: 'Jadi kasir warung: hitung belanjaan, susun kembalian, kenali uang rupiah, dan sisihkan infak.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: 'matematika',
  css: 'css/pasar.css',

  mount(container, ctx) {
    s = { ctx, wadah: el('div', { class: 'ps-wadah' }), mode: ctx.store.get('mode', 'kasir') };
    if (!MODE[s.mode]) s.mode = 'kasir';
    container.append(s.wadah);
    tampil();
  },

  unmount() {
    s = null;
  },

  progres(store) {
    const t = { ...TOKO_KOSONG, ...store.get('toko', {}) };
    if (!t.pelanggan) return { bintang: 0, teks: 'Warung belum buka' };
    const lvl = levelToko(t.pelanggan);
    return { bintang: Math.min(3, lvl - 1), teks: `Level toko ${lvl} · ${t.pelanggan} pelanggan · infak ${rupiah(t.infak)}` };
  },
};

