// quiz-ui.js — dialog soal yang dipakai semua game.
//
//   const hasil = await ctx.quiz.tanya({ mapel: 'matematika' });
//   // hasil = { benar, benarPertama, percobaan, soal }
//
// Jawaban salah tidak menghukum: anak mendapat petunjuk lalu boleh mencoba lagi
// sampai `maksPercobaan`. Setelah itu jawaban benar dan penjelasan ditampilkan.
// Statistik dicatat dari percobaan pertama.

import { el, papanAngka, pujian, semangat, jebakFokus } from './ui.js';
import * as quiz from './quiz.js';
import * as audio from './audio.js';
import { MAPEL } from './mapel.js';

function areaPilihan(s, jawab) {
  const tombol = s.pilihanAcak.map(p => el('button', {
    type: 'button', class: 'tombol kedua kuis-pilihan', 'data-sunyi': true,
    onclick: e => jawab(p, e.currentTarget),
  }, p));
  return { elemen: el('div', { class: 'kuis-daftar-pilihan' }, tombol), tombol, fokus: () => tombol[0].focus() };
}

function areaAngka(s, jawab) {
  const papan = papanAngka({
    label: 'Jawabanmu', maksDigit: 12, teksKirim: 'Jawab', tambahan: ['-', ','],
    saatKirim: v => { jawab(v); papan.kosongkan(); },
  });
  return { elemen: papan.elemen, fokus: papan.fokus };
}

function areaTeks(s, jawab) {
  const input = el('input', { class: 'masukan kuis-teks', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Jawabanmu' });
  const kirim = () => { if (input.value.trim()) jawab(input.value); };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); kirim(); } });
  return {
    elemen: el('div', { class: 'kuis-baris-teks' }, input,
      el('button', { type: 'button', class: 'tombol utama', 'data-sunyi': true, onclick: kirim }, 'Jawab')),
    fokus: () => input.focus(),
  };
}

function areaUrutan(s, jawab) {
  let urutan = [...s.itemAcak];
  const daftar = el('ol', { class: 'kuis-urutan' });
  function geser(i, arah) {
    const j = i + arah;
    if (j < 0 || j >= urutan.length) return;
    [urutan[i], urutan[j]] = [urutan[j], urutan[i]];
    gambar();
    daftar.children[j]?.querySelector(arah < 0 ? '.naik' : '.turun')?.focus();
  }
  function gambar() {
    daftar.replaceChildren(...urutan.map((item, i) => el('li', {},
      el('span', { class: 'kuis-item' }, item),
      el('button', { type: 'button', class: 'tombol kedua kecil naik', disabled: i === 0, 'aria-label': `Naikkan ${item}`, onclick: () => geser(i, -1) }, '▲'),
      el('button', { type: 'button', class: 'tombol kedua kecil turun', disabled: i === urutan.length - 1, 'aria-label': `Turunkan ${item}`, onclick: () => geser(i, 1) }, '▼'))));
  }
  gambar();
  const periksa = el('button', { type: 'button', class: 'tombol utama', 'data-sunyi': true, onclick: () => jawab([...urutan]) }, 'Periksa urutan');
  return {
    elemen: el('div', {}, el('p', { class: 'catatan' }, 'Pakai tombol ▲ ▼ untuk memindahkan.'), daftar, periksa),
    fokus: () => periksa.focus(),
  };
}

const AREA = { pilihan: areaPilihan, angka: areaAngka, teks: areaTeks, urutan: areaUrutan };

// Dialog yang sedang terbuka, agar bisa ditutup saat pemain keluar dari game.
const terbuka = new Set();

/** Tutup semua dialog soal tanpa menyelesaikan Promise-nya (dipakai saat game di-unmount). */
export function tutupSemua() {
  for (const tutup of [...terbuka]) tutup();
}

