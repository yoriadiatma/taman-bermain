// render.js — menggambar dunia ke canvas. Hanya tile yang terlihat di layar yang digambar.

import { B, BLOK, padat } from './blok.js';
import { LEBAR, TINGGI } from './dunia.js';
import { buatAtlas, buatSprite, UKURAN, LATAR_GUA, SPRITE_LEBAR, SPRITE_TINGGI } from './tekstur.js';

// Bayangan bawah tanah: makin dalam makin gelap, paling gelap 50% agar bijih tetap terlihat.
const GELAP = Array.from({ length: 11 }, (_, i) => `rgba(0, 0, 0, ${(i * 0.05).toFixed(3)})`);

/** Tingkat terang siang (0 = malam, 1 = siang) dari waktu 0..1 dalam satu hari. */
export function terangSiang(waktu) {
  const t = ((waktu % 1) + 1) % 1;
  if (t < 0.5) return 1;
  if (t < 0.6) return 1 - (t - 0.5) / 0.1; // senja
  if (t < 0.9) return 0;
  return (t - 0.9) / 0.1; // fajar
}

const campur = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
const LANGIT = { siangAtas: [95, 180, 240], siangBawah: [191, 230, 255], malamAtas: [11, 22, 48], malamBawah: [34, 50, 90] };

export class Penggambar {
  constructor(kanvas) {
    this.kanvas = kanvas;
    this.ctx = kanvas.getContext('2d', { alpha: false });
    this.atlas = buatAtlas();
    this.sprite = buatSprite('peci');
    this.tile = 32;
    // Posisi bintang dan awan (pecahan 0..1 dari layar), dibuat sekali.
    this.bintang = Array.from({ length: 70 }, (_, i) => [((i * 97) % 101) / 101, ((i * 53) % 61) / 61 * 0.6]);
    this.awan = Array.from({ length: 7 }, (_, i) => ({ x: i * 57 + 10, y: 6 + (i * 13) % 14, w: 5 + (i % 3) * 2 }));
  }

  setKarakter(nama) {
    this.sprite = buatSprite(nama);
  }

