// catur-puzzle.js — puzzle "skakmat dalam 1 langkah" untuk game Catur.
//
// Format: { id, fen, solusi, tema, petunjuk }
// - fen: posisi awal (giliran ada di FEN: w = putih jalan, b = hitam jalan)
// - solusi: langkah UCI yang memberi skakmat, mis. 'a1a8'. Langkah skakmat lain juga diterima.
// - petunjuk: kalimat bantuan untuk anak.
// Setiap puzzle diperiksa otomatis di test.html: solusinya harus benar-benar skakmat.
// Guru boleh menambah puzzle dengan format yang sama.

export const PUZZLE = [
  {
    id: 'm1-01', tema: 'Benteng di baris belakang',
    fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', solusi: 'a1a8',
    petunjuk: 'Raja hitam terkurung oleh pionnya sendiri. Serang baris paling belakang!',
  },
  {
    id: 'm1-02', tema: 'Menteri di baris belakang',
    fen: '6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1', solusi: 'd1d8',
    petunjuk: 'Menteri bisa bergerak lurus jauh seperti benteng.',
  },
  {
    id: 'm1-03', tema: 'Menteri dan raja bekerja sama',
    fen: '7k/8/6K1/8/8/8/8/3Q4 w - - 0 1', solusi: 'd1d8',
    petunjuk: 'Rajamu sudah menjaga kotak g7 dan h7.',
  },
  {
    id: 'm1-04', tema: 'Menteri di tepi papan',
    fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1', solusi: 'h1h8',
    petunjuk: 'Raja hitam di pojok. Rajamu menjaga a7 dan b7.',
  },
  {
    id: 'm1-05', tema: 'Dua benteng (tangga)',
    fen: '7k/R7/8/8/8/8/8/1R4K1 w - - 0 1', solusi: 'b1b8',
    petunjuk: 'Satu benteng sudah menjaga baris ke-7. Benteng lain menyerang baris ke-8.',
  },
  {
    id: 'm1-06', tema: 'Benteng dibantu raja',
    fen: '7r/8/8/8/8/4k3/8/4K3 b - - 0 1', solusi: 'h8h1',
    petunjuk: 'Hitam jalan. Raja hitam menjaga kotak di depan raja putih.',
  },
  {
    id: 'm1-07', tema: 'Dua benteng untuk hitam',
    fen: '1r4k1/8/8/8/8/8/r7/7K b - - 0 1', solusi: 'b8b1',
    petunjuk: 'Hitam jalan. Benteng a2 sudah menutup baris ke-2.',
  },
  {
    id: 'm1-08', tema: 'Skakmat tercepat',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2', solusi: 'd8h4',
    petunjuk: 'Hitam jalan. Putih sudah membuka jalan diagonal ke rajanya.',
  },
  {
    id: 'm1-09', tema: 'Serangan ke kotak f7',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', solusi: 'h5f7',
    petunjuk: 'Kotak f7 hanya dijaga raja hitam, padahal gajahmu ikut mengincarnya.',
  },
  {
    id: 'm1-10', tema: 'Promosi pion',
    fen: '6k1/4Pppp/8/8/8/8/8/6K1 w - - 0 1', solusi: 'e7e8q',
    petunjuk: 'Pionmu tinggal satu langkah lagi menjadi bidak yang kuat.',
  },
  {
    id: 'm1-11', tema: 'Kuda mengurung raja (smothered mate)',
    fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', solusi: 'g5f7',
    petunjuk: 'Raja hitam dikelilingi bidaknya sendiri. Hanya kuda yang bisa melompat!',
  },
  {
    id: 'm1-12', tema: 'Kuda untuk hitam',
    fen: '6k1/8/8/8/6n1/8/6PP/6RK b - - 0 1', solusi: 'g4f2',
    petunjuk: 'Hitam jalan. Raja putih terkurung benteng dan pionnya sendiri.',
  },
  {
    id: 'm1-13', tema: 'Kuda di pojok',
    fen: 'kr6/pp6/8/3N4/8/8/8/6K1 w - - 0 1', solusi: 'd5c7',
    petunjuk: 'Cari kotak tempat kuda menyerang raja tanpa bisa dimakan pion.',
  },
  {
    id: 'm1-14', tema: 'Benteng dan kuda (Arabian mate)',
    fen: '7k/R7/5N2/8/8/8/8/6K1 w - - 0 1', solusi: 'a7h7',
    petunjuk: 'Kudamu menjaga kotak g8 dan h7.',
  },
  {
    id: 'm1-15', tema: 'Menteri dijaga gajah',
    fen: 'r1bq1rk1/pppp1pp1/2n5/8/8/3B3Q/PPPP1PPP/RNB1K1NR w KQ - 0 1', solusi: 'h3h7',
    petunjuk: 'Gajah d3 mengincar kotak h7.',
  },
  {
    id: 'm1-16', tema: 'Menteri dan gajah di diagonal panjang',
    fen: '6k1/5p1p/6pQ/8/8/8/1B6/6K1 w - - 0 1', solusi: 'h6g7',
    petunjuk: 'Gajah b2 mengincar sepanjang diagonal sampai g7.',
  },
  {
    id: 'm1-17', tema: 'Benteng dibantu gajah',
    fen: '4k3/5ppp/8/6B1/8/8/8/3R2K1 w - - 0 1', solusi: 'd1d8',
    petunjuk: 'Gajah g5 menjaga kotak e7 dan d8.',
  },
  {
    id: 'm1-18', tema: 'Menteri dibantu benteng',
    fen: '6k1/5ppp/8/8/8/8/1Q6/1R4K1 w - - 0 1', solusi: 'b2b8',
    petunjuk: 'Benteng b1 menjaga menterimu dari belakang.',
  },
];
