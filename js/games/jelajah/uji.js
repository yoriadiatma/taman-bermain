// uji.js — uji data provinsi, peta, dan misi Jelajah Nusantara. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { PROVINSI, WILAYAH, JENIS_BUDAYA, JENIS_ISLAM } from '../../../data/nusantara.js';
import { pulauDi, TAMPILAN, diDalam, arahDalamWilayah } from './peta.js';
import { buatMisi, bahanMisi, hitungBintang, pilihanProvinsi, JUMLAH_MISI, KOMPOSISI } from './misi.js';
import { rng } from '../kata/labirin.js';

const uji = (nama, fn) => ujiDasar('Jelajah Nusantara', nama, fn);

uji('38 provinsi dengan id, nama, dan wilayah yang benar', () => {
  sama(PROVINSI.length, 38);
  sama(new Set(PROVINSI.map(p => p.id)).size, 38, 'id ganda');
  sama(new Set(PROVINSI.map(p => p.nama)).size, 38, 'nama ganda');
  const jumlah = {};
  for (const p of PROVINSI) {
    benar(WILAYAH[p.wilayah], `${p.id}: wilayah ${p.wilayah} tidak dikenal`);
    benar(p.ibuKota, `${p.id}: ibu kota kosong`);
    jumlah[p.wilayah] = (jumlah[p.wilayah] ?? 0) + 1;
  }
  sama(jumlah, { sumatra: 10, jawa: 6, nusa: 3, kalimantan: 5, sulawesi: 6, maluku: 2, papua: 6 });
});

uji('Ibu kota yang sering keliru sesuai data terbaru', () => {
  const ibu = id => PROVINSI.find(p => p.id === id).ibuKota;
  sama(ibu('kalsel'), 'Banjarbaru');
  sama(ibu('malut'), 'Sofifi');
  sama(ibu('kaltara'), 'Tanjung Selor');
  sama(ibu('sulbar'), 'Mamuju');
  sama(ibu('papuabaratdaya'), 'Sorong');
});

uji('Setiap pin provinsi berada di daratan pulau wilayahnya', () => {
  for (const p of PROVINSI) {
    const pulau = pulauDi(p.pos);
    benar(pulau, `${p.id}: pin di laut`);
    sama(pulau.wilayah, p.wilayah, `${p.id}: pin di pulau wilayah lain`);
  }
});

uji('Pin tidak bertumpuk (jarak minimal 0,6 derajat)', () => {
  for (const a of PROVINSI) {
    for (const b of PROVINSI) {
      if (a === b) continue;
      benar(Math.hypot(a.pos[0] - b.pos[0], a.pos[1] - b.pos[1]) >= 0.6, `${a.id} terlalu dekat dengan ${b.id}`);
    }
  }
});

uji('Kapal selalu di laut', () => {
  for (const [id, t] of Object.entries(TAMPILAN)) benar(!pulauDi(t.kapal), `kapal ${id} di daratan`);
});

uji('Titik di dalam poligon', () => {
  const kotak = [[0, 0], [2, 0], [2, 2], [0, 2]];
  benar(diDalam([1, 1], kotak));
  benar(!diDalam([3, 1], kotak));
  sama(arahDalamWilayah([0, 10], [[0, 10], [0, 0], [0, -10]]), 'utara');
  sama(arahDalamWilayah([-10, -10], [[-10, -10], [10, 10]]), 'barat daya');
});