  /** Sesuaikan ukuran canvas dengan ukuran tampilannya (dalam piksel CSS). */
  ukur(lebarCss, tinggiCss) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.kanvas.width = Math.max(1, Math.round(lebarCss * dpr));
    this.kanvas.height = Math.max(1, Math.round(tinggiCss * dpr));
    // Sekitar 15 blok terlihat secara vertikal; ukuran blok dibulatkan agar tidak ada celah.
    this.tile = Math.round(Math.min(44, Math.max(24, tinggiCss / 15)) * dpr);
    this.ctx.imageSmoothingEnabled = false;
  }

  get lebarTile() { return this.kanvas.width / this.tile; }
  get tinggiTile() { return this.kanvas.height / this.tile; }

  /** Ubah posisi layar (piksel CSS) menjadi koordinat tile dunia. */
  keDunia(xCss, yCss, kamera) {
    const dpr = this.kanvas.width / this.kanvas.getBoundingClientRect().width;
    return { x: kamera.x + (xCss * dpr) / this.tile, y: kamera.y + (yCss * dpr) / this.tile };
  }

  /**
   * sorot: { x, y, jangkau } kotak yang ditunjuk; retak: { x, y, progres 0..1 } blok yang sedang ditambang.
   */
  gambar({ dunia, pemain, kamera, waktu, sorot = null, retak = null }) {
    const { ctx, tile: T, kanvas } = this;
    const W = kanvas.width;
    const H = kanvas.height;
    const siang = terangSiang(waktu);
    const bx = Math.round(kamera.x * T);
    const by = Math.round(kamera.y * T);
    const px = x => x * T - bx;
    const py = y => y * T - by;

    // Langit
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(campur(LANGIT.malamAtas, LANGIT.siangAtas, siang)));
    g.addColorStop(1, rgb(campur(LANGIT.malamBawah, LANGIT.siangBawah, siang)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    this._gambarBendaLangit(W, H, waktu, siang, kamera);

    const x0 = Math.max(0, Math.floor(kamera.x));
    const x1 = Math.min(LEBAR - 1, Math.ceil(kamera.x + this.lebarTile));
    const y0 = Math.max(0, Math.floor(kamera.y));
    const y1 = Math.min(TINGGI - 1, Math.ceil(kamera.y + this.tinggiTile));
    const atlas = this.atlas;
    const air = [];

    // Obor di sekitar layar menerangi bawah tanah.
    const obor = [];
    const R = 6;
    for (let y = Math.max(0, y0 - R); y <= Math.min(TINGGI - 1, y1 + R); y++) {
      for (let x = Math.max(0, x0 - R); x <= Math.min(LEBAR - 1, x1 + R); x++) {
        if (dunia.tile[y * LEBAR + x] === B.OBOR) obor.push(x, y);
      }
    }
    const tingkatGelap = (x, y, dalam) => {
      let g = Math.min(10, (dalam + 1) >> 1);
      for (let i = 0; i < obor.length && g > 0; i += 2) {
        const d = Math.hypot(obor[i] - x, obor[i + 1] - y);
        if (d < R) g = Math.min(g, Math.floor((g * d) / R));
      }
      return g;
    };

    // Blok, dinding gua, dan bayangan bawah tanah
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const id = dunia.tile[y * LEBAR + x];
        const dalam = y - dunia.permukaan[x];
        if (id === B.AIR) { air.push(x, y); continue; }
        // Di bawah tanah, blok yang tidak penuh (udara, obor, pintu, kaca) berlatar dinding gua.
        if (dalam > 0 && (id === B.UDARA || !padat(id) || BLOK[id].tembusCahaya)) {
          ctx.drawImage(atlas, LATAR_GUA * UKURAN, 0, UKURAN, UKURAN, px(x), py(y), T, T);
        }
        if (id !== B.UDARA) ctx.drawImage(atlas, id * UKURAN, 0, UKURAN, UKURAN, px(x), py(y), T, T);
        if (id === B.UDARA && dalam <= 0) continue; // langit
        if (dalam > 1 && id !== B.OBOR) {
          const g = tingkatGelap(x, y, dalam);
          if (g > 0) {
            ctx.fillStyle = GELAP[g];
            ctx.fillRect(px(x), py(y), T, T);
          }
        }
      }
    }

    // Retakan pada blok yang sedang ditambang
    if (retak && retak.progres > 0) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.lineWidth = Math.max(2, T / 12);
      const n = 1 + Math.floor(retak.progres * 4);
      const ox = px(retak.x);
      const oy = py(retak.y);
      ctx.beginPath();
      const garis = [[0.5, 0.5, 0.15, 0.2], [0.5, 0.5, 0.85, 0.3], [0.5, 0.5, 0.3, 0.9], [0.5, 0.5, 0.8, 0.85]];
      for (let i = 0; i < n; i++) {
        const [a, b, c, d] = garis[i];
        ctx.moveTo(ox + a * T, oy + b * T);
        ctx.lineTo(ox + c * T, oy + d * T);
      }
      ctx.stroke();
    }

    // Pemain
    const bergerak = pemain.diTanah && Math.abs(pemain.vx) > 0.2;
    const langkahKaki = bergerak ? Math.floor(pemain.jarakJalan * 2.5) % 2 : 0;
    const bingkai = (pemain.arah > 0 ? 0 : 2) + langkahKaki;
    const lebarS = (SPRITE_LEBAR / UKURAN) * T;
    const tinggiS = (SPRITE_TINGGI / UKURAN) * T;
    ctx.drawImage(this.sprite, bingkai * SPRITE_LEBAR, 0, SPRITE_LEBAR, SPRITE_TINGGI,
      Math.round(pemain.x * T - bx - lebarS / 2), Math.round(pemain.y * T - by - tinggiS), Math.round(lebarS), Math.round(tinggiS));

    // Air digambar setelah pemain agar pemain tampak terendam
    for (let i = 0; i < air.length; i += 2) {
      const x = air[i];
      const y = air[i + 1];
      const atasAir = dunia.tile[(y - 1) * LEBAR + x] !== B.AIR;
      ctx.drawImage(atlas, B.AIR * UKURAN, atasAir ? 0 : 1, UKURAN, atasAir ? UKURAN : UKURAN - 1, px(x), py(y), T, T);
    }

    // Kotak yang sedang ditunjuk: putih jika terjangkau, merah jika terlalu jauh
    if (sorot) {
      ctx.strokeStyle = sorot.jangkau ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 90, 90, 0.8)';
      ctx.lineWidth = Math.max(2, T / 16);
      ctx.strokeRect(px(sorot.x) + 1, py(sorot.y) + 1, T - 2, T - 2);
    }

    // Malam: seluruh layar sedikit gelap kebiruan
    if (siang < 1) {
      ctx.fillStyle = `rgba(8, 16, 48, ${(0.45 * (1 - siang)).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  _gambarBendaLangit(W, H, waktu, siang, kamera) {
    const { ctx, tile: T } = this;
    const t = ((waktu % 1) + 1) % 1;
    // Bintang muncul saat malam
    if (siang < 1) {
      ctx.fillStyle = `rgba(255, 255, 230, ${(1 - siang).toFixed(2)})`;
      const s = Math.max(2, Math.round(T / 14));
      for (const [bx, byy] of this.bintang) ctx.fillRect(Math.round(bx * W), Math.round(byy * H), s, s);
    }
    // Matahari bergerak saat siang (0..0.6), bulan saat malam (0.6..1)
    const siangHari = t < 0.6;
    const p = siangHari ? t / 0.6 : (t - 0.6) / 0.4;
    const cx = W * (0.1 + 0.8 * p);
    const cy = H * (0.45 - Math.sin(p * Math.PI) * 0.33);
    const r = T * 0.9;
    ctx.fillStyle = siangHari ? '#ffd43b' : '#f1f3f5';
    ctx.fillRect(Math.round(cx - r), Math.round(cy - r), Math.round(r * 2), Math.round(r * 2));
    if (!siangHari) {
      ctx.fillStyle = '#ced4da';
      ctx.fillRect(Math.round(cx - r * 0.4), Math.round(cy - r * 0.3), Math.round(r * 0.5), Math.round(r * 0.5));
    }
    // Awan bergerak pelan dengan paralaks
    ctx.fillStyle = `rgba(255, 255, 255, ${(0.35 + 0.5 * siang).toFixed(2)})`;
    const geser = kamera.x * 0.3 * T;
    const lebarLangit = W + 20 * T;
    for (const a of this.awan) {
      const x = ((a.x * T - geser) % lebarLangit + lebarLangit) % lebarLangit - 10 * T;
      const y = a.y * T * 0.5 - kamera.y * T * 0.1;
      ctx.fillRect(Math.round(x), Math.round(y), a.w * T, T * 0.6);
      ctx.fillRect(Math.round(x + T), Math.round(y - T * 0.4), (a.w - 2) * T, T * 0.5);
    }
  }
}
