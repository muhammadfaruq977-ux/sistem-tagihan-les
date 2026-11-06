// src/app/api/export-excel/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

// Fungsi GET Wajib ada di Next.js App Router
export async function GET() {
  try {
    // 1. Ambil data dari database Supabase (urutkan dari yang terbaru)
    const dataTagihan = await prisma.tagihan.findMany({
      include: { siswa: true },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Siapkan dan format data untuk baris-baris Excel
    const dataBaris = dataTagihan.map((t, index) => ({
      'No': index + 1,
      'ID Tagihan': t.id_tagihan,
      'Nama Siswa': t.siswa?.nama || '-',
      'Bulan': t.bulan_tahun,
      'Nominal (Rp)': t.nominal,
      'Status': t.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS',
      'Tanggal Dibuat': t.createdAt.toLocaleDateString('id-ID'),
    }));

    // 3. Buat Workbook dan Worksheet (Lembar Kerja Excel)
    const worksheet = XLSX.utils.json_to_sheet(dataBaris);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Tagihan');

    // Sesuaikan lebar kolom agar rapi saat dibuka
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 25 }, // ID Tagihan
      { wch: 30 }, // Nama Siswa
      { wch: 15 }, // Bulan
      { wch: 15 }, // Nominal
      { wch: 15 }, // Status
      { wch: 20 }, // Tanggal
    ];

    // 4. Konversi menjadi format file biner (Buffer)
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 5. Kembalikan file dengan header pengunduhan otomatis
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="Laporan_Tagihan_Integral.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error("Gagal export Excel:", error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat laporan Excel' },
      { status: 500 }
    );
  }
}