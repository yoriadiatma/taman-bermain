// profil.js — layar pilih profil dan formulir buat/ubah profil.

import { el, avatarSvg, kepalaAplikasi, toast } from '../core/ui.js';
import * as profil from '../core/profile.js';
import { ke } from '../core/router.js';
import { AVATAR } from '../../data/avatar.js';

export function tampilPilihProfil(app) {
  const daftar = profil.semua();

  const kartu = daftar.map(p => el('div', { class: 'kartu-profil' },
    el('button', {
      class: 'pilih-profil',
      type: 'button',
      onclick: () => { profil.pilih(p.id); ke('/hub'); },
    },
    el('span', { class: 'avatar besar', html: avatarSvg(p.avatar) }),
    el('span', { class: 'nama-profil', text: p.nama }),
    el('span', { class: 'kelas-profil' }, `Kelas ${p.kelas}`)),
    el('button', {
      class: 'tombol kedua kecil',
      type: 'button',
      'aria-label': `Ubah profil ${p.nama}`,
      onclick: () => ke(`/profil/ubah/${p.id}`),
    }, 'Ubah')));

  kartu.push(el('button', { class: 'kartu-baru', type: 'button', onclick: () => ke('/profil/baru') },
    el('span', { class: 'plus', 'aria-hidden': 'true' }, '+'),
    'Buat Profil Baru'));

  app.replaceChildren(el('main', { class: 'layar' },
    el('header', { class: 'bilah-atas' }, kepalaAplikasi()),
    el('h1', { tabindex: '-1' }, daftar.length ? 'Siapa yang mau bermain?' : 'Ayo buat profilmu dulu!'),
    el('div', { class: 'grid-profil' }, kartu),
    el('div', { class: 'bawah-layar' },
      el('button', { class: 'tombol kedua', type: 'button', onclick: () => ke('/guru') }, 'Mode Guru'))));
}

export function tampilFormProfil(app, id = null) {
  const lama = id ? profil.ambil(id) : null;
  if (id && !lama) {
    ke('/profil');
    return;
  }
  let avatar = lama?.avatar ?? AVATAR[0].id;
  let kelas = lama?.kelas ?? null;

  const inputNama = el('input', {
    id: 'nama-profil', class: 'masukan', type: 'text', autocomplete: 'off',
    maxlength: String(profil.MAKS_NAMA), placeholder: 'Contoh: Aisyah',
  });
  inputNama.value = lama?.nama ?? '';
  const galat = el('p', { class: 'galat', role: 'alert' });

  const tombolAvatar = AVATAR.map(a => el('button', {
    type: 'button',
    class: 'pilih-avatar',
    title: a.nama,
    'aria-label': a.nama,
    'aria-pressed': String(a.id === avatar),
    html: avatarSvg(a.id),
    onclick: () => {
      avatar = a.id;
      tombolAvatar.forEach((t, i) => t.setAttribute('aria-pressed', String(AVATAR[i].id === avatar)));
    },
  }));

  const tombolKelas = profil.KELAS_TERSEDIA.map(k => el('button', {
    type: 'button',
    class: 'tombol kedua pilih-kelas',
    'aria-pressed': String(k === kelas),
    onclick: () => {
      kelas = k;
      tombolKelas.forEach((t, i) => t.setAttribute('aria-pressed', String(profil.KELAS_TERSEDIA[i] === kelas)));
    },
  }, `Kelas ${k}`));

  function simpan(e) {
    e.preventDefault();
    const isian = { nama: inputNama.value, avatar, kelas };
    try {
      if (lama) {
        profil.ubah(lama.id, isian);
        toast('Profil sudah diperbarui.', 'sukses');
        ke('/profil');
      } else {
        const p = profil.buat(isian);
        toast(`Profil ${p.nama} sudah dibuat.`, 'sukses');
        ke('/hub');
      }
    } catch (err) {
      galat.textContent = err.message;
    }
  }

  app.replaceChildren(el('main', { class: 'layar' },
    el('header', { class: 'bilah-atas' }, kepalaAplikasi()),
    el('h1', { tabindex: '-1' }, lama ? 'Ubah Profil' : 'Buat Profil Baru'),
    el('form', { class: 'panel form-profil', onsubmit: simpan, novalidate: true },
      el('label', { for: 'nama-profil', class: 'label-besar' }, 'Siapa namamu?'),
      inputNama,
      el('p', { class: 'label-besar', id: 'label-avatar' }, 'Pilih gambarmu'),
      el('div', { class: 'grid-avatar', role: 'group', 'aria-labelledby': 'label-avatar' }, tombolAvatar),
      el('p', { class: 'label-besar', id: 'label-kelas' }, 'Kamu kelas berapa?'),
      el('div', { class: 'grup-kelas', role: 'group', 'aria-labelledby': 'label-kelas' }, tombolKelas),
      galat,
      el('div', { class: 'baris-tombol' },
        el('button', { class: 'tombol kedua', type: 'button', onclick: () => ke('/profil') }, 'Batal'),
        el('button', { class: 'tombol utama', type: 'submit' }, lama ? 'Simpan' : 'Buat Profil')),
      lama && el('p', { class: 'catatan' }, 'Profil bisa dihapus lewat Mode Guru.'))));
}
