export const dynamic = 'force-dynamic';

import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import TombolLogout from './TombolLogout';

const prisma = new PrismaClient();

export default async function HalamanAdmin() {
  const totalSiswa = await prisma.siswa.count();
  const totalTagihan = await prisma.tagihan.count();
  const tagihanLunas = await prisma.tagihan.count({ where: { status: 'PAID' } });

  return (
    <div className="min-h-screen bg-[#e8f0f7] flex font-sans text-slate-700">
      
      {/* Sidebar Neomorphic */}
      <aside className="w-72 p-8 hidden lg:flex flex-col justify-between border-r border-white/50">
        <div>
          <div className="w-16 h-16 mb-6 rounded-2xl bg-[#e8f0f7] shadow-[5px_5px_10px_#c7d3e1,-5px_-5px_10px_#ffffff] flex items-center justify-center">
            <span className="text-2xl font-black text-blue-600">A.</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Dasbor Admin</h2>
          
          <nav className="flex flex-col gap-4">
            <Link href="/admin" className="p-4 rounded-xl bg-[#e8f0f7] shadow-[inset_3px_3px_6px_#c7d3e1,inset_-3px_-3px_6px_#ffffff] text-blue-600 font-bold">Ringkasan</Link>
            <Link href="/admin/siswa" className="p-4 rounded-xl bg-[#e8f0f7] shadow-[4px_4px_8px_#c7d3e1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_5px_#c7d3e1,inset_-2px_-2px_5px_#ffffff] text-slate-600 font-bold transition-all">Data Siswa</Link>
            <Link href="/admin/tagihan" className="p-4 rounded-xl bg-[#e8f0f7] shadow-[4px_4px_8px_#c7d3e1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_5px_#c7d3e1,inset_-2px_-2px_5px_#ffffff] text-slate-600 font-bold transition-all">Kelola Tagihan</Link>
          </nav>
        </div>
        <TombolLogout />
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-8 sm:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Statistik Sistem</h1>
            <p className="text-slate-500 font-medium mt-2">Pantau metrik pembayaran secara real-time</p>
          </div>
          <Link href="/" className="px-6 py-3 rounded-xl bg-[#e8f0f7] shadow-[5px_5px_10px_#c7d3e1,-5px_-5px_10px_#ffffff] text-slate-600 font-bold hover:shadow-[inset_2px_2px_5px_#c7d3e1,inset_-2px_-2px_5px_#ffffff] transition-all">
            Halaman Depan
          </Link>
        </header>

        {/* Kartu Statistik Neomorphic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          <div className="p-8 rounded-3xl bg-[#e8f0f7] shadow-[10px_10px_20px_#c7d3e1,-10px_-10px_20px_#ffffff]">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Total Siswa</h3>
            <p className="text-5xl font-black text-slate-800">{totalSiswa}</p>
          </div>
          <div className="p-8 rounded-3xl bg-[#e8f0f7] shadow-[10px_10px_20px_#c7d3e1,-10px_-10px_20px_#ffffff]">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Total Tagihan</h3>
            <p className="text-5xl font-black text-blue-600">{totalTagihan}</p>
          </div>
          <div className="p-8 rounded-3xl bg-[#e8f0f7] shadow-[10px_10px_20px_#c7d3e1,-10px_-10px_20px_#ffffff]">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Lunas</h3>
            <p className="text-5xl font-black text-emerald-500">{tagihanLunas}</p>
          </div>
        </div>
      </main>
    </div>
  );
}