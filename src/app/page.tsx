// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const PAKET_LES = [
  { nama: 'Paket 1 Kelas', harga: 'Rp 50.000 / 100.000', desc: 'Bimbingan rutin untuk 1 pilihan kelas (Akademik, Tahfidz, atau Ekstra).' },
  { nama: 'Paket 2 Kelas', harga: 'Rp 150.000 / 200.000', desc: 'Bimbingan gabungan untuk 2 pilihan kelas sekaligus dalam satu tagihan.' },
  { nama: 'Paket 3 Kelas', harga: 'Rp 250.000', desc: 'Bimbingan lengkap untuk 3 pilihan kelas sekaligus (Akademik, Tahfidz, Ekstra).' },
];

export default function HalamanUtama() {
  const [gelap, setGelap] = useState(false);
  const [idTagihan, setIdTagihan] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCari = (e: React.FormEvent) => {
    e.preventDefault();
    if (idTagihan.trim()) router.push(`/bayar/${idTagihan.trim()}`);
  };

  const fokusKeInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputRef.current?.focus({ preventScroll: true });
  };

  const t = gelap
    ? {
        bg: 'bg-gradient-to-b from-[#141b2d] via-[#182238] to-[#111827]',
        judul: 'text-white',
        sub: 'text-slate-400',
        teks: 'text-slate-200',
        ikon: 'text-slate-400',
        placeholder: 'placeholder:text-slate-500',
        panel: 'bg-white/[0.06] border border-white/10 shadow-[8px_8px_20px_rgba(0,0,0,0.45),-6px_-6px_16px_rgba(255,255,255,0.04)]',
        input: 'bg-white/[0.05] border border-white/10 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.45),inset_-3px_-3px_8px_rgba(255,255,255,0.04)]',
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
        panel: 'bg-white/50 border border-white/80 shadow-[10px_10px_24px_rgba(163,184,214,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)]',
        input: 'bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]',
        garis: 'bg-blue-300/70',
        bulatBesar: 'bg-gradient-to-br from-blue-200/60 to-blue-100/40 border-white/80',
        bulatKecil: 'bg-gradient-to-br from-blue-300/50 to-blue-100/50 border-white/80',
      };

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans transition-colors duration-500 ${t.bg} ${t.teks}`}>
      <div aria-hidden className={`pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[14px] ${t.bulatBesar}`} />
      <div aria-hidden className={`pointer-events-none absolute -right-16 top-[22%] h-36 w-36 rounded-full border ${t.bulatKecil}`} />
      <div aria-hidden className={`pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full border-[10px] ${t.bulatBesar}`} />

      <button
        type="button"
        onClick={() => setGelap((v) => !v)}
        aria-label="Ubah tema"
        className={`absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-2xl backdrop-blur-md transition-transform active:scale-95 ${t.panel} ${gelap ? 'text-amber-300' : 'text-[#0b1230]'}`}
      >
        {gelap ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="12" cy="12" r="4" fill="currentColor" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" /></svg>
        )}
      </button>

      <main className="relative z-[1] mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-6 py-14">
        <section className="flex w-full max-w-sm flex-col items-center">
          <div className={`mb-8 flex h-40 w-40 items-center justify-center rounded-[2.5rem] backdrop-blur-xl ${t.panel}`}>
            <Image src="/logo-sekolah.png" alt="Logo Sekolah" width={96} height={96} className="h-auto w-auto object-contain drop-shadow-[0_10px_14px_rgba(37,99,235,0.35)]" priority />
          </div>

          <h1 className={`text-[2rem] font-extrabold tracking-tight ${t.judul}`}>Kelas Tambahan</h1>
          <p className={`mb-9 mt-2 text-center text-sm leading-relaxed ${t.sub}`}>
            Masukkan ID Tagihan untuk melihat rincian dan membayar via QRIS
          </p>

          <form onSubmit={handleCari} className="flex w-full flex-col gap-5">
            <label className={`flex items-center gap-4 rounded-2xl px-5 py-4 backdrop-blur-md focus-within:ring-2 focus-within:ring-blue-500/50 ${t.input}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-6 w-6 shrink-0 ${t.ikon}`}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6" /></svg>
              <input
                ref={inputRef}
                type="text"
                value={idTagihan}
                onChange={(e) => setIdTagihan(e.target.value)}
                required
                autoComplete="off"
                placeholder="ID Tagihan (INV-202610...)"
                className={`w-full bg-transparent font-medium uppercase tracking-wide outline-none ${t.teks} ${t.placeholder} placeholder:normal-case`}
              />
            </label>

            <button
              type="submit"
              className="group relative flex w-full items-center justify-center rounded-full border border-white/40 bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-lg font-bold text-white shadow-[0_14px_28px_rgba(59,91,245,0.45)] transition-transform active:scale-[0.98]"
            >
              Cari Tagihan
              <span className="absolute right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </button>
          </form>

          <div className="my-8 flex w-full items-center gap-4">
            <span className={`h-px flex-1 ${t.garis}`} />
            <span className={`text-xs tracking-[0.25em] ${t.sub}`}>ATAU BUKA</span>
            <span className={`h-px flex-1 ${t.garis}`} />
          </div>

          <div className="flex gap-5">
            <Link href="/admin" className={`flex h-[72px] w-[84px] flex-col items-center justify-center gap-1 rounded-2xl backdrop-blur-md ${t.panel} ${gelap ? 'text-blue-300' : 'text-blue-600'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3zM9 12l2 2 4-4" /></svg>
              <span className={`text-[11px] font-semibold ${t.sub}`}>Admin</span>
            </Link>
            <Link href="#kontak-support" className={`flex h-[72px] w-[84px] flex-col items-center justify-center gap-1 rounded-2xl backdrop-blur-md ${t.panel} ${gelap ? 'text-blue-300' : 'text-blue-600'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" /></svg>
              <span className={`text-[11px] font-semibold ${t.sub}`}>Bantuan</span>
            </Link>
          </div>
        </section>

        <section id="program-spp" className="mt-16 w-full">
          <div className="mb-8 text-center">
            <h2 className={`text-2xl font-extrabold ${t.judul}`}>Program Bimbingan & Biaya SPP</h2>
            <p className={`mt-1 text-sm ${t.sub}`}>Layanan pendidikan kelas tambahan dengan pembayaran bulanan</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PAKET_LES.map((p) => (
              <div key={p.nama} className={`flex flex-col justify-between rounded-[2rem] p-6 backdrop-blur-xl ${t.panel}`}>
                <div>
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-500">SPP Bulanan</span>
                  <h3 className={`mt-4 text-xl font-extrabold ${t.judul}`}>{p.nama}</h3>
                  <p className="mt-2 text-2xl font-black text-blue-600">
                    {p.harga} <span className={`text-xs font-semibold ${t.sub}`}>/ bulan</span>
                  </p>
                  <p className={`mt-3 text-sm leading-relaxed ${t.sub}`}>{p.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={fokusKeInput}
                  className="mt-6 block w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-center text-sm font-bold text-white shadow-[0_8px_18px_rgba(59,91,245,0.3)] transition-transform active:scale-[0.98]"
                >
                  Masukkan ID Tagihan
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer id="kontak-support" className={`mt-14 w-full rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl ${t.panel}`}>
          <h2 className={`text-lg font-extrabold ${t.judul}`}>Kontak Support & Informasi Usaha</h2>
          <p className={`mt-1 mb-5 text-xs ${t.sub}`}>Kelas Tambahan Integral — Layanan Administrasi & Bantuan Wali Murid</p>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className={`text-xs font-bold uppercase ${t.sub}`}>Email Support</p>
              <p className={`mt-1 font-semibold break-all ${t.judul}`}>am073178@gmail.com</p>
            </div>
            <div>
              <p className={`text-xs font-bold uppercase ${t.sub}`}>Telepon / WhatsApp</p>
              <p className={`mt-1 font-semibold ${t.judul}`}>0878-2449-5664 (Ust. Tomi)</p>
            </div>
            <div>
              <p className={`text-xs font-bold uppercase ${t.sub}`}>Alamat Usaha</p>
              <p className={`mt-1 font-semibold ${t.judul}`}>Jl. Hidayatullah No. 6 Lingk. Dasan Sari Kel. Kebon Sari, Kec. Ampenan, Kota Mataram, NTB</p>
            </div>
          </div>
        </footer>

        <p className={`mt-10 text-[11px] tracking-[0.3em] ${t.sub}`}>BAYAR &nbsp;•&nbsp; CEK &nbsp;•&nbsp; BELAJAR</p>
      </main>
    </div>
  );
}