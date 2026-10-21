// avatar.js — 12 avatar pixel art untuk profil anak.
//
// Setiap avatar digambar pada grid 12x12. Karena wajahnya simetris, yang
// ditulis hanya separuh kiri (6 kolom); separuh kanan dibuat dengan mencerminkan.
// Satu huruf = satu warna di `palet`, titik (.) = transparan.

const cermin = setengah => setengah.map(b => b + [...b].reverse().join(''));

const K = '#222831'; // hitam untuk mata/garis

const DATA = [
  {
    id: 'peci', nama: 'Anak Berpeci', latar: '#8fd3ff',
    palet: { k: K, h: '#3b2a1a', s: '#f1c27d', e: K, m: '#c0392b', b: '#2e7d32', w: '#ffffff' },
    setengah: ['...kkk', '..kkkk', '..kkkk', '..hsss', '..ssss', '..sess',
      '..ssss', '..sssm', '...sss', '....ss', '..bbbw', '.bbbbw'],
  },
  {
    id: 'jilbab', nama: 'Anak Berjilbab', latar: '#ffe3ee',
    palet: { j: '#d6336c', s: '#f1c27d', e: K, m: '#c0392b' },
    setengah: ['...jjj', '..jjjj', '.jjjjj', '.jjsss', '.jssss', '.jsess',
      '.jssss', '.jsssm', '.jjsss', '.jjjss', 'jjjjjj', 'jjjjjj'],
  },
  {
    id: 'kucing', nama: 'Kucing', latar: '#fff3bf',
    palet: { o: '#f08c00', p: '#ff8fab', w: '#ffffff', k: K },
    setengah: ['.oo...', '.opo..', '.ooooo', 'oooooo', 'oowkoo', 'ookkoo',
      'ooooop', 'owwwoo', '.oowwk', '..oooo', '...oo.', '......'],
  },
  {
    id: 'kelinci', nama: 'Kelinci', latar: '#74c0fc',
    palet: { w: '#ffffff', p: '#ff8fab', k: K },
    setengah: ['..ww..', '..wp..', '..wp..', '..ww..', '.wwwww', 'wwwwww',
      'wwkwww', 'wwwwwp', 'wpwwww', '.wwwwk', '..wwww', '......'],
  },
  {
    id: 'panda', nama: 'Panda', latar: '#8ce99a',
    palet: { w: '#ffffff', k: K },
    setengah: ['......', '.kk...', 'kkkwww', '.kwwww', 'wwwwww', 'wkkkww',
      'wkwkww', 'wkkkwk', 'wwwwww', '.wwwwk', '..wwww', '......'],
  },
  {
    id: 'rubah', nama: 'Rubah', latar: '#c5f6fa',
    palet: { o: '#e8590c', w: '#ffffff', k: K },
    setengah: ['o.....', 'oo....', 'ooo...', 'oooooo', 'oooooo', 'okkooo',
      'wooooo', 'wwoooo', '.wwwoo', '..wwww', '....wk', '......'],
  },
  {
    id: 'harimau', nama: 'Harimau', latar: '#d0ebff',
    palet: { o: '#f76707', w: '#ffffff', k: K },
    setengah: ['.kk...', '.kok..', '.ooooo', 'okoook', 'oooooo', 'oowkoo',
      'ookkoo', 'oooook', 'wwwwww', '.wwwwk', '..wwww', '......'],
  },
  {
    id: 'komodo', nama: 'Komodo', latar: '#ffec99',
    palet: { g: '#5c940d', d: '#365314', y: '#fcc419', k: K, r: '#e03131' },
    setengah: ['......', '..gggg', '.ggggg', 'gggggg', 'gykggg', 'gggggg',
      'gdgdgg', 'gggggg', 'dddddd', '.ggggg', '....rr', '...r..'],
  },
  {
    id: 'burung-hantu', nama: 'Burung Hantu', latar: '#e5dbff',
    palet: { b: '#8b5a2b', c: '#d9a066', w: '#ffffff', k: K, y: '#fab005' },
    setengah: ['.b....', '.bb...', 'bbbbbb', 'bwwwbb', 'wwkkwb', 'wwkkwb',
      'bwwwby', 'bbcbbb', 'bcbcbb', 'bbcbbb', '.bbbbb', '..yy..'],
  },
  {
    id: 'katak', nama: 'Katak', latar: '#fff0f6',
    palet: { g: '#37b24d', w: '#ffffff', k: K, p: '#ff8fab', r: '#c92a2a' },
    setengah: ['......', '.ggg..', 'gwwwgg', 'gwkkgg', 'gggggg', 'gggggg',
      'gpgggg', 'ggrrrr', '.ggggg', '..gggg', '.gg...', '......'],
  },
  {
    id: 'gajah', nama: 'Gajah', latar: '#ffd8a8',
    palet: { a: '#868e96', d: '#495057', k: K, w: '#ffffff' },
    setengah: ['......', 'dd.aaa', 'ddaaaa', 'ddaaaa', 'ddakaa', 'ddaaaa',
      '.daaaa', '....wa', '....wa', '.....a', '....aa', '......'],
  },
  {
    id: 'anak-ayam', nama: 'Anak Ayam', latar: '#a5d8ff',
    palet: { y: '#fcc419', o: '#f76707', k: K, r: '#e03131', w: '#fff3bf' },
    setengah: ['......', '....rr', '..yyyy', '.yyyyy', 'yykyyy', 'yyyyyo',
      'yyyyyy', 'wyyyyy', 'yyyyyy', '.yyyyy', '..yyyy', '...o..'],
  },
];

export const AVATAR = DATA.map(({ setengah, ...a }) => ({ ...a, grid: cermin(setengah) }));
