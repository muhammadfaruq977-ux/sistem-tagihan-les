// src/app/api/duitku/webhook/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    // 1. Parsing Body yang Jauh Lebih Aman untuk Webhook Payment Gateway
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    } else {
      body = await request.json();
    }

    console.log(">>> PAYLOAD WEBHOOK MASUK:", JSON.stringify(body));

    const merchantCode = body.merchantCode || body.merchantcode;
    const amount = body.amount;
    const merchantOrderId = body.merchantOrderId || body.merchantorderid;
    const resultCode = body.resultCode || body.resultcode;
    const incomingSignature = body.signature;

    // Proteksi data kosong
    if (!merchantCode || !amount || !merchantOrderId || !incomingSignature) {
      console.error("Webhook Duitku Error: Data payload tidak lengkap.");
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    const merchantKey = process.env.DUITKU_MERCHANT_KEY!;

    // Pastikan amount di-cast ke string secara konsisten untuk hashing
    const amountStr = String(amount);

    // 2. Kalkulasi HMAC SHA256 (Standar Baru)
    const stringToSignHmac = `${merchantCode}${amountStr}${merchantOrderId}`;
    const hmacSignature = crypto
      .createHmac('sha256', merchantKey)
      .update(stringToSignHmac)
      .digest('hex');

    // 3. Kalkulasi MD5 (Jaga-jaga Callback versi Sandbox Legacy)
    const stringToSignMd5 = `${merchantCode}${amountStr}${merchantOrderId}${merchantKey}`;
    const md5Signature = crypto
      .createHash('md5')
      .update(stringToSignMd5)
      .digest('hex');

    console.log(">>> HASH CHECK:");
    console.log("Diterima (Incoming) :", incomingSignature);
    console.log("Hasil HMAC SHA256   :", hmacSignature);
    console.log("Hasil MD5           :", md5Signature);

    // Cek pencocokan signature
    const isValidSignature = 
      incomingSignature.toLowerCase() === hmacSignature.toLowerCase() ||
      incomingSignature.toLowerCase() === md5Signature.toLowerCase();

    if (!isValidSignature) {
      console.error("Webhook Duitku Error: Signature Mismatch!");
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 403 });
    }

    // 4. Update status ke Supabase jika pembayaran sukses ("00")
    if (resultCode === '00') {
      // Gunakan updateMany agar Prisma TIDAK CRASH jika id_tagihan tidak sengaja terhapus
      const updateResult = await prisma.tagihan.updateMany({
        where: { id_tagihan: merchantOrderId },
        data: { status: 'PAID' }
      });

      if (updateResult.count > 0) {
        console.log(`[SUCCESS] Tagihan ${merchantOrderId} berhasil di-update menjadi PAID di Supabase.`);

        // --- AWAL INTEGRASI FONNTE ---
        // Karena updateMany tidak mereturn data relasi, kita ambil data siswa secara terpisah
        const tagihanData = await prisma.tagihan.findFirst({
          where: { id_tagihan: merchantOrderId },
          include: { siswa: true }
        });

        // Jika nomor WhatsApp tersedia, kirim pesan notifikasi otomatis
        if (tagihanData && tagihanData.siswa && tagihanData.siswa.nomor_wa) {
          const pesanWhatsApp = `✅ *PEMBAYARAN ONLINE BERHASIL*\n\nTerima kasih Bapak/Ibu wali dari *${tagihanData.siswa.nama}*.\n\nPembayaran tagihan SPP periode *${tagihanData.bulan_tahun}* sebesar *Rp ${tagihanData.nominal.toLocaleString('id-ID')}* melalui sistem Duitku telah kami terima.\n\nStatus tagihan saat ini: *LUNAS*.\n\nTerima kasih atas kerja samanya.`;

          try {
            await fetch('https://api.fonnte.com/send', {
              method: 'POST',
              headers: {
                'Authorization': process.env.FONNTE_TOKEN!,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                target: tagihanData.siswa.nomor_wa,
                message: pesanWhatsApp,
                countryCode: '62',
              }),
            });
            console.log(`[SUCCESS] Notifikasi Lunas (Fonnte) terkirim ke WA ${tagihanData.siswa.nama}`);
          } catch (waError) {
            console.error(`[ERROR] Gagal mengirim WA Fonnte ke ${tagihanData.siswa.nama}:`, waError);
          }
        }
        // --- AKHIR INTEGRASI FONNTE ---

      } else {
        console.log(`[WARNING] Tagihan ${merchantOrderId} sukses di Duitku, tapi ID tidak ditemukan di Database.`);
      }
    }

    return NextResponse.json({ message: 'Callback processed successfully' }, { status: 200 });

  } catch (error) {
    console.error("Internal Webhook Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}