uji('Data budaya & sejarah: jenis dikenal, nama unik di seluruh provinsi, tokoh punya kalimat soal', () => {
  const nama = new Map();
  for (const p of PROVINSI) {
    const butir = [...(p.rumahAdat ? [p.rumahAdat] : []), ...(p.budaya ?? []), ...(p.islam ?? [])];
    for (const b of p.budaya ?? []) benar(JENIS_BUDAYA[b.jenis], `${p.id}: jenis budaya ${b.jenis}`);
    for (const x of p.islam ?? []) {
      benar(JENIS_ISLAM[x.jenis], `${p.id}: jenis islam ${x.jenis}`);
      benar(x.ket, `${p.id}: ${x.nama} tanpa keterangan`);
      if (x.jenis === 'tokoh') benar(x.tanya && x.tanya.endsWith('...'), `${x.nama}: tokoh perlu kalimat soal`);
    }
    for (const b of butir) {
      benar(b.nama, `${p.id}: butir tanpa nama`);
      benar(!nama.has(b.nama), `"${b.nama}" ada di ${nama.get(b.nama)} dan ${p.id}`);
      nama.set(b.nama, p.id);
    }
  }
});

uji('Pilihan jawaban: 4 nama unik, jawaban ada, tanpa provinsi yang dihindari', () => {
  const acak = rng(3);
  for (const p of PROVINSI) {
    const pil = pilihanProvinsi(p, acak, ['aceh']);
    sama(pil.length, 4);
    sama(new Set(pil).size, 4);
    benar(pil.includes(p.nama));
    if (p.id !== 'aceh') benar(!pil.includes('Aceh'));
  }
});

uji('Setiap bahan misi punya pertanyaan dan penjelasan', () => {
  for (const p of PROVINSI) {
    for (const b of bahanMisi(p)) {
      benar(b.pertanyaan && !b.pertanyaan.includes('undefined'), `${b.kunci}: pertanyaan`);
      benar(b.penjelasan && !b.penjelasan.includes('undefined'), `${b.kunci}: penjelasan`);
    }
  }
});

uji('Ronde misi: 5 misi, jawaban di wilayahnya, soal pilihan valid, tidak ada soal ganda', () => {
  for (const w of Object.keys(WILAYAH)) {
    for (const kelas of [4, 5, 6]) {
      for (let seed = 1; seed <= 15; seed++) {
        const ronde = buatMisi(w, kelas, rng(seed * 97 + kelas));
        sama(ronde.length, JUMLAH_MISI, `${w} kelas ${kelas}`);
        sama(new Set(ronde.map(m => m.soal.id)).size, ronde.length, `${w} kelas ${kelas}: soal ganda`);
        for (const m of ronde) {
          const p = PROVINSI.find(q => q.id === m.prov);
          sama(p.wilayah, w, `${m.soal.id}: provinsi di luar wilayah`);
          benar(['ketuk', 'pilih'].includes(m.jenis));
          benar(m.teks && !m.teks.includes('undefined'), `${m.soal.id}: teks`);
          benar(m.soal.petunjuk.includes(WILAYAH[w].nama), `${m.soal.id}: petunjuk arah`);
          if (m.jenis === 'pilih') {
            sama(m.soal.pilihan.length, 4, `${m.soal.id}: jumlah pilihan`);
            sama(new Set(m.soal.pilihan).size, 4, `${m.soal.id}: pilihan ganda`);
            benar(m.soal.pilihan.includes(m.soal.jawaban), `${m.soal.id}: jawaban tidak ada di pilihan`);
          } else {
            sama(m.soal.jawaban, p.nama);
          }
        }
        // Kelas 4 hanya soal provinsi & ibu kota.
        if (kelas === 4) benar(ronde.every(m => m.soal.topik === 'Provinsi & Ibu Kota'), `${w}: kelas 4 dapat soal budaya`);
      }
    }
  }
});

uji('Kelas 6 mendapat soal sejarah Islam jika wilayahnya punya data', () => {
  sama(KOMPOSISI[6].filter(k => k === 'islam').length, 2);
  for (const w of ['sumatra', 'jawa', 'sulawesi', 'kalimantan']) {
    const ronde = buatMisi(w, 6, rng(11));
    benar(ronde.filter(m => m.soal.topik === 'Sejarah Islam Nusantara').length >= 2, `${w}: kurang soal sejarah Islam`);
  }
});

uji('Bintang ronde', () => {
  sama([5, 4, 3, 2, 0].map(n => hitungBintang(n, 5)), [3, 2, 2, 1, 1]);
});
