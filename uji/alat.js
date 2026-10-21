// alat.js — kerangka uji sederhana untuk test.html (tanpa pustaka luar).

const daftar = [];

/** Daftarkan uji. fn boleh async. */
export function uji(grup, nama, fn) {
  daftar.push({ grup, nama, fn });
}

export function sama(a, b, pesan = '') {
  const ja = JSON.stringify(a);
  const jb = JSON.stringify(b);
  if (ja !== jb) throw new Error(`${pesan} diharapkan ${jb}, didapat ${ja}`);
}

export function benar(x, pesan) {
  if (!x) throw new Error(pesan);
}

/** Jalankan semua uji dan tampilkan hasilnya di #hasil dan #ringkasan. */
export async function jalankan() {
  const wadah = document.getElementById('hasil');
  let lulus = 0;
  let grupTerakhir = null;
  let ol = null;
  for (const { grup, nama, fn } of daftar) {
    if (grup !== grupTerakhir) {
      grupTerakhir = grup;
      const h = document.createElement('h2');
      h.textContent = grup;
      ol = document.createElement('ol');
      wadah.append(h, ol);
    }
    const li = document.createElement('li');
    const mulai = performance.now();
    try {
      await fn();
      lulus++;
      li.className = 'lulus';
      li.textContent = `✓ ${nama} (${Math.round(performance.now() - mulai)} ms)`;
    } catch (e) {
      li.className = 'gagal';
      li.textContent = `✗ ${nama}: ${e.message}`;
      console.error(nama, e);
    }
    ol.append(li);
    await new Promise(r => setTimeout(r, 0)); // beri kesempatan layar diperbarui
  }
  const r = document.getElementById('ringkasan');
  r.textContent = `${lulus} dari ${daftar.length} uji lulus.`;
  r.className = lulus === daftar.length ? 'lulus' : 'gagal';
  document.title = `${lulus === daftar.length ? '✓' : '✗'} Uji Otomatis`;
}
