// src/app/api/duitku/webhook/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.json();
    }

    console.log(">>> PAYLOAD WEBHOOK MASUK:", JSON.stringify(body));

    const merchantCode = body.merchantCode || body.merchantcode;
    const amount = body.amount;
    const merchantOrderId = body.merchantOrderId || body.merchantorderid;
    const resultCode = body.resultCode || body.resultcode;
    const incomingSignature = body.signature;

    const merchantKey = process.env.DUITKU_MERCHANT_KEY!;

    // 1. Kalkulasi HMAC SHA256 (Standar Baru)
    const stringToSign = `${merchantCode}${amount}${merchantOrderId}`;
    const hmacSignature = crypto
      .createHmac('sha256', merchantKey)
      .update(stringToSign)
      .digest('hex');

    // 2. Kalkulasi MD5 (Jaga-jaga Callback versi Sandbox Legacy)
    const md5Signature = crypto
      .createHash('md5')
      .update(`${merchantCode}${amount}${merchantOrderId}${merchantKey}`)
      .digest('hex');

    console.log(">>> HASH CHECK:");
    console.log("Diterima (Incoming) :", incomingSignature);
    console.log("Hasil HMAC SHA256   :", hmacSignature);
    console.log("Hasil MD5          :", md5Signature);

    // Cek pencocokan signature
    const isValidSignature = 
      incomingSignature?.toLowerCase() === hmacSignature.toLowerCase() ||
      incomingSignature?.toLowerCase() === md5Signature.toLowerCase();

    if (!isValidSignature) {
      console.error("Webhook Duitku Error: Signature Mismatch!");
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
    }

    // 3. Update status ke Supabase jika pembayaran sukses ("00")
    if (resultCode === '00') {
      await prisma.tagihan.update({
        where: { id_tagihan: merchantOrderId },
        data: { status: 'PAID' }
      });

      console.log(`[SUCCESS] Tagihan ${merchantOrderId} berhasil di-update menjadi PAID di Supabase.`);
    }

    return NextResponse.json({ message: 'Callback processed successfully' }, { status: 200 });

  } catch (error) {
    console.error("Internal Webhook Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}