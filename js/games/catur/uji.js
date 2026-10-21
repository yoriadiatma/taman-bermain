// uji.js — uji aturan catur, AI, puzzle, dan Belajar Bidak. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { Catur, AWAL, sanIndonesia, langkahBebas, indeksKotak } from './mesin.js';
import { cariLangkah, evaluasi } from './ai.js';
import { mintaLangkah, hentikan } from './komputer.js';
import { PELAJARAN } from './belajar.js';
import { PUZZLE } from '../../../data/catur-puzzle.js';

const uji = (nama, fn) => ujiDasar('Catur', nama, fn);
const ucis = c => c.langkahLegal().map(Catur.uci).sort();
const mainkan = (c, langkah) => langkah.forEach(l => benar(c.jalan(l), `langkah ${l} seharusnya legal`));

// ---------- Dasar ----------

uji('Posisi awal: 20 langkah legal', () => sama(new Catur().langkahLegal().length, 20));

uji('FEN dibaca dan ditulis ulang sama persis', () => {
  for (const fen of [AWAL, 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', '8/8/8/KPp4r/8/8/8/7k w - c6 0 2']) {
    sama(new Catur(fen).fen(), fen);
  }
});

uji('FEN tidak valid ditolak', () => {
  for (const fen of ['', 'rnbqkbnr/pppppppp/8/8 w - - 0 1', '8/8/8/8/8/8/8/8 w - - 0 1', 'rnbqkbnr/pppppppp/9/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1']) {
    let ditolak = false;
    try { new Catur(fen); } catch { ditolak = true; }
    benar(ditolak, `FEN "${fen}" seharusnya ditolak`);
  }
});

uji('Langkah ilegal ditolak (pion mundur, kuda tidak berbentuk L)', () => {
  const c = new Catur();
  sama(c.jalan('e2e5'), null);
  sama(c.jalan('g1g3'), null);
  sama(c.jalan('e7e5'), null, 'hitam tidak boleh jalan duluan:');
  sama(c.fen(), AWAL);
});

uji('Bidak yang terkunci (pin) tidak boleh bergerak', () => {
  // Kuda e2 menutupi raja e1 dari benteng e8.
  const c = new Catur('4r1k1/8/8/8/8/8/4N3/4K3 w - - 0 1');
  sama(c.langkahLegal('e2').length, 0);
  benar(c.terkunci('e2'), 'kuda e2 seharusnya terkunci');
});

uji('Saat diskak, hanya langkah yang menyelamatkan raja yang legal', () => {
  const c = new Catur('4k3/8/8/8/8/8/3P1P2/r3K3 w - - 0 1');
  benar(c.skak(), 'raja putih seharusnya diskak');
  sama(ucis(c), ['e1e2'].sort());
});

uji('Batal langkah mengembalikan posisi', () => {
  const c = new Catur();
  mainkan(c, ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']);
  for (let i = 0; i < 6; i++) c.batal();
  sama(c.fen(), AWAL);
  sama(c.batal(), null, 'tidak ada lagi yang bisa dibatalkan:');
});

uji('Notasi SAN: skak (+), pembeda kuda, dan notasi Indonesia', () => {
  const c = new Catur('4k3/8/8/8/8/8/8/1N2KN2 w - - 0 1');
  const nd2 = c.jalan({ dari: 'b1', ke: 'd2' });
  sama(nd2.san, 'Nbd2');
  sama(sanIndonesia('Nbd2'), 'Kbd2');
  sama(sanIndonesia('Qxe7#'), 'Mxe7#');
  sama(sanIndonesia('e8=Q+'), 'e8=M+');
  sama(sanIndonesia('O-O'), 'O-O');
  const d = new Catur('4k3/8/8/8/8/8/8/R3K3 w - - 0 1');
  sama(d.jalan('a1a8').san, 'Ra8+');
});

// ---------- Rokade ----------

const FEN_ROKADE = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';

uji('Rokade pendek dan panjang tersedia', () => {
  const l = ucis(new Catur(FEN_ROKADE));
  benar(l.includes('e1g1') && l.includes('e1c1'), 'putih seharusnya bisa rokade dua arah');
});

uji('Rokade pendek memindahkan benteng', () => {
  const c = new Catur(FEN_ROKADE);
  sama(c.jalan('O-O').san, 'O-O');
  sama(c.fen(), 'r3k2r/8/8/8/8/8/8/R4RK1 b kq - 1 1');
  c.jalan('O-O-O');
  sama(c.fen(), '2kr3r/8/8/8/8/8/8/R4RK1 w - - 2 2');
});

uji('Tidak boleh rokade saat diskak', () => {
  const c = new Catur('r3k2r/8/8/8/8/8/4r3/R3K2R w KQkq - 0 1');
  const l = ucis(c);
  benar(!l.includes('e1g1') && !l.includes('e1c1'), 'rokade seharusnya dilarang saat diskak');
});

uji('Tidak boleh rokade melewati kotak yang diserang', () => {
  // Benteng hitam di f8 menyerang f1, jadi rokade pendek dilarang; rokade panjang masih boleh.
  const l = ucis(new Catur('r3kr2/8/8/8/8/8/8/R3K2R w KQq - 0 1'));
  benar(!l.includes('e1g1'), 'rokade pendek seharusnya dilarang');
  benar(l.includes('e1c1'), 'rokade panjang seharusnya boleh');
});

uji('Rokade panjang boleh walau b1 diserang (raja tidak melewati b1)', () => {
  const l = ucis(new Catur('1r2k3/8/8/8/8/8/8/R3K3 w Q - 0 1'));
  benar(l.includes('e1c1'), 'rokade panjang seharusnya boleh');
});

uji('Tidak boleh rokade jika ada bidak di antara raja dan benteng', () => {
  const l = ucis(new Catur('r3k2r/8/8/8/8/8/8/RN2K1NR w KQkq - 0 1'));
  benar(!l.includes('e1g1') && !l.includes('e1c1'), 'rokade seharusnya terhalang');
});

uji('Hak rokade hilang setelah raja atau benteng bergerak', () => {
  const c = new Catur(FEN_ROKADE);
  mainkan(c, ['h1h2', 'a8a7', 'h2h1', 'a7a8']);
  const l = ucis(c);
  benar(!l.includes('e1g1'), 'rokade pendek putih seharusnya hilang');
  benar(l.includes('e1c1'), 'rokade panjang putih masih ada');
  sama(c.fen().split(' ')[2], 'Qk');
  mainkan(c, ['e1d1', 'e8e7', 'd1e1', 'e7e8']);
  sama(c.fen().split(' ')[2], '-');
});

uji('Hak rokade hilang jika benteng dimakan', () => {
  const c = new Catur('r3k2r/8/8/8/8/8/6b1/R3K2R b KQkq - 0 1');
  c.jalan('g2h1');
  sama(c.fen().split(' ')[2], 'Qkq');
});

// ---------- En passant ----------

uji('En passant tersedia tepat setelah pion lawan maju dua langkah', () => {
  const c = new Catur('4k3/8/8/8/1p6/8/P7/4K3 w - - 0 1');
  c.jalan('a2a4');
  sama(c.fen().split(' ')[3], 'a3');
  const m = c.jalan('b4a3');
  benar(m && m.jenis === 'ep', 'en passant seharusnya legal');
  sama(m.san, 'bxa3');
  sama(c.bidakDi('a4'), null, 'pion putih a4 seharusnya hilang:');
  c.batal();
  sama(c.bidakDi('a4'), 'P', 'setelah batal pion a4 kembali:');
});

uji('En passant hangus jika tidak langsung dilakukan', () => {
  const c = new Catur('4k3/8/8/8/1p6/8/P7/4K3 w - - 0 1');
  mainkan(c, ['a2a4', 'e8d8', 'e1d1']);
  benar(!ucis(c).includes('b4a3'), 'en passant seharusnya sudah hangus');
});

uji('En passant dilarang jika membuat raja sendiri terancam', () => {
  // Raja a5, pion b5 dan c5 satu baris dengan benteng h5.
  const c = new Catur('8/8/8/KPp4r/8/8/8/7k w - c6 0 2');
  benar(!ucis(c).includes('b5c6'), 'bxc6 e.p. seharusnya ilegal');
});

// ---------- Promosi ----------

uji('Promosi pion: 4 pilihan bidak', () => {
  const c = new Catur('8/P3k3/8/8/8/8/8/4K3 w - - 0 1');
  sama(c.langkahLegal('a7').map(m => m.promosi).sort(), ['b', 'n', 'q', 'r']);
});

uji('Promosi menjadi kuda (underpromotion)', () => {
  const c = new Catur('8/P3k3/8/8/8/8/8/4K3 w - - 0 1');
  const m = c.jalan({ dari: 'a7', ke: 'a8', promosi: 'n' });
  sama(m.san, 'a8=N');
  sama(c.bidakDi('a8'), 'N');
});

uji('Promosi sambil memakan dan memberi skak', () => {
  const c = new Catur('1r2k3/P7/8/8/8/8/8/4K3 w - - 0 1');
  sama(c.jalan('a7b8q').san, 'axb8=Q+');
  sama(c.bidakDi('b8'), 'Q');
});

uji('Langkah promosi tanpa pilihan bidak ditolak', () => {
  const c = new Catur('8/P3k3/8/8/8/8/8/4K3 w - - 0 1');
  sama(c.jalan({ dari: 'a7', ke: 'a8' }), null);
});

// ---------- Skakmat ----------

uji('Skakmat tercepat (Fool\'s mate): hitam menang', () => {
  const c = new Catur();
  mainkan(c, ['f3', 'e5', 'g4']);
  sama(c.jalan('Qh4').san, 'Qh4#');
  sama(c.status(), { selesai: true, alasan: 'skakmat', pemenang: 'b', skak: true });
});

uji('Skakmat Scholar\'s mate: putih menang', () => {
  const c = new Catur();
  mainkan(c, ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#']);
  sama(c.status().alasan, 'skakmat');
  sama(c.status().pemenang, 'w');
});

uji('Skakmat benteng di baris belakang', () => {
  const c = new Catur('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');
  sama(c.jalan('Ra8').san, 'Ra8#');
  sama(c.status().alasan, 'skakmat');
});

uji('Skak biasa bukan skakmat', () => {
  const c = new Catur('6k1/8/8/8/8/8/8/R5K1 w - - 0 1');
  c.jalan('Ra8');
  sama(c.status(), { selesai: false, skak: true });
});

// ---------- Remis ----------

uji('Remis pat (stalemate)', () => {
  const c = new Catur('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
  sama(c.status(), { selesai: true, alasan: 'pat', pemenang: null, skak: false });
});

uji('Remis tiga kali posisi berulang', () => {
  const c = new Catur();
  mainkan(c, ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1']);
  sama(c.status().selesai, false, 'baru dua kali:');
  c.jalan('Ng8');
  sama(c.status().alasan, 'tiga-kali');
  c.batal();
  sama(c.status().selesai, false, 'setelah batal:');
});

uji('Remis aturan 50 langkah', () => {
  const c = new Catur('8/8/8/4k3/8/8/8/R3K3 w - - 99 80');
  sama(c.status().selesai, false);
  c.jalan('Ra2');
  sama(c.status().alasan, '50-langkah');
});

uji('Langkah pion atau makan mereset hitungan 50 langkah', () => {
  const c = new Catur('4k3/8/8/8/8/8/4P3/4K3 w - - 98 80');
  c.jalan('e3');
  sama(c.fen().split(' ')[4], '0');
});

uji('Skakmat pada langkah ke-50 tetap dihitung skakmat', () => {
  const c = new Catur('6k1/5ppp/8/8/8/8/8/R5K1 w - - 99 80');
  c.jalan('Ra8');
  sama(c.status().alasan, 'skakmat');
});

uji('Remis materi tidak cukup', () => {
  const remis = ['8/8/4k3/8/8/4K3/8/8 w - - 0 1', '8/8/4k3/8/8/4KB2/8/8 w - - 0 1', '8/8/4k3/8/8/4KN2/8/8 w - - 0 1', '8/8/4k3/8/6b1/4KB2/8/8 w - - 0 1'];
  for (const fen of remis) sama(new Catur(fen).status().alasan, 'materi', fen);
  // Gajah di warna kotak berbeda, atau dua kuda, atau ada pion: masih bisa skakmat.
  const lanjut = ['8/8/4k3/4b3/8/4KB2/8/8 w - - 0 1', '8/8/4k3/8/8/4KNN1/8/8 w - - 0 1', '8/8/4k3/8/8/4K3/4P3/8 w - - 0 1'];
  for (const fen of lanjut) sama(new Catur(fen).status().selesai, false, fen);
});

// ---------- Perft: menghitung semua posisi untuk memastikan pembangkit langkah benar ----------
// Angka acuan dari tabel perft yang umum dipakai pemrogram catur.

const PERFT = [
  ['Posisi awal', AWAL, [20, 400, 8902]],
  ['Kiwipete (rokade, en passant, promosi)', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [48, 2039, 97862]],
  ['Posisi 3 (en passant & pin)', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [14, 191, 2812, 43238]],
  ['Posisi 4 (promosi)', 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', [6, 264, 9467]],
  ['Posisi 5', 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', [44, 1486, 62379]],
];
for (const [nama, fen, harap] of PERFT) {
  uji(`Perft ${nama}`, () => {
    const c = new Catur(fen);
    sama(harap.map((_, i) => c.perft(i + 1)), harap);
    sama(c.fen(), fen, 'posisi berubah setelah perft:');
  });
}


// ---------- Puzzle ----------

uji(`Semua ${PUZZLE.length} puzzle: posisi valid, solusinya skakmat`, () => {
  benar(PUZZLE.length >= 15, 'minimal 15 puzzle');
  const ids = new Set();
  for (const p of PUZZLE) {
    benar(!ids.has(p.id), `id puzzle ganda: ${p.id}`);
    ids.add(p.id);
    const c = new Catur(p.fen);
    benar(!c.status().selesai && !c.skak(), `${p.id}: posisi awal tidak boleh sudah selesai atau skak`);
    benar(c.jalan(p.solusi), `${p.id}: solusi ${p.solusi} tidak legal`);
    sama(c.status().alasan, 'skakmat', `${p.id}:`);
  }
});

// ---------- Belajar Bidak ----------

uji('Belajar Bidak: gerak bidak di papan kosong', () => {
  const papan = new Array(64).fill(null);
  const taruh = (k, b) => { papan[indeksKotak(k)] = b; };
  taruh('d4', 'N');
  sama(langkahBebas(papan, indeksKotak('d4')).length, 8, 'kuda di tengah:');
  papan.fill(null); taruh('a1', 'R');
  sama(langkahBebas(papan, indeksKotak('a1')).length, 14, 'benteng di pojok:');
  papan.fill(null); taruh('d4', 'Q');
  sama(langkahBebas(papan, indeksKotak('d4')).length, 27, 'menteri di d4:');
  papan.fill(null); taruh('e2', 'P'); taruh('d3', 'p');
  sama(langkahBebas(papan, indeksKotak('e2')).sort(), ['e3', 'e4', 'd3'].map(indeksKotak).sort(), 'pion:');
});

uji('Belajar Bidak: semua bintang bisa dicapai', () => {
  for (const pel of PELAJARAN) {
    const papan = new Array(64).fill(null);
    for (const [k, b] of Object.entries({ ...pel.teman, ...pel.musuh })) papan[indeksKotak(k)] = b;
    let pos = indeksKotak(pel.mulai);
    papan[pos] = pel.bidak;
    for (const bintang of pel.bintang) {
      const ke = indeksKotak(bintang);
      benar(langkahBebas(papan, pos).includes(ke), `${pel.id}: tidak bisa ke ${bintang}`);
      papan[ke] = papan[pos];
      papan[pos] = null;
      pos = ke;
    }
  }
});

// ---------- Komputer ----------

uji('Komputer menemukan skakmat 1 langkah (semua tingkat kecuali langkah acak)', () => {
  for (const t of ['sedang', 'sulit', 'petunjuk']) {
    const c = new Catur('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');
    c.jalan(cariLangkah(c.fen(), t).uci);
    sama(c.status().alasan, 'skakmat', `tingkat ${t}:`);
  }
});

uji('Komputer memakan menteri yang tidak dijaga', () => {
  for (const t of ['sedang', 'sulit']) {
    sama(cariLangkah('rnb1kbnr/pppp1ppp/8/4p3/4P2q/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1', t).uci, 'f3h4', `tingkat ${t}:`);
  }
});

uji('Komputer Mudah kadang melangkah acak, tetapi selalu legal', () => {
  let acak = 0;
  for (let i = 0; i < 30; i++) {
    const r = cariLangkah(AWAL, 'mudah');
    benar(new Catur().jalan(r.uci), `langkah ${r.uci} tidak legal`);
    if (r.acak) acak++;
  }
  benar(acak > 0 && acak < 30, `jumlah langkah acak ${acak} dari 30`);
});

uji('Evaluasi posisi awal seimbang', () => sama(evaluasi(new Catur()), 0));

uji('Komputer berjalan di Web Worker dan membalas langkah legal', async () => {
  const r = await mintaLangkah(AWAL, 'sedang');
  benar(new Catur().jalan(r.uci), `langkah ${r.uci} tidak legal`);
  hentikan();
});
