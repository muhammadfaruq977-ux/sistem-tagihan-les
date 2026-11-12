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

    // Cek pencocokan signature
    const isValidSignature = 
      incomingSignature.toLowerCase() === hmacSignature.toLowerCase() ||
      incomingSignature.toLowerCase() === md5Signature.toLowerCase();

    if (!isValidSignature) {
      console.error("Webhook Duitku Error: Signature Mismatch!");
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 403 });
    }

    // 4. Update status ke database jika pembayaran sukses ("00")
    if (resultCode === '00') {
      const updateResult = await prisma.tagihan.updateMany({
        where: { id_tagihan: merchantOrderId },
        data: { status: 'PAID' }
      });

      if (updateResult.count > 0) {
        console.log(`[SUCCESS] Tagihan ${merchantOrderId} berhasil di-update menjadi PAID.`);

        // --- AWAL INTEGRASI META WHATSAPP API ---
        const tagihanData = await prisma.tagihan.findFirst({
          where: { id_tagihan: merchantOrderId },
          include: { siswa: true }
        });

        if (tagihanData && tagihanData.siswa && tagihanData.siswa.nomor_wa) {
          const formatRupiah = new Intl.NumberFormat('id-ID', { 
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
          }).format(tagihanData.nominal);
          
          // Sanitasi nomor WA (Wajib untuk Meta API)
          let nomorWaValid = tagihanData.siswa.nomor_wa;
          if (nomorWaValid.startsWith('0')) {
            nomorWaValid = '62' + nomorWaValid.substring(1);
          } else if (nomorWaValid.startsWith('+')) {
            nomorWaValid = nomorWaValid.substring(1);
          }

          try {
            const responMeta = await fetch(`https://graph.facebook.com/v19.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: nomorWaValid,
                type: "template",
                template: {
                  name: "pembayaran_berhasil", // 👈 Wajib sama dengan nama template di Meta
                  language: { code: "id" },
                  components: [
                    {
                      type: "body",
                      parameters: [
                        { type: "text", text: tagihanData.siswa.nama },  // {{1}}
                        { type: "text", text: tagihanData.bulan_tahun }, // {{2}}
                        { type: "text", text: formatRupiah },            // {{3}}
                        { type: "text", text: tagihanData.id_tagihan }   // {{4}}
                      ]
                    }
                  ]
                }
              }),
            });

            const hasil = await responMeta.json();
            if (hasil.error) {
              console.error(`[META ERROR] Gagal notifikasi lunas ke ${tagihanData.siswa.nama}:`, hasil.error.message);
            } else {
              console.log(`[SUCCESS] Notifikasi Lunas terkirim ke WA ${tagihanData.siswa.nama}`);
            }
          } catch (waError) {
            console.error(`[ERROR] Gagal mengirim WA Meta ke ${tagihanData.siswa.nama}:`, waError);
          }
        }
        // --- AKHIR INTEGRASI META WHATSAPP API ---

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