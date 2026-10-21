// logika.js — aturan Kebun Ceria (tanpa DOM, mudah diuji).
// Keadaan kebun adalah objek JSON biasa sehingga langsung bisa disimpan.

import { TANAMAN, HEWAN, BARANG_KEBUN } from '../../../data/kebun.js';

export const PETAK_AWAL = 6;
export const PETAK_MAKS = 12;
export const RUMPUT_PER_HARI = 3;
export const SISA_PER_KOMPOS = 3;
export const PELUANG_HUJAN = 0.2;

export const benihId = id => `benih-${id}`;

export function kebunBaru() {
  return {
    v: 1,
    hari: 1,
    cuaca: 'cerah',
    koin: 20,
    kebaikan: 0,
    rumputDiambil: 0,
    petak: Array.from({ length: PETAK_AWAL }, () => null),
    gudang: { [benihId('bayam')]: 2, [benihId('jagung')]: 2 },
    hewan: [],
    catatan: { panen: 0, dibagikan: 0 },
  };
}

/** Lengkapi data simpanan lama/rusak dengan nilai bawaan. */
export function rapikan(k) {
  const baru = kebunBaru();
  if (!k || typeof k !== 'object') return baru;
  return {
    ...baru,
    ...k,
    petak: Array.isArray(k.petak) ? k.petak.slice(0, PETAK_MAKS) : baru.petak,
    gudang: { ...(k.gudang ?? {}) },
    hewan: Array.isArray(k.hewan) ? k.hewan.filter(h => HEWAN[h?.id]) : [],
    catatan: { ...baru.catatan, ...(k.catatan ?? {}) },
  };
}

export const jumlah = (k, id) => k.gudang[id] ?? 0;
function tambah(k, id, n) {
  k.gudang[id] = (k.gudang[id] ?? 0) + n;
  if (k.gudang[id] <= 0) delete k.gudang[id];
}

// ---------- Tanaman ----------

export const tahapKe = t => Math.min(TANAMAN[t.id].tahap.length - 1, Math.floor(t.umur / TANAMAN[t.id].hariPerTahap));
export const siapPanen = t => tahapKe(t) === TANAMAN[t.id].tahap.length - 1;
export const hariSampaiPanen = id => TANAMAN[id].hariPerTahap * (TANAMAN[id].tahap.length - 1);

/** Status petak untuk tampilan: 'kosong' | 'siap' | 'layu' | 'haus' | 'tumbuh'. */
export function statusPetak(t) {
  if (!t) return 'kosong';
  if (siapPanen(t)) return 'siap';
  if (t.layu) return 'layu';
  if (!t.disiram) return 'haus';
  return 'tumbuh';
}

export function tanam(k, i, id) {
  if (k.petak[i]) return 'Petak ini sudah ditanami.';
  if (jumlah(k, benihId(id)) < 1) return `Kamu tidak punya benih ${TANAMAN[id].nama.toLowerCase()}.`;
  tambah(k, benihId(id), -1);
  k.petak[i] = { id, umur: 0, disiram: k.cuaca === 'hujan', kering: 0, layu: false, pupuk: false };
  return null;
}

export function siram(k, i) {
  const t = k.petak[i];
  if (!t) return 'Petak ini kosong.';
  if (siapPanen(t)) return 'Tanaman ini sudah siap dipanen.';
  if (t.disiram) return 'Tanaman ini sudah disiram hari ini.';
  t.disiram = true;
  return null;
}

export function beriKompos(k, i) {
  const t = k.petak[i];
  if (!t) return 'Tanam benih dulu sebelum memberi kompos.';
  if (t.pupuk) return 'Petak ini sudah diberi kompos.';
  if (siapPanen(t)) return 'Tanaman ini sudah siap dipanen.';
  if (jumlah(k, 'kompos') < 1) return `Kamu belum punya kompos. Buat dari ${SISA_PER_KOMPOS} sisa tanaman.`;
  tambah(k, 'kompos', -1);
  t.pupuk = true;
  return null;
}

/** Jumlah hasil panen dari tanaman (kompos menambah 50%, dibulatkan ke atas). */
export const hasilPanen = t => Math.ceil(TANAMAN[t.id].hasil * (t.pupuk ? 1.5 : 1));

/** Panen petak i. bonus = hasil tambahan (mis. karena menjawab soal). Mengembalikan { id, n } atau pesan kesalahan. */
export function panen(k, i, bonus = 0) {
  const t = k.petak[i];
  if (!t || !siapPanen(t)) return 'Tanaman belum siap dipanen.';
  const n = hasilPanen(t) + bonus;
  tambah(k, t.id, n);
  tambah(k, 'sisa', 1);
  k.petak[i] = null;
  k.catatan.panen++;
  return { id: t.id, n };
}

export function buatKompos(k) {
  if (jumlah(k, 'sisa') < SISA_PER_KOMPOS) return `Butuh ${SISA_PER_KOMPOS} sisa tanaman.`;
  tambah(k, 'sisa', -SISA_PER_KOMPOS);
  tambah(k, 'kompos', 1);
  return null;
}

