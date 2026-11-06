// src/app/admin/siswa/tambah/UploadMassal.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { tambahSiswaMassal } from '../../actions';

// Komponen Tombol dengan Loading State
function TombolUpload() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} type="submit" className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-700 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer">
      {pending ? 'Memproses Data...' : 'Unggah & Simpan Massal'}
    </button>
  );
}

export default function UploadMassal() {
  const cekung = 'bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]';

  return (
    <div className="mt-10 pt-8 border-t-2 border-white/60">
      <h2 className="text-xl font-extrabold text-[#0b1230] mb-2">Tambah Massal (Excel)</h2>
      
      {/* Tombol Download Template */}
      <a href="/api/download-template" download className="inline-block mb-6 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors underline decoration-blue-300 underline-offset-4">
        + Unduh Template Excel Kosong
      </a>

      {/* Form Upload */}
      <form action={tambahSiswaMassal} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-1">Pilih File Excel (.xlsx)</label>
          <input 
            type="file" 
            name="file" 
            accept=".xlsx, .xls" 
            required 
            className={`w-full px-5 py-4 rounded-2xl outline-none font-bold text-slate-700 bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer ${cekung}`} 
          />
        </div>
        <TombolUpload />
      </form>
    </div>
  );
}