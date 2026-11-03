import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function HalamanPembayaran({ params }: { params: { id: string } }) {
  const idTagihan = params.id;
  const tagihan = await prisma.tagihan.findUnique({
    where: { id_tagihan: idTagihan },
    include: { siswa: true }
  });

  if (!tagihan) {
    return (
      <div className="min-h-screen bg-[#e8f0f7] flex flex-col items-center justify-center p-4 font-sans text-slate-700">
        <div className="p-10 rounded-[2rem] bg-[#e8f0f7] shadow-[15px_15px_30px_#c7d3e1,-15px_-15px_30px_#ffffff] text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#e8f0f7] shadow-[inset_5px_5px_10px_#c7d3e1,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center text-4xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Tidak Ditemukan</h1>
          <p className="text-slate-500 mb-8 font-medium">Pastikan ID Tagihan yang Anda masukkan sudah benar.</p>
          <Link href="/" className="py-4 block rounded-2xl bg-[#e8f0f7] shadow-[5px_5px_10px_#c7d3e1,-5px_-5px_10px_#ffffff] text-slate-600 font-bold hover:shadow-[inset_3px_3px_6px_#c7d3e1,inset_-3px_-3px_6px_#ffffff] transition-all">
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const formatRupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(tagihan.nominal);

  return (
    <div className="min-h-screen bg-[#e8f0f7] flex flex-col items-center justify-center p-4 font-sans text-slate-700">
      <main className="max-w-md w-full p-8 sm:p-12 rounded-[2rem] bg-[#e8f0f7] shadow-[15px_15px_30px_#c7d3e1,-15px_-15px_30px_#ffffff] flex flex-col">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Rincian SPP</h1>
          <p className="text-slate-500 font-medium tracking-wide">Kelas Tambahan Integral</p>
        </div>

        {/* Panel Informasi Neomorphic (Tenggelam / Inset) */}
        <div className="p-6 rounded-2xl bg-[#e8f0f7] shadow-[inset_5px_5px_10px_#c7d3e1,inset_-5px_-5px_10px_#ffffff] mb-8 space-y-5">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">ID Tagihan</p>
            <p className="text-slate-800 font-mono font-bold text-lg">{tagihan.id_tagihan}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Siswa</p>
            <p className="text-slate-800 font-bold text-lg">{tagihan.siswa?.nama || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Keterangan</p>
            <p className="text-slate-800 font-bold text-lg">SPP Bulan {tagihan.bulan_tahun}</p>
          </div>
        </div>

        <div className="text-center mb-10">
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Total Pembayaran</p>
          <p className="text-4xl font-black text-blue-600 drop-shadow-md">{formatRupiah}</p>
        </div>

        {/* Logika Tombol Bayar / Lunas */}
        {tagihan.status === 'PAID' ? (
            <div className="w-full py-4 rounded-2xl bg-[#e8f0f7] shadow-[inset_5px_5px_10px_#c7d3e1,inset_-5px_-5px_10px_#ffffff] text-emerald-500 font-bold text-lg tracking-wide flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              Tagihan Lunas
            </div>
        ) : (
          <form action="/api/duitku/request" method="POST">
            <input type="hidden" name="id_tagihan" value={tagihan.id_tagihan} />
            <button type="submit" className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg tracking-wide shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:opacity-90 transition-opacity">
              Bayar via QRIS
            </button>
          </form>
        )}

        <Link href="/" className="mt-8 text-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
          Kembali ke Beranda
        </Link>
      </main>
    </div>
  );
}