// src/app/admin/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import TombolLogout from './TombolLogout';
import { Suspense } from 'react';
import { connection } from 'next/server';

/* ---------- Ikon & Komponen Pendukung ---------- */
const Ikon = ({ children, className = 'h-6 w-6' }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {children}
  </svg>
);

const IkonLogo = ({ ukuran = 'h-10 w-10' }: { ukuran?: string }) => (
  <svg viewBox="0 0 100 120" className={`${ukuran} drop-shadow-[0_4px_6px_rgba(37,99,235,0.35)]`} aria-hidden>
    <defs>
      <linearGradient id="ag1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1d4ed8" /><stop offset="1" stopColor="#1e3a8a" /></linearGradient>
      <linearGradient id="ag2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#60a5fa" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
      <linearGradient id="ag3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#c7d2fe" /></linearGradient>
    </defs>
    <path d="M6 62C4 48 18 40 34 46C26 58 30 76 44 98C22 98 8 82 6 62Z" fill="url(#ag1)" />
    <path d="M26 44C24 28 40 18 58 24C48 38 52 58 66 80C42 82 28 64 26 44Z" fill="url(#ag2)" />
    <path d="M52 20C50 8 62 0 76 4C70 14 74 30 90 46C68 46 54 34 52 20Z" fill="url(#ag3)" />
  </svg>
);

const panel = 'bg-white/50 border border-white/80 backdrop-blur-xl shadow-[10px_10px_24px_rgba(163,184,214,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)]';
const cekung = 'bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]';

const menu = [
  { href: '/admin', label: 'Ringkasan', aktif: true, ikon: <Ikon><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></Ikon> },
  { href: '/admin/siswa', label: 'Data Siswa', ikon: <Ikon><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4c1.8.8 3 2.6 3 5.6" /></Ikon> },
  { href: '/admin/tagihan', label: 'Kelola Tagihan', ikon: <Ikon><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></Ikon> },
  { href: '/admin/dashboard', label: 'Laporan Excel', ikon: <Ikon><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5M12 11v6M9 14l3 3 3-3" /></Ikon> },
];

// Komponen Async untuk Isi Dashboard
async function KontenDashboard() {
  await connection();
  const [totalSiswa, totalTagihan, tagihanLunas] = await Promise.all([
    prisma.siswa.count(),
    prisma.tagihan.count(),
    prisma.tagihan.count({ where: { status: 'PAID' } }),
  ]);

  const belumLunas = totalTagihan - tagihanLunas;
  const persenLunas = totalTagihan > 0 ? Math.round((tagihanLunas / totalTagihan) * 100) : 0;

  const kartu = [
    { judul: 'Total siswa', nilai: totalSiswa, warna: 'text-[#0b1230]', ikon: menu[1].ikon },
    { judul: 'Total tagihan', nilai: totalTagihan, warna: 'text-blue-600', ikon: menu[2].ikon },
    { judul: 'Lunas', nilai: tagihanLunas, warna: 'text-emerald-500', ikon: <Ikon><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.8" /></Ikon> },
    { judul: 'Belum lunas', nilai: belumLunas, warna: 'text-amber-500', ikon: <Ikon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ikon> },
  ];

  return (
    <>
      <section aria-label="Statistik" className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {kartu.map((k) => (
          <div key={k.judul} className={`rounded-3xl p-6 ${panel}`}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-500">{k.judul}</h3>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-blue-600 ${cekung}`}>{k.ikon}</div>
            </div>
            <p className={`text-5xl font-black tracking-tight ${k.warna}`}>{k.nilai}</p>
          </div>
        ))}
      </section>

      <section className={`rounded-[2rem] p-6 sm:p-8 ${panel}`} aria-label="Progres pembayaran">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#0b1230]">Progres pembayaran</h2>
            <p className="mt-1 text-sm text-slate-500">
              {tagihanLunas} dari {totalTagihan} tagihan sudah lunas
            </p>
          </div>
          <p className="text-4xl font-black text-blue-600">{persenLunas}%</p>
        </div>

        <div role="progressbar" aria-valuenow={persenLunas} aria-valuemin={0} aria-valuemax={100} className={`h-5 overflow-hidden rounded-full p-1 ${cekung}`}>
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_12px_rgba(59,91,245,0.5)]" style={{ width: `${persenLunas}%` }} />
        </div>
      </section>
    </>
  );
}

export default function HalamanAdmin() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0f5fc] via-[#e6eefa] to-[#dde7f6] font-sans text-slate-700 lg:flex">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[14px] border-white/80 bg-gradient-to-br from-blue-200/60 to-blue-100/40 shadow-[inset_0_0_30px_rgba(96,140,255,0.25)]" />
      <div aria-hidden className="pointer-events-none absolute -right-16 top-[35%] h-36 w-36 rounded-full border border-white/80 bg-gradient-to-br from-blue-300/50 to-blue-100/50 shadow-[inset_-6px_-6px_16px_rgba(96,140,255,0.25)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full border-[10px] border-white/80 bg-gradient-to-br from-blue-200/60 to-blue-100/40" />

      <aside className={`relative z-[1] m-5 hidden w-72 shrink-0 flex-col justify-between rounded-[2rem] p-7 lg:flex ${panel}`}>
        <div>
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${panel}`}><IkonLogo /></div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#0b1230]">Dasbor Admin</h2>
              <p className="text-xs tracking-wide text-slate-500">Kelas Tambahan</p>
            </div>
          </div>
          <nav className="mt-8 flex flex-col gap-3" aria-label="Menu admin">
            {menu.map((m) => (
              <Link key={m.href} href={m.href} aria-current={m.aktif ? 'page' : undefined} className={m.aktif ? `flex items-center gap-4 rounded-2xl px-5 py-4 font-bold text-blue-600 ${cekung}` : 'flex items-center gap-4 rounded-2xl border border-white/80 bg-white/50 px-5 py-4 font-bold text-slate-600 shadow-[5px_5px_12px_rgba(163,184,214,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)] transition-all hover:text-blue-600'}>
                {m.ikon}{m.label}
              </Link>
            ))}
          </nav>
        </div>
        <TombolLogout />
      </aside>

      <main className="relative z-[1] flex-1 px-5 py-8 sm:px-10 sm:py-12">
        <nav className="-mx-1 mb-8 flex gap-3 overflow-x-auto px-1 pb-2 lg:hidden" aria-label="Menu admin">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-bold ${m.aktif ? `text-blue-600 ${cekung}` : `text-slate-600 ${panel}`}`}>{m.label}</Link>
          ))}
        </nav>

        <header className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1230]">Statistik Sistem</h1>
            <p className="mt-2 text-sm text-slate-500">Pantau metrik pembayaran secara real-time</p>
          </div>
          <Link href="/" className={`shrink-0 rounded-2xl px-6 py-3 text-sm font-bold text-blue-600 transition-transform active:scale-95 ${panel}`}>Halaman depan</Link>
        </header>

        {/* Suspense Boundary Sesuai Aturan Next.js */}
        <Suspense fallback={<div className="p-12 text-center font-bold text-slate-400">Memuat statistik...</div>}>
          <KontenDashboard />
        </Suspense>
      </main>
    </div>
  );
}