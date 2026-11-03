'use client';

import Link from 'next/link';
import { useState } from 'react';

/* ---------- Ikon (SVG inline, tanpa dependensi) ---------- */

const IkonLogo = () => (
  <svg viewBox="0 0 100 120" className="h-24 w-24 drop-shadow-[0_10px_14px_rgba(37,99,235,0.35)]" aria-hidden>
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1d4ed8" />
        <stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#60a5fa" />
        <stop offset="1" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#c7d2fe" />
      </linearGradient>
    </defs>
    <path d="M6 62C4 48 18 40 34 46C26 58 30 76 44 98C22 98 8 82 6 62Z" fill="url(#g1)" />
    <path d="M26 44C24 28 40 18 58 24C48 38 52 58 66 80C42 82 28 64 26 44Z" fill="url(#g2)" />
    <path d="M52 20C50 8 62 0 76 4C70 14 74 30 90 46C68 46 54 34 52 20Z" fill="url(#g3)" />
  </svg>
);

const IkonTagihan = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);

const IkonPanah = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const IkonBulan = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />
  </svg>
);

const IkonMatahari = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const IkonAdmin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
    <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IkonBantuan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" />
  </svg>
);

/* ---------- Halaman ---------- */

export default function HalamanUtama() {
  const [gelap, setGelap] = useState(false);

  // Semua warna tema dikumpulkan di sini supaya mudah diubah
  const t = gelap
    ? {
        bg: 'bg-gradient-to-b from-[#141b2d] via-[#182238] to-[#111827]',
        judul: 'text-white',
        sub: 'text-slate-400',
        teks: 'text-slate-200',
        ikon: 'text-slate-400',
        placeholder: 'placeholder:text-slate-500',
        panel:
          'bg-white/[0.06] border border-white/10 shadow-[8px_8px_20px_rgba(0,0,0,0.45),-6px_-6px_16px_rgba(255,255,255,0.04)]',
        input:
          'bg-white/[0.05] border border-white/10 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.45),inset_-3px_-3px_8px_rgba(255,255,255,0.04)]',
        garis: 'bg-slate-600',
        bulatBesar: 'bg-blue-500/10 border-blue-400/20',
        bulatKecil: 'bg-blue-500/20 border-blue-400/20',
      }
    : {
        bg: 'bg-gradient-to-b from-[#f0f5fc] via-[#e6eefa] to-[#dde7f6]',
        judul: 'text-[#0b1230]',
        sub: 'text-slate-500',
        teks: 'text-slate-700',
        ikon: 'text-slate-500',
        placeholder: 'placeholder:text-slate-400',
        panel:
          'bg-white/50 border border-white/80 shadow-[10px_10px_24px_rgba(163,184,214,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)]',
        input:
          'bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]',
        garis: 'bg-blue-300/70',
        bulatBesar: 'bg-gradient-to-br from-blue-200/60 to-blue-100/40 border-white/80',
        bulatKecil: 'bg-gradient-to-br from-blue-300/50 to-blue-100/50 border-white/80',
      };

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans transition-colors duration-500 ${t.bg} ${t.teks}`}>
      {/* Dekorasi bentuk melengkung di sudut */}
      <div aria-hidden className={`pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[14px] ${t.bulatBesar} shadow-[inset_0_0_30px_rgba(96,140,255,0.25)]`} />
      <div aria-hidden className={`pointer-events-none absolute -right-16 top-[22%] h-36 w-36 rounded-full border ${t.bulatKecil} shadow-[inset_-6px_-6px_16px_rgba(96,140,255,0.25)]`} />
      <div aria-hidden className={`pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full border-[10px] ${t.bulatBesar}`} />
      <div aria-hidden className={`pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full border-[10px] ${t.bulatBesar}`} />

      {/* Tombol tema */}
      <button
        type="button"
        onClick={() => setGelap((v) => !v)}
        aria-label={gelap ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
        className={`absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-2xl backdrop-blur-md transition-transform active:scale-95 ${t.panel} ${gelap ? 'text-amber-300' : 'text-[#0b1230]'}`}
      >
        {gelap ? <IkonMatahari /> : <IkonBulan />}
      </button>

      <main className="relative z-[1] mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center px-6 py-14">
        {/* Logo */}
        <div className={`mb-8 flex h-40 w-40 items-center justify-center rounded-[2.5rem] backdrop-blur-xl ${t.panel}`}>
          <IkonLogo />
        </div>

        {/* Judul */}
        <h1 className={`text-[2rem] font-extrabold tracking-tight ${t.judul}`}>Kelas Tambahan</h1>
        <p className={`mb-9 mt-2 text-center text-sm leading-relaxed tracking-wide ${t.sub}`}>
          Masukkan ID Tagihan untuk melihat rincian dan membayar via QRIS
        </p>

        {/* Form */}
        <form action="/cari" method="GET" className="flex w-full flex-col gap-5">
          <label className={`flex items-center gap-4 rounded-2xl px-5 py-4 backdrop-blur-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500/50 ${t.input}`}>
            <IkonTagihan className={`h-6 w-6 shrink-0 ${t.ikon}`} />
            <input
              type="text"
              name="id"
              required
              autoComplete="off"
              placeholder="ID Tagihan (INV-202610...)"
              className={`w-full bg-transparent font-medium uppercase tracking-wide outline-none ${t.teks} ${t.placeholder} placeholder:normal-case placeholder:tracking-normal`}
            />
          </label>

          <button
            type="submit"
            className="group relative flex w-full items-center justify-center rounded-full border border-white/40 bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-lg font-bold text-white shadow-[0_14px_28px_rgba(59,91,245,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform active:scale-[0.98]"
          >
            Cari Tagihan
            <span className="absolute right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
              <IkonPanah />
            </span>
          </button>
        </form>

        {/* Pemisah */}
        <div className="my-8 flex w-full items-center gap-4">
          <span className={`h-px flex-1 ${t.garis}`} />
          <span className={`text-xs tracking-[0.25em] ${t.sub}`}>ATAU BUKA</span>
          <span className={`h-px flex-1 ${t.garis}`} />
        </div>

        {/* Tautan cepat (menggantikan tombol sosial pada referensi) */}
        <div className="flex gap-5">
          <Link
            href="/admin"
            aria-label="Area Admin"
            className={`flex h-[72px] w-[84px] flex-col items-center justify-center gap-1 rounded-2xl backdrop-blur-md transition-transform active:scale-95 ${t.panel} ${gelap ? 'text-blue-300' : 'text-blue-600'}`}
          >
            <IkonAdmin />
            <span className={`text-[11px] font-semibold ${t.sub}`}>Admin</span>
          </Link>
          <Link
            href="#"
            aria-label="Bantuan"
            className={`flex h-[72px] w-[84px] flex-col items-center justify-center gap-1 rounded-2xl backdrop-blur-md transition-transform active:scale-95 ${t.panel} ${gelap ? 'text-blue-300' : 'text-blue-600'}`}
          >
            <IkonBantuan />
            <span className={`text-[11px] font-semibold ${t.sub}`}>Bantuan</span>
          </Link>
        </div>

        <p className={`mt-10 text-[11px] tracking-[0.3em] ${t.sub}`}>BAYAR &nbsp;•&nbsp; CEK &nbsp;•&nbsp; BELAJAR</p>
      </main>
    </div>
  );
}
