// src/app/api/cron/generate-tagihan/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Verifikasi keamanan Vercel Cron (DINONAKTIFKAN SEMENTARA untuk uji coba browser)
    /*
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */

    // 2. Format periode bulan & tahun (Contoh: "11-2026")
    const date = new Date();
    const bulan = String(date.getMonth() + 1).padStart(2, '0');
    const tahun = date.getFullYear();
    const bulanTahunPeriode = `${bulan}-${tahun}`;

    // 3. Ambil hanya siswa yang berstatus aktif
    const siswaAktif = await prisma.siswa.findMany({
      where: { status_aktif: true }
    });

    const laporanHasil = [];

    for (const siswa of siswaAktif) {
      // 4. Cek agar tidak terjadi duplikasi tagihan di bulan yang sama
      const idTagihan = `INV-${tahun}${bulan}-${siswa.id}`;
      
      const tagihanSudahAda = await prisma.tagihan.findUnique({
        where: { id_tagihan: idTagihan }
      });

      if (!tagihanSudahAda) {
        const nominalSPP = siswa.besaran_spp || 0;

        // 5. Buat tagihan baru di database dengan status UNPAID
        await prisma.tagihan.create({
          data: {
            id_tagihan: idTagihan,
            id_siswa: siswa.id,
            nominal: nominalSPP,
            bulan_tahun: bulanTahunPeriode,
            status: 'UNPAID',
          }
        });

        // 6. Kirim pesan otomatis via Fonnte API
        if (siswa.nomor_wa) {
          const urlPembayaran = `${process.env.BASE_URL}/bayar/${idTagihan}`;
          const pesanWhatsApp = `Halo Bapak/Ibu wali dari *${siswa.nama}*,\n\nBerikut adalah tagihan SPP untuk periode *${bulanTahunPeriode}* sebesar *Rp ${nominalSPP.toLocaleString('id-ID')}*.\n\nSilakan lakukan pembayaran melalui link berikut:\n${urlPembayaran}\n\nTerima kasih.`;

          try {
            const fonnteResponse = await fetch('https://api.fonnte.com/send', {
              method: 'POST',
              headers: {
                'Authorization': process.env.FONNTE_TOKEN!,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                target: siswa.nomor_wa,
                message: pesanWhatsApp,
                countryCode: '62',
              }),
            });

            const fonnteResult = await fonnteResponse.json();
            laporanHasil.push({ nama: siswa.nama, status_wa: fonnteResult.status ? 'Berhasil Terkirim' : 'Gagal' });
          } catch (waError) {
            console.error(`Gagal kirim WA ke ${siswa.nama}:`, waError);
            laporanHasil.push({ nama: siswa.nama, status_wa: 'Error Koneksi Fonnte' });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil men-generate tagihan dan mengirim blast WhatsApp via Fonnte.`,
      laporan: laporanHasil
    }, { status: 200 });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}