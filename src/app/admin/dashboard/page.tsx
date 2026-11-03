// src/app/admin/dashboard/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

/* ---------- Ikon (SVG inline, tanpa dependensi) ---------- */

const Ikon = ({ children, className = "h-6 w-6" }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {children}
  </svg>
);

const IkonLogo = () => (
  <svg viewBox="0 0 100 120" className="h-9 w-9 drop-shadow-[0_4px_6px_rgba(37,99,235,0.35)]" aria-hidden>
    <defs>
      <linearGradient id="dg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1d4ed8" /><stop offset="1" stopColor="#1e3a8a" /></linearGradient>
      <linearGradient id="dg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#60a5fa" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
      <linearGradient id="dg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#c7d2fe" /></linearGradient>
    </defs>
    <path d="M6 62C4 48 18 40 34 46C26 58 30 76 44 98C22 98 8 82 6 62Z" fill="url(#dg1)" />
    <path d="M26 44C24 28 40 18 58 24C48 38 52 58 66 80C42 82 28 64 26 44Z" fill="url(#dg2)" />
    <path d="M52 20C50 8 62 0 76 4C70 14 74 30 90 46C68 46 54 34 52 20Z" fill="url(#dg3)" />
  </svg>
);

const IkonBulan = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />
  </svg>
);

const IkonMatahari = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function labelBulan(nilai: string) {
  const [tahun, bulan] = nilai.split("-");
  const nama = NAMA_BULAN[Number(bulan) - 1];
  return nama && tahun ? `${nama} ${tahun}` : "";
}

/* ---------- Halaman ---------- */