/**
 * Tampilkan satu soal dalam dialog.
 * opsi: { idProfil, kelas, mapel?, topik?, soal?, maksPercobaan = 3, catatStatistik = true, judul? }
 * Mengembalikan Promise { benar, benarPertama, percobaan, soal }. Jika tidak ada soal: { benar: false, soal: null }.
 */
export function tanya({ idProfil = null, kelas, mapel = null, topik = null, soal = null, maksPercobaan = 3, catatStatistik = true, judul = null }) {
  const s = soal ? quiz.siapkan(soal) : quiz.pilihSoal({ idProfil, kelas, mapel, topik });
  if (!s) return Promise.resolve({ benar: false, benarPertama: false, percobaan: 0, soal: null });

  return new Promise(selesai => {
    const sebelumnya = document.activeElement;
    const idJudul = 'kuis-' + Math.random().toString(36).slice(2);
    let percobaan = 0;
    let beres = false;

    const umpan = el('div', { class: 'kuis-umpan', 'aria-live': 'polite' });
    const area = AREA[s.tipe](s, jawab);
    const wadahJawab = el('div', { class: 'kuis-jawab' }, area.elemen);
    const kotak = el('div', { class: 'modal kuis', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': idJudul },
      el('div', { class: 'kuis-label' },
        el('span', { class: 'chip', style: { background: MAPEL[s.mapel].warna } }, MAPEL[s.mapel].nama),
        el('span', { class: 'kuis-topik' }, s.topik)),
      judul && el('p', { class: 'kuis-judul' }, judul),
      el('h2', { id: idJudul, class: 'kuis-pertanyaan' }, s.pertanyaan),
      wadahJawab,
      umpan);
    const latar = el('div', { class: 'modal-latar' }, kotak);

    function jawab(nilai, tombol = null) {
      if (beres) return;
      percobaan++;
      const benar = quiz.periksaJawaban(s, nilai);
      if (percobaan === 1 && catatStatistik && idProfil) quiz.catat(idProfil, s, benar);
      if (benar) {
        tombol?.classList.add('benar');
        audio.main('benar');
        akhiri(true);
        return;
      }
      audio.main('salah');
      if (tombol) { tombol.classList.add('salah'); tombol.disabled = true; }
      if (percobaan >= maksPercobaan) {
        akhiri(false);
        return;
      }
      const sisa = maksPercobaan - percobaan;
      umpan.replaceChildren(
        el('p', { class: 'kuis-salah' }, semangat()),
        s.petunjuk && el('p', { class: 'kuis-petunjuk' }, el('strong', {}, 'Petunjuk: '), s.petunjuk),
        el('p', { class: 'catatan' }, `Kesempatan tersisa: ${sisa}`));
      area.fokus();
    }

    function akhiri(benar) {
      beres = true;
      wadahJawab.inert = true;
      if (s.tipe === 'pilihan') {
        kotak.querySelectorAll('.kuis-pilihan').forEach(b => { if (b.textContent === s.jawaban) b.classList.add('benar'); });
      }
      const lanjut = el('button', {
        type: 'button', class: 'tombol utama',
        onclick: () => tutup({ benar, benarPertama: benar && percobaan === 1, percobaan, soal: s }),
      }, 'Lanjut');
      umpan.replaceChildren(
        benar
          ? el('p', { class: 'kuis-benar' }, pujian())
          : el('p', { class: 'kuis-salah' }, 'Tidak apa-apa. Jawaban yang benar: ', el('strong', {}, quiz.teksJawaban(s))),
        s.penjelasan && el('p', { class: 'kuis-penjelasan' }, s.penjelasan),
        el('div', { class: 'modal-tombol' }, lanjut));
      lanjut.focus();
    }

    function bersihkan() {
      terbuka.delete(bersihkan);
      lepas();
      latar.remove();
    }

    function tutup(hasil) {
      bersihkan();
      sebelumnya?.focus?.({ preventScroll: true });
      selesai(hasil);
    }

    const lepas = jebakFokus(kotak);
    terbuka.add(bersihkan);
    document.body.append(latar);
    area.fokus();
  });
}
