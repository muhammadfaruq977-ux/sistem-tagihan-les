"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ---------- Ikon (SVG inline, tanpa dependensi) ---------- */

const IkonLogo = () => (
  <svg viewBox="0 0 100 120" className="h-24 w-24 drop-shadow-[0_10px_14px_rgba(37,99,235,0.35)]" aria-hidden>
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1d4ed8" />
        <stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#60a5fa" />
        <stop offset="1" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="lg3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#c7d2fe" />
      </linearGradient>
    </defs>
    <path d="M6 62C4 48 18 40 34 46C26 58 30 76 44 98C22 98 8 82 6 62Z" fill="url(#lg1)" />
    <path d="M26 44C24 28 40 18 58 24C48 38 52 58 66 80C42 82 28 64 26 44Z" fill="url(#lg2)" />
    <path d="M52 20C50 8 62 0 76 4C70 14 74 30 90 46C68 46 54 34 52 20Z" fill="url(#lg3)" />
  </svg>
);

const IkonKunci = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 15v2" />
  </svg>
);

const IkonMata = ({ tercoret }: { tercoret: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {tercoret && <path d="M4 4l16 16" />}
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

/* ---------- Halaman ---------- */

export default function HalamanLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lihat, setLihat] = useState(false);
  const [ingat, setIngat] = useState(true);
  const [gelap, setGelap] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Password salah!');
      setLoading(false);
    }
  };

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
        kotak: 'bg-white/[0.06] border-white/20',
        tautan: 'text-blue-300 hover:text-blue-200',
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
        kotak: 'bg-white/70 border-slate-300',
        tautan: 'text-blue-600 hover:text-blue-700',
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
        <h1 className={`text-[2rem] font-extrabold tracking-tight ${t.judul}`}>Welcome Back</h1>
        <p className={`mb-9 mt-2 text-sm tracking-[0.3em] ${t.sub}`}>Sign in to continue</p>

        <form onSubmit={handleLogin} className="flex w-full flex-col gap-5">
          {/* Input password */}
          <label className={`flex items-center gap-4 rounded-2xl px-5 py-4 backdrop-blur-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500/50 ${t.input}`}>
            <IkonKunci className={`h-6 w-6 shrink-0 ${t.ikon}`} />
            <input
              type={lihat ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className={`w-full bg-transparent font-medium outline-none ${t.teks} ${t.placeholder}`}
            />
            <button
              type="button"
              onClick={() => setLihat((v) => !v)}
              aria-label={lihat ? 'Sembunyikan password' : 'Tampilkan password'}
              className={`shrink-0 ${t.ikon}`}
            >
              <IkonMata tercoret={!lihat} />
            </button>
          </label>

          {error && (
            <p role="alert" className="text-center text-sm font-bold text-red-500">
              {error}
            </p>
          )}

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between px-1">
            <label className={`flex cursor-pointer items-center gap-2.5 text-sm font-medium ${t.teks}`}>
              <input
                type="checkbox"
                checked={ingat}
                onChange={(e) => setIngat(e.target.checked)}
                className="peer sr-only"
              />
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/60 ${
                  ingat
                    ? 'border-transparent bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_4px_10px_rgba(59,91,245,0.4)]'
                    : t.kotak
                }`}
              >
                {ingat && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white" aria-hidden>
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              Remember Me
            </label>
            <a href="#" className={`text-sm font-bold ${t.tautan}`}>
              Forgot Password?
            </a>
          </div>

          {/* Tombol login */}
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center rounded-full border border-white/40 bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-lg font-bold text-white shadow-[0_14px_28px_rgba(59,91,245,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Login'}
            {!loading && (
              <span className="absolute right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                <IkonPanah />
              </span>
            )}
          </button>
        </form>

        <Link href="/" className={`mt-8 text-sm font-semibold ${t.tautan}`}>
          Back to home
        </Link>

        <p className={`mt-8 text-[11px] tracking-[0.3em] ${t.sub}`}>PLAY &nbsp;•&nbsp; COMPETE &nbsp;•&nbsp; GROW TOGETHER</p>
      </main>
    </div>
  );
}
