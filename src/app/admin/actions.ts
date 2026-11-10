// src/app/admin/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as XLSX from 'xlsx';

// 1. Aksi Tambah Siswa Manual
export async function tambahSiswa(formData: FormData) {
  const id = formData.get('id') as string;
  const nama = formData.get('nama') as string;
  const nomor_wa = formData.get('nomor_wa') as string;
  
  const besaranString = formData.get('besaran_spp') as string;
  const besaran_spp = besaranString ? parseInt(besaranString, 10) : 0;
  const les_diikuti = formData.get('les_diikuti') as string;

  if (!id || !nama) return;

  try {
    await prisma.siswa.create({
      data: { id, nama, nomor_wa, besaran_spp, les_diikuti } as any
    });
  } catch (error) {
    console.error("Gagal menambah siswa:", error);
    throw new Error("Gagal menambah data! Pastikan ID Siswa unik.");
  }

  revalidatePath('/admin/siswa');
  redirect('/admin/siswa');
}

// 2. Aksi Hapus Siswa
export async function hapusSiswa(formData: FormData) {
  const id = formData.get('id') as string;
  
  try {
    await prisma.tagihan.deleteMany({ where: { id_siswa: id } });
    await prisma.siswa.delete({ where: { id: id } as any });
  } catch (error) {
    console.error("Gagal menghapus:", error);
  }
  
  revalidatePath('/admin/siswa');
  revalidatePath('/admin');
}

// 3. Aksi Pembayaran Cash
export async function bayarCash(formData: FormData) {
  const id_tagihan = formData.get('id_tagihan') as string;
  const id_siswa = formData.get('id_siswa') as string;

  try {
    // 1. Update status tagihan menjadi PAID sekaligus mengambil data siswa
    const tagihanUpdate = await prisma.tagihan.update({
      where: { id_tagihan },
      data: { status: 'PAID' },
      include: { siswa: true }
    });

    // 2. Kirim notifikasi WA via Fonnte jika nomor WA tersedia
    if (tagihanUpdate.siswa.nomor_wa) {
      const formatRupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihanUpdate.nominal);
      
      const pesanWhatsApp = `✅ *PEMBAYARAN BERHASIL (CASH)*\n\nTerima kasih Bapak/Ibu wali dari *${tagihanUpdate.siswa.nama}*.\n\nPembayaran tagihan SPP periode *${tagihanUpdate.bulan_tahun}* sebesar *${formatRupiah}* telah kami terima.\n\nStatus tagihan saat ini: *LUNAS*.\n\nTerima kasih atas kerja samanya.`;

      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': process.env.FONNTE_TOKEN!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: tagihanUpdate.siswa.nomor_wa,
          message: pesanWhatsApp,
          countryCode: '62',
        }),
      });
    }
  } catch (error) {
    console.error("Gagal bayar cash:", error);
  }

  revalidatePath(`/admin/siswa/${id_siswa}`);
  revalidatePath('/admin/tagihan');
  revalidatePath('/admin');
}

// 4. Aksi Tambah Siswa Massal via Excel
export async function tambahSiswaMassal(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return;

  try {
    // Membaca file biner Excel
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

    // Memformat data agar sesuai skema Prisma
    const dataSiswa = jsonData.map((row) => ({
      id: String(row['ID Siswa'] || '').trim(),
      nama: String(row['Nama Lengkap'] || '').trim(),
      nomor_wa: String(row['Nomor WhatsApp'] || '').trim(),
      besaran_spp: parseInt(String(row['Besaran SPP'] || '0'), 10),
      les_diikuti: String(row['Jenis Les'] || 'Ekstra').trim(),
      status_aktif: true,
    })).filter(s => s.id && s.nama);

    // Menyimpan data massal dengan proteksi duplikat ID
    if (dataSiswa.length > 0) {
      await prisma.siswa.createMany({
        data: dataSiswa,
        skipDuplicates: true, 
      });
    }
  } catch (error) {
    console.error("Gagal import massal:", error);
    throw new Error("Format Excel salah atau gagal diunggah.");
  }

  revalidatePath('/admin/siswa');
  redirect('/admin/siswa');
}

// 5. Aksi Edit / Update Siswa
export async function updateSiswa(formData: FormData) {
  const id = formData.get('id') as string;
  const nama = formData.get('nama') as string;
  const nomor_wa = formData.get('nomor_wa') as string;
  const besaran_spp = Number(formData.get('besaran_spp'));
  const les_diikuti = formData.get('les_diikuti') as string;

  if (!id || !nama) return;

  try {
    await prisma.siswa.update({
      where: { id: id },
      data: {
        nama,
        nomor_wa,
        besaran_spp,
        les_diikuti,
      }
    });
  } catch (error) {
    console.error("Gagal mengupdate siswa:", error);
    throw new Error("Gagal mengupdate data siswa.");
  }

  revalidatePath('/admin/siswa');
  revalidatePath(`/admin/siswa/${id}`);
  redirect('/admin/siswa');
}