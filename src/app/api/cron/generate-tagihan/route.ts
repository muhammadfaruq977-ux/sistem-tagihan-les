// src/app/api/cron/generate-tagihan/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connection } from 'next/server';

export async function GET(request: Request) {
  // 1. Wajib ditambahkan agar Next.js 15 tahu ini adalah endpoint dinamis
  await connection();

  // 2. Dapatkan "Bulan dan Tahun" saat ini (Berdasarkan Waktu WITA)
  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar', 
    month: 'long', 
    year: 'numeric'
  });
  
  // Menghasilkan format string seperti: "November 2026"
  const periode = dateFormatter.format(today); 

  try {
    const semuaSiswa = await prisma.siswa.findMany();
    let counterTagihan = 0;
    let counterPengingat = 0;

    for (const siswa of semuaSiswa) {
      // 3. Cek database: Apakah siswa ini sudah punya tagihan untuk bulan ini?
      const tagihanEksisting = await prisma.tagihan.findFirst({
        where: { id_siswa: siswa.id, bulan_tahun: periode }
      });

      const formatRupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(siswa.besaran_spp || 0);

      if (!tagihanEksisting) {
        // --- SKENARIO 1: Buat Tagihan Baru ---
        
        // Buat ID Tagihan unik
        const idTagihanUnik = `INV-${Date.now()}-${Math.floor(Math.random() * 100)}`;

        const tagihanBaru = await prisma.tagihan.create({
          data: {
            id_tagihan: idTagihanUnik,
            id_siswa: siswa.id,
            nominal: siswa.besaran_spp,
            bulan_tahun: periode,
            status: 'UNPAID'
          }
        });

        counterTagihan++;

        if (siswa.nomor_wa) {
          const pesanBaru = `Halo Bapak/Ibu wali dari *${siswa.nama}*.\n\nBerikut adalah tagihan SPP Kelas Tambahan Integral untuk periode *${periode}* sebesar *${formatRupiah}*.\n\nSilakan lakukan pembayaran melalui link berikut:\nhttps://kelastambahanintegral.web.id/bayar/${tagihanBaru.id_tagihan}\n\nTerima kasih.`;
          
          await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { 'Authorization': process.env.FONNTE_TOKEN!, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              target: siswa.nomor_wa, 
              message: pesanBaru, 
              countryCode: '62',
              delay: '3' // Jeda 3 detik dari Fonnte
            }),
          });

          // Jeda tambahan 3 detik di server antar pesan
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

      } else if (tagihanEksisting.status === 'UNPAID') {
        // --- SKENARIO 2: Kirim WA Pengingat (Reminder) ---
        counterPengingat++;

        if (siswa.nomor_wa) {
          const pesanPengingat = `*PENGINGAT PEMBAYARAN SPP*\n\nHalo Bapak/Ibu wali dari *${siswa.nama}*.\n\nKami mengingatkan bahwa tagihan SPP periode *${periode}* sebesar *${formatRupiah}* saat ini masih berstatus *BELUM LUNAS*.\n\nAbaikan pesan ini jika Anda baru saja melakukan pembayaran.\n\nLink Pembayaran:\nhttps://kelastambahanintegral.web.id/bayar/${tagihanEksisting.id_tagihan}\n\nTerima kasih.`;
          
          await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { 'Authorization': process.env.FONNTE_TOKEN!, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              target: siswa.nomor_wa, 
              message: pesanPengingat, 
              countryCode: '62',
              delay: '3' // Jeda 3 detik dari Fonnte
            }),
          });

          // Jeda tambahan 3 detik di server antar pesan
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
      // Skenario 3: Jika sudah PAID, biarkan saja (tidak ada aksi)
    }

    return NextResponse.json({ 
      message: `Proses sukses untuk bulan ${periode}`, 
      tagihanBaruDibuat: counterTagihan, 
      pesanPengingatDikirim: counterPengingat 
    }, { status: 200 });

  } catch (error) {
    console.error("Gagal mengeksekusi sistem tagihan:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}