// src/app/admin/siswa/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import TombolLogout from '../TombolLogout';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { TombolHapus } from './TombolClient';
import Image from 'next/image';

/* ---------- Ikon SVG ---------- */
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
  { href: '/admin/siswa', label: 'Data Siswa', aktif: true, ikon: <Ikon><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4c1.8.8 3 2.6 3 5.6" /></Ikon> },
  { href: '/admin/tagihan', label: 'Kelola Tagihan', ikon: <Ikon><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></Ikon> },
  { href: '/api/export-excel', label: 'Laporan Excel', ikon: <Ikon><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5M12 11v6M9 14l3 3 3-3" /></Ikon>, target: "_blank", isDownload: true },
];

/* ---------- Komponen Tabel Siswa ---------- */
async function DaftarSiswa({ search, sort }: { search: string, sort: string }) {
  await connection();

  // Logika Pengurutan
  let orderBy: any = {};
  if (sort === 'nama_asc') orderBy = { nama: 'asc' };
  else if (sort === 'nama_desc') orderBy = { nama: 'desc' };
  else if (sort === 'id_asc') orderBy = { id: 'asc' };
  else if (sort === 'id_desc') orderBy = { id: 'desc' };

  // Tarik Data (dengan filter pencarian nama)
  const dataSiswa = await prisma.siswa.findMany({
    where: {
      nama: { contains: search, mode: 'insensitive' }
    },
    orderBy,
  });

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

  return (
    <section className={`rounded-[2rem] p-6 sm:p-8 ${panel} overflow-x-auto`} aria-label="Tabel Siswa">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b-2 border-white/60">
            <th className="pb-4 pl-2">ID Siswa</th>
            <th className="pb-4">Nama Lengkap</th>
            <th className="pb-4">No. WhatsApp</th>
            <th className="pb-4">Besaran SPP</th>
            <th className="pb-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {dataSiswa.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-slate-400 font-bold">Data siswa tidak ditemukan.</td></tr>
          ) : (
            dataSiswa.map((siswa: any, idx) => {
              const idUnik = siswa.id || siswa.id_siswa;
              return (
                <tr key={idUnik} className={`border-b border-white/40 ${idx === dataSiswa.length - 1 ? 'border-none' : ''}`}>
                  <td className="py-4 pl-2 font-mono text-sm text-slate-500 font-bold">{idUnik}</td>
                  <td className="py-4 font-bold text-[#0b1230]">{siswa.nama}</td>
                  <td className="py-4 font-bold text-slate-600">{siswa.nomor_wa || '-'}</td>
                  <td className="py-4 font-black text-blue-600">{formatRupiah(siswa.besaran_spp)}</td>
                  <td className="py-4 flex justify-center gap-3">
                    <Link href={`/admin/siswa/${idUnik}`} className={`px-4 py-2 text-xs font-bold text-blue-600 rounded-xl ${cekung} hover:text-blue-700 transition-colors`}>Detail & Bayar</Link>
                    <TombolHapus idSiswa={idUnik} />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </section>
  );
}

/* ---------- Pembungkus Area Dinamis (Form + Tabel) ---------- */
// Mengurai Promise Search Params di sini agar tidak memblokir render halaman utama
async function AreaFilterDanTabel({ promiseParams }: { promiseParams: Promise<{ search?: string; sort?: string }> }) {
  const resolvedParams = await promiseParams;
  const search = resolvedParams?.search || '';
  const sort = resolvedParams?.sort || 'id_asc';

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
          name="sort"
          defaultValue={sort}
          className={`px-5 py-3 rounded-xl outline-none font-bold text-slate-700 cursor-pointer appearance-none ${cekung}`}
        >
          <option value="id_asc">Urutkan: ID (A ke Z)</option>
          <option value="id_desc">Urutkan: ID (Z ke A)</option>
          <option value="nama_asc">Urutkan: Nama (A ke Z)</option>
          <option value="nama_desc">Urutkan: Nama (Z ke A)</option>
        </select>
        <button type="submit" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-[0_5px_15px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors">
          Cari
        </button>
        {(search || sort !== 'id_asc') && (
          <Link href="/admin/siswa" className={`px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center border border-white/80 bg-white/50 shadow-[5px_5px_12px_rgba(163,184,214,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)]`}>
            Reset
          </Link>
        )}
      </form>

      <DaftarSiswa search={search} sort={sort} />
    </>
  );
}

/* ---------- Halaman Utama Admin Siswa ---------- */
interface PageProps {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

// Fungsi utama dikembalikan menjadi sinkron
export default function HalamanDataSiswa({ searchParams }: PageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0f5fc] via-[#e6eefa] to-[#dde7f6] font-sans text-slate-700 lg:flex">
      {/* Dekorasi Latar Belakang Neomorphic */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[14px] border-white/80 bg-gradient-to-br from-blue-200/60 to-blue-100/40 shadow-[inset_0_0_30px_rgba(96,140,255,0.25)]" />
      <div aria-hidden className="pointer-events-none absolute -right-16 top-[35%] h-36 w-36 rounded-full border border-white/80 bg-gradient-to-br from-blue-300/50 to-blue-100/50 shadow-[inset_-6px_-6px_16px_rgba(96,140,255,0.25)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full border-[10px] border-white/80 bg-gradient-to-br from-blue-200/60 to-blue-100/40" />

      {/* Sidebar Desktop */}
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
            {menu.map((m) => {
              const baseClass = m.aktif ? `flex items-center gap-4 rounded-2xl px-5 py-4 font-bold text-blue-600 ${cekung}` : 'flex items-center gap-4 rounded-2xl border border-white/80 bg-white/50 px-5 py-4 font-bold text-slate-600 shadow-[5px_5px_12px_rgba(163,184,214,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)] transition-all hover:text-blue-600';
              if (m.isDownload) return <a key={m.href} href={m.href} download className={baseClass}>{m.ikon}{m.label}</a>;
              return <Link key={m.href} href={m.href} className={baseClass}>{m.ikon}{m.label}</Link>;
            })}
          </nav>
        </div>
        <TombolLogout />
      </aside>

      {/* Area Konten Utama */}
      <main className="relative z-[1] flex-1 px-5 py-8 sm:px-10 sm:py-12">
        {/* Menu Mobile */}
        <nav className="-mx-1 mb-8 flex gap-3 overflow-x-auto px-1 pb-2 lg:hidden" aria-label="Menu admin">
          {menu.map((m) => {
            const baseClass = `shrink-0 rounded-2xl px-5 py-3 text-sm font-bold ${m.aktif ? `text-blue-600 ${cekung}` : `text-slate-600 ${panel}`}`;
            if (m.isDownload) return <a key={m.href} href={m.href} download className={baseClass}>{m.label}</a>;
            return <Link key={m.href} href={m.href} className={baseClass}>{m.label}</Link>;
          })}
        </nav>

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1230]">Data Siswa</h1>
            <p className="mt-2 text-sm text-slate-500">Daftar siswa Kelas Tambahan Integral</p>
          </div>
          <Link href="/admin/siswa/tambah" className="px-6 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors active:scale-95">
            + Tambah Siswa
          </Link>
        </header>

        {/* --- Komponen Dinamis Dibungkus Suspense --- */}
        <Suspense fallback={<div className="p-12 text-center font-bold text-slate-400">Memuat data siswa...</div>}>
          <AreaFilterDanTabel promiseParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}