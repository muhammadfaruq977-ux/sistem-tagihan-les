// src/app/api/download-template/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  // Contoh data (baris pertama) sebagai panduan bagi admin
  const dataContoh = [
    {
      'ID Siswa': 'NIS-001',
      'Nama Lengkap': 'Ahmad Budi',
      'Nomor WhatsApp': '6281234567890',
      'Besaran SPP': 150000
    },
    {
      'ID Siswa': 'NIS-002',
      'Nama Lengkap': 'Siti Aisyah',
      'Nomor WhatsApp': '6289876543210',
      'Besaran SPP': 120000
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(dataContoh);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');

  // Merapikan lebar kolom
  worksheet['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }];

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      'Content-Disposition': 'attachment; filename="Template_Tambah_Massal.xlsx"',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}