export default function DashboardAdmin() {
  const [bulanPilih, setBulanPilih] = useState("2026-10");
  const [isLoading, setIsLoading] = useState(false);
  const [gelap, setGelap] = useState(false);

  const handleDownloadExcel = () => {
    setIsLoading(true);
    // Mengarahkan window ke endpoint API untuk memicu proses download browser
    window.location.href = `/api/admin/ekspor-excel?bulan=${bulanPilih}`;

    // Matikan loading setelah jeda agar tombol bisa ditekan lagi
    setTimeout(() => setIsLoading(false), 2000);
  };

  // Ringkasan: isi `nilai` dengan data asli dari API Anda. Selama null, tampil "—".
  const ringkasan: { judul: string; nilai: string | null; ikon: React.ReactNode }[] = [
    { judul: "Total tagihan", nilai: null, ikon: <Ikon><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></Ikon> },
    { judul: "Sudah dibayar", nilai: null, ikon: <Ikon><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.8" /></Ikon> },
    { judul: "Belum dibayar", nilai: null, ikon: <Ikon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ikon> },
  ];

  // Fitur yang direncanakan (dari catatan di kode asli)
  const menuSegera = [
    { judul: "Daftar siswa", ikon: <Ikon><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4c1.8.8 3 2.6 3 5.6" /></Ikon> },
    { judul: "Tambah siswa", ikon: <Ikon><circle cx="10" cy="8" r="3.5" /><path d="M3 20c0-3.9 3.1-7 7-7M18 14v6M15 17h6" /></Ikon> },
    { judul: "Grafik pemasukan", ikon: <Ikon><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" /></Ikon> },
  ];

  // Semua warna tema dikumpulkan di sini supaya mudah diubah
  const t = gelap
    ? {
        bg: "bg-gradient-to-b from-[#141b2d] via-[#182238] to-[#111827]",
        judul: "text-white",
        sub: "text-slate-400",
        teks: "text-slate-200",
        ikon: "text-slate-400",
        panel: "bg-white/[0.06] border border-white/10 shadow-[8px_8px_20px_rgba(0,0,0,0.45),-6px_-6px_16px_rgba(255,255,255,0.04)]",
        input: "bg-white/[0.05] border border-white/10 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.45),inset_-3px_-3px_8px_rgba(255,255,255,0.04)]",
        tautan: "text-blue-300 hover:text-blue-200",
        aksen: "text-blue-300",
        garis: "border-white/10",
        bulatBesar: "bg-blue-500/10 border-blue-400/20",
        bulatKecil: "bg-blue-500/20 border-blue-400/20",
        scheme: "[color-scheme:dark]",
      }
    : {
        bg: "bg-gradient-to-b from-[#f0f5fc] via-[#e6eefa] to-[#dde7f6]",
        judul: "text-[#0b1230]",
        sub: "text-slate-500",
        teks: "text-slate-700",
        ikon: "text-slate-500",
        panel: "bg-white/50 border border-white/80 shadow-[10px_10px_24px_rgba(163,184,214,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)]",
        input: "bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]",
        tautan: "text-blue-600 hover:text-blue-700",
        aksen: "text-blue-600",
        garis: "border-slate-300/60",
        bulatBesar: "bg-gradient-to-br from-blue-200/60 to-blue-100/40 border-white/80",
        bulatKecil: "bg-gradient-to-br from-blue-300/50 to-blue-100/50 border-white/80",
        scheme: "[color-scheme:light]",
      };

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans transition-colors duration-500 ${t.bg} ${t.teks}`}>
      {/* Dekorasi bentuk melengkung di sudut */}
      <div aria-hidden className={`pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[14px] ${t.bulatBesar} shadow-[inset_0_0_30px_rgba(96,140,255,0.25)]`} />
      <div aria-hidden className={`pointer-events-none absolute -right-16 top-[30%] h-36 w-36 rounded-full border ${t.bulatKecil} shadow-[inset_-6px_-6px_16px_rgba(96,140,255,0.25)]`} />
      <div aria-hidden className={`pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full border-[10px] ${t.bulatBesar}`} />
      <div aria-hidden className={`pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full border-[10px] ${t.bulatBesar}`} />

      <div className="relative z-[1] mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl backdrop-blur-xl ${t.panel}`}>
              <IkonLogo />
            </div>
            <div>
              <h1 className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${t.judul}`}>Dashboard Admin</h1>
              <p className={`text-sm tracking-wide ${t.sub}`}>Lembaga Les</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`hidden h-12 items-center rounded-2xl px-5 text-sm font-bold backdrop-blur-md transition-transform active:scale-95 sm:flex ${t.panel} ${t.tautan}`}
            >
              Lihat beranda
            </Link>
            <button
              type="button"
              onClick={() => setGelap((v) => !v)}
              aria-label={gelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl backdrop-blur-md transition-transform active:scale-95 ${t.panel} ${gelap ? "text-amber-300" : "text-[#0b1230]"}`}
            >
              {gelap ? <IkonMatahari /> : <IkonBulan />}
            </button>
          </div>
        </header>

        {/* Ringkasan */}
        <section aria-label="Ringkasan" className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {ringkasan.map((k) => (
            <div key={k.judul} className={`flex items-center gap-4 rounded-3xl p-5 backdrop-blur-xl ${t.panel}`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${t.input} ${t.aksen}`}>{k.ikon}</div>
              <div>
                <p className={`text-xs font-semibold ${t.sub}`}>{k.judul}</p>
                <p className={`text-2xl font-extrabold ${t.judul}`}>{k.nilai ?? "—"}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Laporan SPP & Penagihan */}
        <section className={`mb-8 rounded-[2rem] p-6 backdrop-blur-xl sm:p-8 ${t.panel}`}>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight ${t.judul}`}>Laporan SPP & Penagihan</h2>
              <p className={`mt-1 text-sm ${t.sub}`}>Unduh rekap tagihan per bulan dalam format Excel.</p>
            </div>
            <div className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:flex ${t.input} ${t.aksen}`}>
              <Ikon><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5M9 13l4 4M13 13l-4 4" /></Ikon>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-5 md:flex-row md:items-end">
            <div className="flex-1">
              <label htmlFor="bulan" className={`mb-2 block text-sm font-semibold ${t.teks}`}>
                Pilih bulan tagihan
              </label>
              <div className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-shadow focus-within:ring-2 focus-within:ring-blue-500/50 ${t.input}`}>
                <Ikon className={`h-6 w-6 shrink-0 ${t.ikon}`}>
                  <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
                  <path d="M8 3v4M16 3v4M3.5 10h17" />
                </Ikon>
                <input
                  id="bulan"
                  type="month"
                  value={bulanPilih}
                  onChange={(e) => setBulanPilih(e.target.value)}
                  className={`w-full bg-transparent font-medium outline-none ${t.teks} ${t.scheme}`}
                />
              </div>
              {bulanPilih && <p className={`mt-2 px-1 text-xs ${t.sub}`}>Periode: {labelBulan(bulanPilih)}</p>}
            </div>

            <button
              onClick={handleDownloadExcel}
              disabled={isLoading || !bulanPilih}
              className="group relative flex items-center justify-center rounded-full border border-white/40 bg-gradient-to-r from-blue-500 to-indigo-600 py-4 pl-8 pr-16 text-base font-bold text-white shadow-[0_14px_28px_rgba(59,91,245,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform active:scale-[0.98] disabled:opacity-50 md:min-w-[17rem]"
            >
              {isLoading ? "Menyiapkan..." : "Unduh Laporan Excel"}
              {!isLoading && (
                <span className="absolute right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-y-0.5">
                  <Ikon className="h-5 w-5"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></Ikon>
                </span>
              )}
            </button>
          </div>
        </section>

        {/* Fitur berikutnya */}
        <section aria-label="Fitur berikutnya">
          <div className="mb-4 flex items-center gap-4">
            <span className={`text-xs tracking-[0.25em] ${t.sub}`}>SEGERA HADIR</span>
            <span className={`h-px flex-1 border-t ${t.garis}`} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {menuSegera.map((m) => (
              <div
                key={m.judul}
                aria-disabled="true"
                className={`flex items-center gap-4 rounded-2xl p-4 opacity-70 backdrop-blur-md ${t.panel}`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${t.input} ${t.aksen}`}>{m.ikon}</div>
                <span className={`text-sm font-bold ${t.teks}`}>{m.judul}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
