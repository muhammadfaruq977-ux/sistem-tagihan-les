// src/app/api/download-template/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  // Contoh data (baris pertama) dengan menyertakan kolom 'Jenis Les' sesuai kesepakatan
  const dataContoh = [
    {
      'ID Siswa': 'NIS-001-E',
      'Nama Lengkap': 'Ahmad Budi',
      'Nomor WhatsApp': '6281234567890',
      'Besaran SPP': 150000,
      'Jenis Les': 'Ekstra'
    },
    {
      'ID Siswa': 'NIS-002-Q',
      'Nama Lengkap': 'Siti Aisyah',
      'Nomor WhatsApp': '6289876543210',
      'Besaran SPP': 120000,
      'Jenis Les': 'Les Al-Qur\'an'
    },

    {
      'ID Siswa': 'NIS-002-A',
      'Nama Lengkap': 'Supri',
      'Nomor WhatsApp': '6289876543210',
      'Besaran SPP': 120000,
      'Jenis Les': 'Les Akademik'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(dataContoh);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');

  // Merapikan lebar kolom (ditambah 1 kolom untuk Jenis Les)
  worksheet['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 18 }];

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      'Content-Disposition': 'attachment; filename="Template_Tambah_Massal.xlsx"',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}