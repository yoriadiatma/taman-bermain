// labirin.js — membuat labirin, menaruh huruf, dan mencari jalan (tanpa DOM, mudah diuji).
//
// Peta berupa grid tile: '#' dinding, '.' lantai, 'P' gerbang (dibuka dengan soal).
// Huruf disimpan terpisah di `huruf`: [{ x, y, h, perlu }], perlu = indeks huruf di kata (null = pengecoh).

export const UKURAN = { 4: [7, 5], 5: [9, 6], 6: [11, 7] }; // jumlah ruang (sel) lebar x tinggi
export const PENGECOH = { 4: 3, 5: 4, 6: 5 };
export const GERBANG = { 4: 1, 5: 1, 6: 2 };

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Labirin sempurna (backtracking) lalu sebagian dinding dibuka agar ada jalan memutar. */
export function buatPeta(lebarSel, tinggiSel, acak, bukaTambahan = 0.12) {
  const W = lebarSel * 2 + 1;
  const H = tinggiSel * 2 + 1;
  const peta = Array.from({ length: H }, () => Array(W).fill('#'));
  const dikunjungi = new Set();
  const tumpuk = [[0, 0]];
  dikunjungi.add('0,0');
  peta[1][1] = '.';
  while (tumpuk.length) {
    const [cx, cy] = tumpuk[tumpuk.length - 1];
    const tetangga = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => [cx + dx, cy + dy, dx, dy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < lebarSel && y < tinggiSel && !dikunjungi.has(`${x},${y}`));
    if (!tetangga.length) { tumpuk.pop(); continue; }
    const [nx, ny, dx, dy] = tetangga[Math.floor(acak() * tetangga.length)];
    peta[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = '.';
    peta[ny * 2 + 1][nx * 2 + 1] = '.';
    dikunjungi.add(`${nx},${ny}`);
    tumpuk.push([nx, ny]);
  }
  // Buka beberapa dinding dalam agar ada lingkaran (lebih ramah untuk anak).
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (peta[y][x] !== '#') continue;
      const datar = peta[y][x - 1] === '.' && peta[y][x + 1] === '.' && peta[y - 1][x] === '#' && peta[y + 1][x] === '#';
      const tegak = peta[y - 1][x] === '.' && peta[y + 1][x] === '.' && peta[y][x - 1] === '#' && peta[y][x + 1] === '#';
      if ((datar || tegak) && acak() < bukaTambahan) peta[y][x] = '.';
    }
  }
  return peta;
}

export const bisaDilewati = (peta, x, y) => peta[y]?.[x] !== undefined && peta[y][x] !== '#';

/** Jalan terpendek (BFS) dari a ke b. Gerbang hanya boleh menjadi tujuan akhir. Mengembalikan daftar [x, y] tanpa titik awal. */
export function cariJalan(peta, a, b) {
  const kunci = (x, y) => `${x},${y}`;
  const asal = new Map([[kunci(a.x, a.y), null]]);
  const antrean = [[a.x, a.y]];
  while (antrean.length) {
    const [x, y] = antrean.shift();
    if (x === b.x && y === b.y) {
      const jalan = [];
      let k = kunci(x, y);
      while (asal.get(k)) {
        jalan.unshift(k.split(',').map(Number));
        k = asal.get(k);
      }
      return jalan;
    }
    if (peta[y][x] === 'P' && !(x === a.x && y === a.y)) continue; // tidak menembus gerbang tertutup
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (!bisaDilewati(peta, nx, ny) || asal.has(kunci(nx, ny))) continue;
      asal.set(kunci(nx, ny), kunci(x, y));
      antrean.push([nx, ny]);
    }
  }
  return null;
}

/** Semua tile lantai yang bisa dicapai dari titik awal tanpa melewati gerbang. */
export function terjangkau(peta, awal) {
  const hasil = new Set([`${awal.x},${awal.y}`]);
  const antrean = [[awal.x, awal.y]];
  while (antrean.length) {
    const [x, y] = antrean.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const k = `${nx},${ny}`;
      if (hasil.has(k) || peta[ny]?.[nx] !== '.') continue;
      hasil.add(k);
      antrean.push([nx, ny]);
    }
  }
  return hasil;
}

const ABJAD = 'ABCDEFGHIJKLMNOPRSTUWY';

function acakUrut(daftar, acak) {
  const a = [...daftar];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Buat satu level: peta, posisi awal, huruf kata + pengecoh, dan gerbang.
 * Huruf kata tidak pernah tertutup gerbang (selalu bisa dicapai), jadi level selalu bisa diselesaikan.
 * Huruf boleh diambil dari kotak mana pun yang hurufnya sama dengan huruf yang dibutuhkan.
 */
export function buatLevel(entri, kelas, seed) {
  for (let coba = 0; coba < 20; coba++) {
    const level = cobaBuatLevel(entri, kelas, seed + coba * 7919);
    if (level) return level;
  }
  throw new Error(`Labirin untuk kata ${entri.kata} tidak bisa dibuat.`);
}

function cobaBuatLevel(entri, kelas, seed) {
  const acak = rng(seed);
  const [ws, hs] = UKURAN[kelas] ?? UKURAN[4];
  const peta = buatPeta(ws, hs, acak);
  const awal = { x: 1, y: 1 };

  // Gerbang ditaruh di lorong (tile di antara dua sel), tidak terlalu dekat titik awal.
  const lorong = [];
  for (let y = 1; y < peta.length - 1; y++) {
    for (let x = 1; x < peta[0].length - 1; x++) {
      if (peta[y][x] === '.' && (x + y) % 2 === 1 && x + y > 6) lorong.push([x, y]);
    }
  }
  const pilihLorong = acakUrut(lorong, acak).slice(0, GERBANG[kelas] ?? 1);
  for (const [x, y] of pilihLorong) peta[y][x] = 'P';

  // Huruf hanya di sel (bukan lorong) yang bisa dicapai tanpa melewati gerbang.
  const bisa = terjangkau(peta, awal);
  const sel = [...bisa].map(k => k.split(',').map(Number))
    .filter(([x, y]) => x % 2 === 1 && y % 2 === 1 && !(x === awal.x && y === awal.y));
  const kata = [...entri.kata];
  const nPengecoh = PENGECOH[kelas] ?? 3;
  if (sel.length < kata.length + nPengecoh) return null;
  const urut = acakUrut(sel, acak);
  const huruf = kata.map((h, i) => { const [x, y] = urut.pop(); return { x, y, h, perlu: i }; });
  // Pengecoh: huruf dari ejaan keliru (jika ada) ditambah huruf acak yang tidak ada di kata.
  const keliru = [...new Set([...(entri.keliru ?? '')].filter(h => /[A-Z]/.test(h) && !kata.includes(h)))];
  const lain = acakUrut([...ABJAD].filter(h => !kata.includes(h) && !keliru.includes(h)), acak);
  const pengecoh = [...keliru, ...lain].slice(0, nPengecoh);
  for (const h of pengecoh) { const [x, y] = urut.pop(); huruf.push({ x, y, h, perlu: null }); }
  return { peta, awal, huruf, kata: entri.kata };
}

/** Bintang: 3 jika salah ambil sedikit. */
export function hitungBintang(salah) {
  if (salah <= 1) return 3;
  if (salah <= 4) return 2;
  return 1;
}
