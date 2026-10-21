// misi.js — membuat misi Jelajah Nusantara dari data provinsi (tanpa DOM, mudah diuji).
//
// Misi berjenis 'ketuk' (jawab dengan mengetuk pin di peta) atau 'pilih' (soal pilihan ganda di dialog).
// Setiap misi membawa objek `soal` berformat bank soal (lihat data/questions.js) untuk statistik dan dialog.

import { PROVINSI, WILAYAH, JENIS_BUDAYA } from '../../../data/nusantara.js';
import { arahDalamWilayah } from './peta.js';

export const JUMLAH_MISI = 5;
const TOPIK = { dasar: 'Provinsi & Ibu Kota', budaya: 'Budaya Nusantara', islam: 'Sejarah Islam Nusantara' };

// Komposisi misi per kelas: kelas 4 dasar saja, kelas 5 ditambah budaya, kelas 6 ditambah sejarah Islam.
export const KOMPOSISI = {
  4: ['dasar', 'dasar', 'dasar', 'dasar', 'dasar'],
  5: ['dasar', 'dasar', 'dasar', 'budaya', 'budaya'],
  6: ['dasar', 'dasar', 'budaya', 'islam', 'islam'],
};

export const provinsiWilayah = w => PROVINSI.filter(p => p.wilayah === w);

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function acakUrut(daftar, acak) {
  const a = [...daftar];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Petunjuk arah: "Provinsi itu ada di bagian barat laut wilayah Sumatra." */
export function petunjukArah(p) {
  const arah = arahDalamWilayah(p.pos, provinsiWilayah(p.wilayah).map(q => q.pos));
  const wilayah = WILAYAH[p.wilayah].nama;
  return arah === 'tengah' ? `Provinsi itu ada di bagian tengah wilayah ${wilayah}.` : `Provinsi itu ada di bagian ${arah} wilayah ${wilayah}.`;
}

/**
 * Pilihan jawaban berupa nama provinsi: jawaban + pengecoh dari wilayah yang sama dulu, lalu wilayah lain.
 * `hindari` = id provinsi yang tidak boleh jadi pengecoh (mis. punya butir budaya yang sama).
 */
export function pilihanProvinsi(benar, acak, hindari = [], n = 4) {
  const boleh = q => q.id !== benar.id && !hindari.includes(q.id);
  const sama = acakUrut(PROVINSI.filter(q => q.wilayah === benar.wilayah && boleh(q)), acak);
  const lain = acakUrut(PROVINSI.filter(q => q.wilayah !== benar.wilayah && boleh(q)), acak);
  return [benar, ...[...sama.slice(0, 2), ...lain, ...sama.slice(2)].slice(0, n - 1)].map(q => q.nama);
}

function pilihanIbuKota(benar, acak, n = 4) {
  const lain = q => q.id !== benar.id && q.ibuKota !== benar.ibuKota;
  const sama = acakUrut(PROVINSI.filter(q => q.wilayah === benar.wilayah && lain(q)), acak);
  const jauh = acakUrut(PROVINSI.filter(q => q.wilayah !== benar.wilayah && lain(q)), acak);
  return [benar.ibuKota, ...[...sama.slice(0, 2), ...jauh, ...sama.slice(2)].slice(0, n - 1).map(q => q.ibuKota)];
}

const KALIMAT_BUDAYA = {
  tarian: n => `${n} adalah tarian dari provinsi ...`,
  makanan: n => `${n} adalah makanan khas dari provinsi ...`,
  kesenian: n => `${n} adalah kesenian dari provinsi ...`,
  'alat-musik': n => `${n} adalah alat musik dari provinsi ...`,
  kerajinan: n => `${n} adalah kerajinan khas dari provinsi ...`,
  warisan: n => `${n} adalah warisan budaya dari provinsi ...`,
  tradisi: n => `${n} adalah tradisi dari provinsi ...`,
  tempat: n => `${n} terletak di provinsi ...`,
  alam: n => `${n} terletak di provinsi ...`,
  hewan: n => `${n} hidup di alam liar provinsi ...`,
};

const KALIMAT_ISLAM = {
  kerajaan: n => `${n} berpusat di wilayah yang sekarang menjadi provinsi ...`,
  masjid: n => `${n} terletak di provinsi ...`,
  julukan: n => `Provinsi yang dijuluki "${n}" adalah ...`,
};

/**
 * Semua bahan misi untuk satu provinsi, per kategori.
 * Bahan: { kategori, kunci, pertanyaan, penjelasan, bisaPilih, bisaKetuk, pilihan?(acak) }
 */
export function bahanMisi(p) {
  const hasil = [];
  const ket = p.catatan ? ` ${p.catatan}` : '';
  hasil.push({
    kategori: 'dasar', kunci: `prov-${p.id}`, bisaKetuk: true, bisaPilih: false,
    pertanyaan: `Di mana letak provinsi ${p.nama}?`, teksKetuk: `Ketuk provinsi ${p.nama} di peta.`,
    penjelasan: `Ibu kota provinsi ${p.nama} adalah ${p.ibuKota}.${ket}`,
  });
  hasil.push({
    kategori: 'dasar', kunci: `ibukota-${p.id}`, bisaKetuk: false, bisaPilih: true,
    pertanyaan: `Ibu kota provinsi ${p.nama} adalah ...`,
    pilihan: acak => pilihanIbuKota(p, acak), jawabanPilih: p.ibuKota,
    penjelasan: `Ibu kota provinsi ${p.nama} adalah ${p.ibuKota}.${ket}`,
  });
  hasil.push({
    kategori: 'dasar', kunci: `kota-${p.id}`, bisaKetuk: true, bisaPilih: true,
    pertanyaan: `${p.ibuKota} adalah ibu kota provinsi ...`, teksKetuk: `Ketuk provinsi yang ibu kotanya ${p.ibuKota}.`,
    penjelasan: `${p.ibuKota} adalah ibu kota provinsi ${p.nama}.${ket}`,
  });
  if (p.rumahAdat) {
    hasil.push({
      kategori: 'budaya', kunci: `rumah-${p.id}`, bisaKetuk: true, bisaPilih: true,
      pertanyaan: `${p.rumahAdat.nama} adalah rumah adat dari provinsi ...`,
      penjelasan: `${p.rumahAdat.nama} adalah rumah adat dari ${p.nama}.${p.rumahAdat.ket ? ` ${p.rumahAdat.ket}` : ''}`,
    });
  }
  for (const b of p.budaya ?? []) {
    hasil.push({
      kategori: 'budaya', kunci: `budaya-${p.id}-${slug(b.nama)}`, bisaKetuk: true, bisaPilih: true,
      pertanyaan: KALIMAT_BUDAYA[b.jenis](b.nama),
      penjelasan: `${b.nama} (${JENIS_BUDAYA[b.jenis].toLowerCase()}) berasal dari ${p.nama}.${b.ket ? ` ${b.ket}` : ''}`,
    });
  }
  for (const s of p.islam ?? []) {
    hasil.push({
      kategori: 'islam', kunci: `islam-${p.id}-${slug(s.nama)}`, bisaKetuk: true, bisaPilih: true,
      pertanyaan: s.tanya ?? KALIMAT_ISLAM[s.jenis](s.nama),
      penjelasan: s.ket,
    });
  }
  return hasil;
}

/** Ubah bahan menjadi misi siap main. */
function jadikanMisi(p, b, jenis, acak) {
  const pilih = jenis === 'pilih';
  const pertanyaan = pilih ? b.pertanyaan : (b.teksKetuk ?? `${b.pertanyaan} Ketuk provinsinya di peta.`);
  const pilihan = pilih ? (b.pilihan ? b.pilihan(acak) : pilihanProvinsi(p, acak)) : null;
  return {
    jenis,
    prov: p.id,
    teks: pertanyaan,
    soal: {
      id: `jn-${b.kunci}`,
      mapel: 'nusantara',
      kelas: null,
      topik: TOPIK[b.kategori],
      tipe: 'pilihan',
      pertanyaan,
      pilihan: pilihan ?? [p.nama],
      jawaban: pilih ? (b.jawabanPilih ?? p.nama) : p.nama,
      petunjuk: petunjukArah(p),
      penjelasan: b.penjelasan,
    },
  };
}

/**
 * Buat satu ronde misi untuk sebuah wilayah dan kelas.
 * Jenis bergantian ketuk/pilih. Provinsi diusahakan tidak berulang dalam satu ronde.
 */
export function buatMisi(wilayah, kelas, acak = Math.random) {
  const daftarProv = provinsiWilayah(wilayah);
  const semua = daftarProv.flatMap(p => bahanMisi(p).map(b => ({ p, b })));
  const komposisi = acakUrut(KOMPOSISI[kelas] ?? KOMPOSISI[4], acak);
  const izin = new Set(komposisi);
  const dipakai = new Set();
  const provDipakai = new Map();
  const misi = [];
  const mulaiKetuk = acak() < 0.5;
  komposisi.forEach((kat, i) => {
    let jenis = (i % 2 === 0) === mulaiKetuk ? 'ketuk' : 'pilih';
    let kandidat = semua.filter(x => x.b.kategori === kat && !dipakai.has(x.b.kunci));
    if (!kandidat.length) kandidat = semua.filter(x => x.b.kategori === 'dasar' && !dipakai.has(x.b.kunci));
    if (!kandidat.length) kandidat = semua.filter(x => izin.has(x.b.kategori) && !dipakai.has(x.b.kunci));
    if (!kandidat.length) kandidat = semua.filter(x => izin.has(x.b.kategori));
    // Utamakan provinsi yang paling jarang dipakai di ronde ini.
    const minPakai = Math.min(...kandidat.map(x => provDipakai.get(x.p.id) ?? 0));
    kandidat = kandidat.filter(x => (provDipakai.get(x.p.id) ?? 0) === minPakai);
    const cocokJenis = kandidat.filter(x => (jenis === 'ketuk' ? x.b.bisaKetuk : x.b.bisaPilih));
    if (cocokJenis.length) kandidat = cocokJenis;
    else jenis = jenis === 'ketuk' ? 'pilih' : 'ketuk';
    const { p, b } = kandidat[Math.floor(acak() * kandidat.length)];
    dipakai.add(b.kunci);
    provDipakai.set(p.id, (provDipakai.get(p.id) ?? 0) + 1);
    misi.push(jadikanMisi(p, b, jenis, acak));
  });
  return misi;
}

/** Bintang ronde dari jumlah misi yang benar pada percobaan pertama. */
export function hitungBintang(benarPertama, total = JUMLAH_MISI) {
  if (benarPertama >= total) return 3;
  if (benarPertama >= Math.ceil(total * 0.6)) return 2;
  return 1;
}
