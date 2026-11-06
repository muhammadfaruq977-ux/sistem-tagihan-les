// src/app/admin/TombolExcel.tsx
"use client";

import { useState } from "react";

export default function TombolExcel() {
  const [isLoading, setIsLoading] = useState(false);
  // Jika Anda punya state bulanPilih, tambahkan di sini
  const [bulanPilih, setBulanPilih] = useState("Semua"); 

  const handleDownloadExcel = async () => {
    setIsLoading(true);
    try {
      // Masukkan logika fetch API download Excel Anda yang asli di sini
      const response = await fetch('/api/export-excel'); // Sesuaikan URL API Anda
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Tagihan.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Gagal mengunduh Excel", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadExcel}
      disabled={isLoading || !bulanPilih}
      className="group relative flex items-center justify-center rounded-full border border-white/40 bg-gradient-to-r from-blue-500 to-indigo-600 py-4 pl-8 pr-16 text-base font-bold text-white shadow-[0_14px_28px_rgba(59,91,245,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform active:scale-[0.98] disabled:opacity-50 md:min-w-[17rem]"
    >
      {isLoading ? "Menyiapkan..." : "Unduh Laporan Excel"}
      {!isLoading && (
        <span className="absolute right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-y-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
          </svg>
        </span>
      )}
    </button>
  );
}