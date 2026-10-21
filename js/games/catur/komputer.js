// komputer.js — meminta langkah komputer dari Web Worker.
// Jika browser tidak mendukung module worker, pencarian dijalankan di thread
// utama sebagai cadangan (tampilan bisa tersendat sebentar).

let worker = null;
let workerGagal = false;
let nomor = 0;
const menunggu = new Map();

function cadangan(id, fen, tingkat) {
  import('./ai.js').then(({ cariLangkah }) => {
    setTimeout(() => {
      const janji = menunggu.get(id);
      if (!janji) return;
      menunggu.delete(id);
      try { janji.selesai(cariLangkah(fen, tingkat)); } catch (e) { janji.gagal(e); }
    }, 30);
  });
}

function siapkan() {
  if (worker || workerGagal) return worker;
  try {
    worker = new Worker(new URL('./ai-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = e => {
      const janji = menunggu.get(e.data.id);
      if (!janji) return;
      menunggu.delete(e.data.id);
      if (e.data.galat) janji.gagal(new Error(e.data.galat));
      else janji.selesai(e.data);
    };
    worker.onerror = e => {
      e.preventDefault?.();
      console.warn('Worker catur gagal, beralih ke thread utama.');
      workerGagal = true;
      worker?.terminate();
      worker = null;
      for (const [id, j] of menunggu) cadangan(id, j.fen, j.tingkat);
    };
  } catch {
    workerGagal = true;
    worker = null;
  }
  return worker;
}

/** Minta langkah untuk posisi FEN. Promise berisi { uci, skor, kedalaman }. */
export function mintaLangkah(fen, tingkat) {
  return new Promise((selesai, gagal) => {
    const id = ++nomor;
    menunggu.set(id, { selesai, gagal, fen, tingkat });
    const w = siapkan();
    if (w) w.postMessage({ id, fen, tingkat });
    else cadangan(id, fen, tingkat);
  });
}

/** Hentikan semua pencarian (dipanggil saat keluar dari game). Promise yang belum selesai diabaikan. */
export function hentikan() {
  menunggu.clear();
  worker?.terminate();
  worker = null;
}
