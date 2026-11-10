// src/app/admin/siswa/tambah/page.tsx
import Link from 'next/link';
import { tambahSiswa } from '../../actions';
import UploadMassal from './UploadMassal'; // <--- Import Komponen Baru

const panel = 'bg-white/50 border border-white/80 backdrop-blur-xl shadow-[10px_10px_24px_rgba(163,184,214,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)]';
const cekung = 'bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]';

export default function HalamanTambahSiswa() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f5fc] via-[#e6eefa] to-[#dde7f6] flex items-center justify-center p-6 text-slate-700 font-sans relative overflow-hidden py-12">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[14px] border-white/80 bg-gradient-to-br from-blue-200/60 to-blue-100/40 shadow-[inset_0_0_30px_rgba(96,140,255,0.25)]" />
      
      <main className={`relative z-10 max-w-md w-full p-8 sm:p-10 rounded-[2.5rem] ${panel}`}>
        {/* BAGIAN 1: TAMBAH MANUAL */}
        <h1 className="text-2xl font-extrabold text-[#0b1230] mb-2">Tambah Siswa Baru</h1>
        <p className="text-sm text-slate-500 mb-8">Masukkan data siswa satu per satu</p>

        <form action={tambahSiswa} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-1">ID Siswa / NIS</label>
            <input type="text" name="id" required placeholder="Contoh: NIS-001" className={`w-full px-5 py-4 rounded-2xl outline-none font-bold text-slate-700 bg-transparent placeholder:text-slate-400 ${cekung}`} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-1">Nama Lengkap</label>
            <input type="text" name="nama" required placeholder="Nama Siswa" className={`w-full px-5 py-4 rounded-2xl outline-none font-bold text-slate-700 bg-transparent placeholder:text-slate-400 ${cekung}`} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-1">No. WhatsApp</label>
            <input type="text" name="nomor_wa" placeholder="Contoh: 628123456789" className={`w-full px-5 py-4 rounded-2xl outline-none font-bold text-slate-700 bg-transparent placeholder:text-slate-400 ${cekung}`} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-1">Besaran SPP (Rp)</label>
            <input type="number" name="besaran_spp" required placeholder="Contoh: 150000" min="0" className={`w-full px-5 py-4 rounded-2xl outline-none font-bold text-slate-700 bg-transparent placeholder:text-slate-400 ${cekung}`} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-1">Les Yang Diikuti</label>
            <select name="les_diikuti" required className={`w-full px-5 py-4 rounded-2xl outline-none font-bold text-slate-700 bg-transparent cursor-pointer ${cekung}`}>
              <option value="" disabled selected>Pilih jenis les...</option>
              <option value="Ekstra">Ekstra</option>
              <option value="Les Al-Qur'an">Les Al-Qur'an</option>
              <option value="Les Akademik">Les Akademik</option>
            </select>
          </div>

          <button type="submit" className="mt-2 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors active:scale-95 cursor-pointer">
            Simpan Manual
          </button>
        </form>

        {/* BAGIAN 2: TAMBAH MASSAL VIA EXCEL */}
        <UploadMassal />

        <Link href="/admin/siswa" className="block text-center mt-8 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
          Batal & Kembali ke Daftar Siswa
        </Link>
      </main>
    </div>
  );
}