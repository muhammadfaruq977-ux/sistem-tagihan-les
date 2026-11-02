// src/app/admin/dashboard/page.tsx
"use client";

import { useState } from "react";

export default function DashboardAdmin() {
  const [bulanPilih, setBulanPilih] = useState("2026-10");
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadExcel = () => {
    setIsLoading(true);
    // Mengarahkan window ke endpoint API untuk memicu proses download browser
    window.location.href = `/api/admin/ekspor-excel?bulan=${bulanPilih}`;
    
    // Matikan loading setelah jeda agar tombol bisa ditekan lagi
    setTimeout(() => setIsLoading(false), 2000); 
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Admin Lembaga Les</h1>
        
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Laporan SPP & Penagihan</h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Pilih Bulan Tagihan
              </label>
              <input 
                type="month" 
                value={bulanPilih}
                onChange={(e) => setBulanPilih(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <button
              onClick={handleDownloadExcel}
              disabled={isLoading || !bulanPilih}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? "Menyiapkan..." : "Unduh Laporan Excel"}
            </button>
          </div>
        </div>
        
        {/* Di bagian ini nantinya Anda bisa menambahkan tabel daftar siswa, 
            grafik total pemasukan, dan fitur tambah/edit siswa */}
            
      </div>
    </div>
  );
}