// ---------- Hewan ----------

export function ambilRumput(k) {
  const sisa = RUMPUT_PER_HARI - k.rumputDiambil;
  if (sisa <= 0) return 'Rumput hari ini sudah habis. Besok tumbuh lagi.';
  tambah(k, 'rumput', sisa);
  k.rumputDiambil = RUMPUT_PER_HARI;
  return null;
}

export function beriMakan(k, i) {
  const h = k.hewan[i];
  const d = HEWAN[h.id];
  if (h.makan) return `${d.nama} sudah makan hari ini.`;
  const namaMakanan = TANAMAN[d.makanan]?.nama ?? BARANG_KEBUN[d.makanan]?.nama;
  if (jumlah(k, d.makanan) < d.jumlahMakan) return `Butuh ${d.jumlahMakan} ${namaMakanan.toLowerCase()} untuk ${d.nama.toLowerCase()}.`;
  tambah(k, d.makanan, -d.jumlahMakan);
  h.makan = true;
  return null;
}

export function ambilProduk(k, i) {
  const h = k.hewan[i];
  if (!h.produk) return 'Belum ada hasil. Beri makan hari ini, besok ada hasilnya.';
  const d = HEWAN[h.id];
  tambah(k, d.produk, h.produk);
  const n = h.produk;
  h.produk = 0;
  return { id: d.produk, n };
}

// ---------- Jual beli ----------

export function hargaJual(id) {
  return TANAMAN[id]?.hargaJual ?? BARANG_KEBUN[id]?.hargaJual ?? 0;
}

export function jual(k, id, n = 1) {
  if (!hargaJual(id)) return 'Barang ini tidak dijual.';
  if (jumlah(k, id) < n) return 'Barangnya tidak cukup.';
  tambah(k, id, -n);
  k.koin += hargaJual(id) * n;
  return null;
}

export const hargaPetak = k => 10 + 5 * (k.petak.length - PETAK_AWAL);

export function beli(k, jenis, id) {
  let harga;
  if (jenis === 'benih') harga = TANAMAN[id].hargaBenih;
  else if (jenis === 'hewan') {
    harga = HEWAN[id].harga;
    if (k.hewan.filter(h => h.id === id).length >= HEWAN[id].maks) return `Kandang ${HEWAN[id].nama.toLowerCase()} sudah penuh.`;
  } else if (jenis === 'petak') {
    if (k.petak.length >= PETAK_MAKS) return 'Kebunmu sudah paling luas.';
    harga = hargaPetak(k);
  }
  if (k.koin < harga) return `Koinmu kurang ${harga - k.koin}.`;
  k.koin -= harga;
  if (jenis === 'benih') tambah(k, benihId(id), 1);
  else if (jenis === 'hewan') k.hewan.push({ id, makan: false, produk: 0 });
  else k.petak.push(null);
  return null;
}

// ---------- Pergantian hari ----------

/**
 * Tidur: tanaman yang disiram tumbuh, yang tidak disiram 2 hari menjadi layu (berhenti tumbuh,
 * pulih jika disiram lagi). Hewan yang makan menghasilkan produk. Cuaca hari baru diundi.
 * Mengembalikan ringkasan { tumbuh, tahapBaru, layu, pulih, produk, hujan }.
 */
export function tidur(k, acak = Math.random) {
  const r = { tumbuh: 0, tahapBaru: [], layu: 0, pulih: 0, produk: 0, hujan: false };
  k.petak.forEach((t, i) => {
    if (!t || siapPanen(t)) { if (t) t.disiram = false; return; }
    if (t.disiram) {
      if (t.layu) {
        t.layu = false;
        r.pulih++;
      } else {
        const sebelum = tahapKe(t);
        t.umur++;
        r.tumbuh++;
        if (tahapKe(t) > sebelum) r.tahapBaru.push({ petak: i, id: t.id, tahap: tahapKe(t) });
      }
      t.kering = 0;
    } else {
      t.kering++;
      if (t.kering >= 2 && !t.layu) { t.layu = true; r.layu++; }
    }
    t.disiram = false;
  });
  for (const h of k.hewan) {
    if (h.makan) { h.produk += HEWAN[h.id].jumlahProduk; r.produk += HEWAN[h.id].jumlahProduk; }
    h.makan = false;
  }
  k.hari++;
  k.rumputDiambil = 0;
  k.cuaca = acak() < PELUANG_HUJAN ? 'hujan' : 'cerah';
  if (k.cuaca === 'hujan') {
    r.hujan = true;
    for (const t of k.petak) if (t && !siapPanen(t)) t.disiram = true;
  }
  return r;
}

// ---------- Soal ----------

