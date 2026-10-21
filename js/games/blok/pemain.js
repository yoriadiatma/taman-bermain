// pemain.js — gerak pemain: berjalan, melompat, gravitasi, berenang, dan tabrakan dengan blok.
// Satuan: tile (1 = satu blok). Posisi (x, y) = titik tengah bawah (kaki) pemain.

export const KECEPATAN = 4.5;     // tile per detik
export const GRAVITASI = 32;      // tile per detik²
export const LOMPAT = 10.5;       // kecepatan awal lompatan (cukup untuk naik 1 blok)
export const LANGKAH_FISIKA = 1 / 120;

export class Pemain {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.lebar = 0.6;
    this.tinggi = 1.75;
    this.diTanah = false;
    this.diAir = false;
    this.arah = 1; // 1 = kanan, -1 = kiri
    this.jarakJalan = 0; // untuk animasi kaki
  }

  /** Jalankan fisika selama dt detik (dipecah menjadi langkah kecil agar tidak menembus blok). */
  perbarui(dt, input, dunia) {
    let sisa = Math.min(dt, 0.1);
    while (sisa > 1e-6) {
      const h = Math.min(LANGKAH_FISIKA, sisa);
      this._langkah(h, input, dunia);
      sisa -= h;
    }
  }

  _langkah(dt, input, dunia) {
    const arah = (input.kanan ? 1 : 0) - (input.kiri ? 1 : 0);
    if (arah) this.arah = arah;
    const target = arah * KECEPATAN * (this.diAir ? 0.55 : 1);
    const percepatan = this.diTanah || this.diAir ? 40 : 18; // di udara lebih sulit berbelok
    if (this.vx < target) this.vx = Math.min(target, this.vx + percepatan * dt);
    else if (this.vx > target) this.vx = Math.max(target, this.vx - percepatan * dt);

    if (this.diAir) {
      this.vy += GRAVITASI * 0.25 * dt;
      if (input.lompat) this.vy = Math.max(this.vy - 30 * dt, -4.5); // berenang ke atas
      this.vy = Math.min(this.vy, 3);
    } else {
      this.vy += GRAVITASI * dt;
      if (input.lompat && this.diTanah) this.vy = -LOMPAT;
      this.vy = Math.min(this.vy, 25);
    }

    this._geserX(this.vx * dt, dunia);
    this.diTanah = false;
    this._geserY(this.vy * dt, dunia);

    const tengah = Math.floor(this.y - this.tinggi * 0.5);
    this.diAir = dunia.cair(Math.floor(this.x), tengah) || dunia.cair(Math.floor(this.x), Math.floor(this.y - 0.1));
    if (this.diTanah && Math.abs(this.vx) > 0.1) this.jarakJalan += Math.abs(this.vx * dt);
  }

  _geserX(dx, dunia) {
    if (!dx) return;
    this.x += dx;
    const atas = Math.floor(this.y - this.tinggi);
    const bawah = Math.floor(this.y - 1e-6);
    if (dx > 0) {
      const tx = Math.floor(this.x + this.lebar / 2);
      for (let y = atas; y <= bawah; y++) {
        if (dunia.padat(tx, y)) { this.x = tx - this.lebar / 2 - 1e-4; this.vx = 0; return; }
      }
    } else {
      const tx = Math.floor(this.x - this.lebar / 2);
      for (let y = atas; y <= bawah; y++) {
        if (dunia.padat(tx, y)) { this.x = tx + 1 + this.lebar / 2 + 1e-4; this.vx = 0; return; }
      }
    }
  }

  _geserY(dy, dunia) {
    if (!dy) return;
    this.y += dy;
    const kiri = Math.floor(this.x - this.lebar / 2);
    const kanan = Math.floor(this.x + this.lebar / 2 - 1e-6);
    if (dy > 0) {
      const ty = Math.floor(this.y);
      for (let x = kiri; x <= kanan; x++) {
        if (dunia.padat(x, ty)) { this.y = ty; this.vy = 0; this.diTanah = true; return; }
      }
    } else {
      const ty = Math.floor(this.y - this.tinggi);
      for (let x = kiri; x <= kanan; x++) {
        if (dunia.padat(x, ty)) { this.y = ty + 1 + this.tinggi; this.vy = 0; return; }
      }
    }
  }

  /** Apakah kotak (tx, ty) bertabrakan dengan badan pemain? (dipakai saat menaruh blok) */
  menempati(tx, ty) {
    return tx + 1 > this.x - this.lebar / 2 && tx < this.x + this.lebar / 2 && ty + 1 > this.y - this.tinggi && ty < this.y;
  }
}
