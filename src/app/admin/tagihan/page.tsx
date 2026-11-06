// src/app/admin/tagihan/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import TombolLogout from '../TombolLogout';
import { Suspense } from 'react';
import { connection } from 'next/server';
import Image from 'next/image';

/* ---------- Ikon ---------- */
const Ikon = ({ children, className = 'h-6 w-6' }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>{children}</svg>
);

const IkonLogo = () => (
  <Image
    src="/logo-sekolah.png"
    alt="Logo Sekolah"
    width={96}
    height={96}
    className="w-auto h-auto object-contain drop-shadow-[0_10px_14px_rgba(37,99,235,0.35)]"
    priority
  />
);

const panel = 'bg-white/50 border border-white/80 backdrop-blur-xl shadow-[10px_10px_24px_rgba(163,184,214,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)]';
const cekung = 'bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]';

const menu = [
  { href: '/admin', label: 'Ringkasan', ikon: <Ikon><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></Ikon> },
  { href: '/admin/siswa', label: 'Data Siswa', ikon: <Ikon><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4c1.8.8 3 2.6 3 5.6" /></Ikon> },
  { href: '/admin/tagihan', label: 'Kelola Tagihan', aktif: true, ikon: <Ikon><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></Ikon> },
  { href: '/api/export-excel', label: 'Laporan Excel', ikon: <Ikon><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5M12 11v6M9 14l3 3 3-3" /></Ikon>, target: "_blank" },
];

/* ---------- Komponen Tabel Tagihan ---------- */
async function DaftarTagihan({ search, status }: { search: string; status: string }) {
  await connection();

  let whereClause: any = {
    siswa: { nama: { contains: search, mode: 'insensitive' } }
  };

  if (status !== 'ALL') {
    whereClause.status = status;
  }

  const dataTagihan = await prisma.tagihan.findMany({
    where: whereClause,
    include: { siswa: true },
    orderBy: { createdAt: 'desc' }
  });

  const formatRupiah = (angka: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  return (
    <section className={`rounded-[2rem] p-6 sm:p-8 ${panel} overflow-x-auto`} aria-label="Tabel Tagihan">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b-2 border-white/60">
            <th className="pb-4 pl-2">ID Tagihan</th>
            <th className="pb-4">Siswa</th>
            <th className="pb-4">Bulan</th>
            <th className="pb-4">Nominal</th>
            <th className="pb-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {dataTagihan.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-slate-400 font-bold">Data tagihan tidak ditemukan.</td></tr>
          ) : (
            dataTagihan.map((tagihan, idx) => (
              <tr key={tagihan.id_tagihan} className={`border-b border-white/40 ${idx === dataTagihan.length - 1 ? 'border-none' : ''}`}>
                <td className="py-4 pl-2 font-mono text-sm font-bold text-slate-500">{tagihan.id_tagihan}</td>
                <td className="py-4 font-bold text-[#0b1230]">{tagihan.siswa?.nama || '-'}</td>
                <td className="py-4 font-bold text-slate-600">{tagihan.bulan_tahun}</td>
                <td className="py-4 font-bold text-slate-700">{formatRupiah(tagihan.nominal)}</td>
                <td className="py-4 text-center">
                  <span className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm ${tagihan.status === 'PAID' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                    {tagihan.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

/* ---------- Pembungkus Area Dinamis (Form + Tabel) ---------- */
// Disinilah 'await searchParams' dilakukan, agar tidak memblokir bingkai halaman utama
async function AreaFilterDanTabel({ promiseParams }: { promiseParams: Promise<{ search?: string; status?: string }> }) {
  const resolvedParams = await promiseParams;
  const search = resolvedParams?.search || '';
  const status = resolvedParams?.status || 'ALL';

  return (
    <>
      {/* FORM PENCARIAN & FILTER NEOMORPHIC */}
      <form method="GET" className={`mb-8 flex flex-col sm:flex-row gap-4 p-4 rounded-[2rem] ${panel}`}>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Cari nama siswa..."
          className={`flex-1 px-5 py-3 rounded-xl outline-none font-bold text-slate-700 placeholder:text-slate-400 ${cekung}`}
        />
        <select
          name="status"
          defaultValue={status}
          className={`px-5 py-3 rounded-xl outline-none font-bold text-slate-700 cursor-pointer appearance-none ${cekung}`}
        >
          <option value="ALL">Semua Status</option>
          <option value="PAID">Lunas (PAID)</option>
          <option value="UNPAID">Belum Lunas (UNPAID)</option>
        </select>
        <button type="submit" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors">
          Filter
        </button>
        {(search || status !== 'ALL') && (
          <Link href="/admin/tagihan" className={`px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center border border-white/80 bg-white/50 shadow-[5px_5px_12px_rgba(163,184,214,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)]`}>
            Reset
          </Link>
        )}
      </form>

      <DaftarTagihan search={search} status={status} />
    </>
  );
}


/* ---------- Halaman Utama Admin Tagihan ---------- */
interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

// Fungsi utama sekarang bersih dari operasi await (Sinkron)
export default function HalamanKelolaTagihan({ searchParams }: PageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0f5fc] via-[#e6eefa] to-[#dde7f6] font-sans text-slate-700 lg:flex">
      {/* Background Ornamen */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[14px] border-white/80 bg-gradient-to-br from-blue-200/60 to-blue-100/40 shadow-[inset_0_0_30px_rgba(96,140,255,0.25)]" />
      <div aria-hidden className="pointer-events-none absolute -right-16 top-[35%] h-36 w-36 rounded-full border border-white/80 bg-gradient-to-br from-blue-300/50 to-blue-100/50 shadow-[inset_-6px_-6px_16px_rgba(96,140,255,0.25)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full border-[10px] border-white/80 bg-gradient-to-br from-blue-200/60 to-blue-100/40" />

      {/* Sidebar */}
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
              <Link key={m.href} href={m.href} {...(m.target ? { target: m.target } : {})} aria-current={m.aktif ? 'page' : undefined} className={m.aktif ? `flex items-center gap-4 rounded-2xl px-5 py-4 font-bold text-blue-600 ${cekung}` : 'flex items-center gap-4 rounded-2xl border border-white/80 bg-white/50 px-5 py-4 font-bold text-slate-600 shadow-[5px_5px_12px_rgba(163,184,214,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)] transition-all hover:text-blue-600'}>
                {m.ikon}{m.label}
              </Link>
            ))}
          </nav>
        </div>
        <TombolLogout />
      </aside>

      {/* Main Content */}
      <main className="relative z-[1] flex-1 px-5 py-8 sm:px-10 sm:py-12">
        <nav className="-mx-1 mb-8 flex gap-3 overflow-x-auto px-1 pb-2 lg:hidden" aria-label="Menu admin">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} {...(m.target ? { target: m.target } : {})} className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-bold ${m.aktif ? `text-blue-600 ${cekung}` : `text-slate-600 ${panel}`}`}>{m.label}</Link>
          ))}
        </nav>

        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1230]">Kelola Tagihan</h1>
            <p className="mt-2 text-sm text-slate-500">Riwayat tagihan SPP dan status pembayaran</p>
          </div>
        </header>

        {/* --- Komponen Dinamis Dibungkus Suspense --- */}
        <Suspense fallback={<div className="p-12 text-center font-bold text-slate-400">Memuat data tagihan...</div>}>
          <AreaFilterDanTabel promiseParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}