/** Soal menyusun urutan tahap tumbuh (tipe 'urutan'). */
export function soalSiklus(id, kelas) {
  const d = TANAMAN[id];
  return {
    id: `kebun-siklus-${id}`, mapel: 'ipa', kelas, topik: 'Siklus Hidup Tumbuhan', tipe: 'urutan',
    pertanyaan: `Urutkan tahap tumbuh tanaman ${d.nama.toLowerCase()} dari awal sampai siap panen.`,
    jawaban: [...d.tahap],
    petunjuk: 'Semua tanaman berawal dari benih.',
    penjelasan: `${d.tahap.join(' → ')}. ${d.info}`,
  };
}

/**
 * Soal membagi hasil panen (pecahan/persen/perbandingan) sesuai kelas.
 * Mengembalikan soal yang jawabannya = jumlah yang dibagikan ke tetangga, atau null jika tidak ada pecahan yang pas.
 */
export function soalBagi(id, n, kelas, acak = Math.random) {
  const nama = TANAMAN[id]?.nama.toLowerCase() ?? id;
  const pilihan = [];
  if (kelas <= 4) {
    for (const q of [2, 3, 4]) {
      if (n % q === 0) {
        pilihan.push({
          teks: `Kamu memanen ${n} ${nama}. Kamu ingin membagikan 1/${q} kepada tetangga. Berapa ${nama} yang dibagikan?`,
          jawaban: n / q, petunjuk: `1/${q} dari ${n} artinya ${n} dibagi ${q}.`, jelas: `${n} : ${q} = ${n / q}.`, topik: 'Pecahan',
        });
      }
    }
  } else if (kelas === 5) {
    for (const [p, q] of [[2, 3], [3, 4], [1, 2], [3, 5], [4, 5]]) {
      if (n % q === 0) {
        const dijual = (n / q) * p;
        pilihan.push({
          teks: `Kamu memanen ${n} ${nama}. Sebanyak ${p}/${q} dijual, sisanya dibagikan kepada tetangga. Berapa ${nama} yang dibagikan?`,
          jawaban: n - dijual, petunjuk: `Hitung dulu ${p}/${q} dari ${n} = ${n} : ${q} × ${p}. Lalu ${n} dikurangi hasilnya.`,
          jelas: `${p}/${q} × ${n} = ${dijual}, jadi yang dibagikan ${n} − ${dijual} = ${n - dijual}.`, topik: 'Operasi Pecahan',
        });
      }
    }
  } else {
    for (const persen of [10, 20, 25, 50]) {
      if ((n * persen) % 100 === 0) {
        pilihan.push({
          teks: `Kamu memanen ${n} ${nama}. Kamu membagikan ${persen}% kepada tetangga. Berapa ${nama} yang dibagikan?`,
          jawaban: (n * persen) / 100, petunjuk: `${persen}% = ${persen}/100. Kalikan ${n} dengan ${persen}, lalu bagi 100.`,
          jelas: `${persen}% × ${n} = ${(n * persen) / 100}.`, topik: 'Persen',
        });
      }
    }
    for (const [a, b] of [[3, 1], [2, 1], [1, 1], [4, 1]]) {
      if (n % (a + b) === 0) {
        pilihan.push({
          teks: `Kamu memanen ${n} ${nama}. Perbandingan yang dijual dan yang dibagikan adalah ${a} : ${b}. Berapa ${nama} yang dibagikan?`,
          jawaban: (n / (a + b)) * b, petunjuk: `Jumlah bagian perbandingan = ${a} + ${b} = ${a + b}.`,
          jelas: `${b}/${a + b} × ${n} = ${(n / (a + b)) * b}.`, topik: 'Perbandingan',
        });
      }
    }
  }
  if (!pilihan.length) return null;
  const s = pilihan[Math.floor(acak() * pilihan.length)];
  return {
    id: `kebun-bagi-${kelas}`, mapel: 'matematika', kelas, topik: s.topik, tipe: 'angka',
    pertanyaan: s.teks, jawaban: s.jawaban, petunjuk: s.petunjuk, penjelasan: `${s.jelas} Berbagi kepada tetangga adalah perbuatan yang baik.`,
  };
}

/** Bagikan hasil panen ke tetangga. */
export function bagikan(k, id, n) {
  const ambil = Math.min(n, jumlah(k, id));
  tambah(k, id, -ambil);
  k.kebaikan++;
  k.catatan.dibagikan += ambil;
  return ambil;
}

/** Soal jenis makanan hewan (dibuat dari data HEWAN). */
export function soalJenisMakan(id, kelas) {
  const d = HEWAN[id];
  return {
    id: `kebun-hewan-${id}`, mapel: 'ipa', kelas, topik: 'Ekosistem', tipe: 'pilihan',
    pertanyaan: `${d.nama} ${d.makanApa}. Menurut jenis makanannya, ${d.nama.toLowerCase()} termasuk ...`,
    pilihan: ['Herbivora', 'Karnivora', 'Omnivora'],
    jawaban: d.jenisMakan,
    petunjuk: 'Herbivora = pemakan tumbuhan, karnivora = pemakan daging, omnivora = pemakan keduanya.',
    penjelasan: d.info,
  };
}
