// src/app/admin/siswa/[id]/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { connection } from 'next/server';
import { TombolBayarCash } from '../TombolClient';
import { Suspense } from 'react';
export const dynamic = 'force-dynamic'; // <-- Tambahkan baris ini

const panel = 'bg-white/50 border border-white/80 backdrop-blur-xl shadow-[10px_10px_24px_rgba(163,184,214,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)]';
const cekung = 'bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]';

// 1. Komponen terpisah untuk Fetch Database (Agar Next.js tidak error prerender)
async function KontenDetailSiswa({ id }: { id: string }) {
  await connection();
  
  // PERBAIKAN PRISMA: Menggunakan "id:" bukan "id_siswa:"
  const siswa = await prisma.siswa.findUnique({
    where: { id: id },
    include: { tagihan: { orderBy: { createdAt: 'desc' } } }
  });

  if (!siswa) {
    return (
      <main className={`relative z-10 w-full max-w-3xl p-8 sm:p-12 rounded-[2.5rem] ${panel} text-center`}>
        <h2 className="text-xl font-bold text-red-500">Data siswa tidak ditemukan.</h2>
        <Link href="/admin/siswa" className="text-blue-600 mt-6 block font-bold">Kembali ke Daftar Siswa</Link>
      </main>
    );
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  return (
    <main className={`relative z-10 w-full max-w-3xl p-8 sm:p-12 rounded-[2.5rem] ${panel}`}>
      <div className="flex flex-wrap gap-4 items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1230]">{siswa.nama}</h1>
          <p className="text-sm text-slate-500 font-mono font-bold mt-1">ID Siswa: {siswa.id}</p>
          {/* Menyesuaikan dengan nama kolom nomor_wa dari log error Anda */}
          <p className="text-sm text-slate-500 font-bold">No. WA: {siswa.nomor_wa || '-'}</p>
        </div>
        <Link href="/admin/siswa" className={`px-6 py-3 text-sm font-bold text-slate-600 rounded-2xl ${cekung} hover:text-blue-600 transition-colors`}>
          Kembali
        </Link>
      </div>

      <h2 className="text-lg font-bold text-slate-700 mb-6">Kelola Pembayaran & Tagihan</h2>
      
      <div className="grid gap-5">
        {siswa.tagihan.length === 0 ? (
          <div className={`p-8 text-center text-slate-400 font-bold rounded-3xl ${cekung}`}>Belum ada tagihan untuk siswa ini.</div>
        ) : (
          siswa.tagihan.map((t: any) => (
            <div key={t.id_tagihan} className={`p-5 sm:p-6 rounded-3xl ${cekung} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div>
                <p className="font-bold text-slate-800 text-lg">Bulan {t.bulan_tahun}</p>
                <p className="text-sm font-mono text-slate-400 mb-1">{t.id_tagihan}</p>
                <p className="text-blue-600 font-black text-xl">{formatRupiah(t.nominal)}</p>
              </div>
              
              <div>
                {t.status === 'PAID' ? (
                  <div className="px-6 py-3 text-sm font-bold text-emerald-600 bg-emerald-100/50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Lunas
                  </div>
                ) : (
                  // Tombol Bayar Cash
                  <TombolBayarCash idTagihan={t.id_tagihan} idSiswa={siswa.id} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

// 2. Komponen Utama Page (Sama sekali tidak mengandung 'await connection()')
export default async function DetailSiswa({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f5fc] via-[#e6eefa] to-[#dde7f6] flex flex-col items-center py-12 px-4 font-sans text-slate-700 relative overflow-hidden">
      {/* Background Ornamen */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[14px] border-white/80 bg-gradient-to-br from-blue-200/60 to-blue-100/40 shadow-[inset_0_0_30px_rgba(96,140,255,0.25)]" />
      <div aria-hidden className="pointer-events-none absolute -right-16 top-[20%] h-36 w-36 rounded-full border border-white/80 bg-gradient-to-br from-blue-300/50 to-blue-100/50 shadow-[inset_-6px_-6px_16px_rgba(96,140,255,0.25)]" />

      {/* PERBAIKAN NEXT.JS: Gunakan Suspense Boundary */}
      <Suspense fallback={<div className="z-10 p-12 text-center font-bold text-slate-400">Memuat detail siswa...</div>}>
        <KontenDetailSiswa id={id} />
      </Suspense>
    </div>
  );
}