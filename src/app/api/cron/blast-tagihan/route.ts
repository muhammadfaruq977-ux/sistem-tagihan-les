// src/app/api/cron/blast-tagihan/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // 1. Verifikasi keamanan (hanya Vercel atau admin dengan token yang bisa menjalankan)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Tentukan format bulan saat ini (Contoh: "2026-10")
    const date = new Date();
    const bulanTahun = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const sppNominal = 100000; // Bisa dibuat dinamis jika tiap siswa beda SPP

    // 3. Ambil semua siswa aktif
    const siswaAktif = await prisma.siswa.findMany({
      where: { status_aktif: true }
    });

    const logPengiriman = [];

    for (const siswa of siswaAktif) {
      // 4. Cek agar tidak ada tagihan ganda di bulan yang sama
      const tagihanAda = await prisma.tagihan.findFirst({
        where: { id_siswa: siswa.id, bulan_tahun: bulanTahun }
      });

      if (!tagihanAda) {
        // 5. Buat ID unik dan simpan ke database
        // Format: INV-202610-8A7B6C
        const idTagihan = `INV-${bulanTahun.replace('-', '')}-${siswa.id.substring(0, 6).toUpperCase()}`;
        
        await prisma.tagihan.create({
          data: {
            id_tagihan: idTagihan,
            id_siswa: siswa.id,
            nominal: sppNominal,
            bulan_tahun: bulanTahun,
          }
        });

        // 6. Siapkan URL unik dan kirim ke WhatsApp via Meta Cloud API
        const urlPembayaran = `${process.env.BASE_URL}/bayar/${idTagihan}`;
        
        const waResponse = await fetch(`https://graph.facebook.com/v21.0/${process.env.META_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.META_WA_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: siswa.nomor_wa, // Pastikan format tabel di DB: 628xxxxxxx (tanpa + atau 0)
            type: "template",
            template: {
              name: "tagihan_spp_bulanan", // Harus sama persis dengan nama template di Meta
              language: { code: "id" },
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: siswa.nama }, // {{1}} - Nama
                    { type: "text", text: `Rp ${sppNominal.toLocaleString('id-ID')}` }, // {{2}} - Nominal
                    { type: "text", text: urlPembayaran } // {{3}} - Link URL
                  ]
                }
              ]
            }
          })
        });

        logPengiriman.push({ nama: siswa.nama, status_api: waResponse.status });
      }
    }

    return NextResponse.json({ message: 'Blast tagihan selesai', laporan: logPengiriman });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengeksekusi cron job' }, { status: 500 });
  }
}