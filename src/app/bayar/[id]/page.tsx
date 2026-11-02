// src/app/bayar/[id]/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useParams } from "next/navigation"; 

function TagihanComponent() {
  const params = useParams();
  const tagihanId = params?.id as string;

  const [loading, setLoading] = useState(false);

  const prosesPembayaran = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/duitku/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tagihan: tagihanId }),
      });
      
      const data = await res.json();
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Gagal memuat pembayaran: " + data.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  if (!tagihanId) return <div className="text-gray-500">Memuat detail tagihan...</div>;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Tagihan SPP</h1>
      <p className="text-gray-500 mb-6">ID: {tagihanId}</p>
      
      <div className="border border-gray-200 rounded-lg p-4 mb-6 text-left">
        <p className="text-sm text-gray-500">Nominal Pembayaran</p>
        <p className="text-3xl font-bold text-blue-600">Rp 100.000</p>
      </div>

      <button
        onClick={prosesPembayaran}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Bayar dengan QRIS Sekarang"}
      </button>
    </>
  );
}

// Komponen Utama yang membungkus dengan Suspense sesuai permintaan Next.js
export default function HalamanPembayaran() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <Suspense fallback={<div className="text-gray-500">Memuat struktur halaman...</div>}>
          <TagihanComponent />
        </Suspense>
      </div>
    </div>
  );
}