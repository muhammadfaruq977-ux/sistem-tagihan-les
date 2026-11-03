// src/app/api/duitku/request/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_tagihan } = body;

    const tagihan = await prisma.tagihan.findUnique({
      where: { id_tagihan },
      include: { siswa: true }
    });

    if (!tagihan || tagihan.status === 'PAID') {
      return NextResponse.json({ error: 'Tagihan tidak valid atau sudah dibayar' }, { status: 400 });
    }

    const merchantCode = process.env.DUITKU_MERCHANT_CODE!;
    const merchantKey = process.env.DUITKU_MERCHANT_KEY!;
    const paymentAmount = tagihan.nominal; 
    
    // 1. Buat Timestamp dalam milidetik (Sesuai dokumentasi kode 5.PNG)
    const timestamp = Date.now().toString();

    // 2. Buat Signature HMAC SHA256 (Rumus baru: merchantCode + timestamp)
    const stringToSign = `${merchantCode}${timestamp}`;
    const signature = crypto.createHmac('sha256', merchantKey).update(stringToSign).digest('hex');

    // 3. Susun Payload JSON (Tidak perlu memasukkan signature ke sini lagi)
    const payload = {
      merchantCode: merchantCode, // Disertakan untuk jaga-jaga
      paymentAmount: paymentAmount, // Harus integer sesuai kode 6.PNG
      paymentMethod: "SP", 
      merchantOrderId: id_tagihan,
      productDetails: `SPP Bulan ${tagihan.bulan_tahun}`,
      email: "admin@kelastambahanintegral.web.id", 
      phoneNumber: tagihan.siswa.nomor_wa,
      customerVaName: tagihan.siswa.nama,
      callbackUrl: `${process.env.BASE_URL}/api/duitku/webhook`, 
      returnUrl: `${process.env.BASE_URL}/bayar/${id_tagihan}`, 
      expiryPeriod: 1440
    };

    const bodyString = JSON.stringify(payload);

    // 4. Tembak API Duitku dengan Header Otentikasi Baru
    const duitkuResponse = await fetch(process.env.DUITKU_API_URL!, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json', 
        // Header Wajib Duitku API Terbaru (Sesuai kode 5.PNG)
        'x-duitku-merchantcode': merchantCode,
        'x-duitku-timestamp': timestamp,
        'x-duitku-signature': signature,
        // Header Bypass Vercel WAF
        'Content-Length': Buffer.byteLength(bodyString).toString(),
        'Origin': 'https://kelastambahanintegral.web.id',
        'Referer': 'https://kelastambahanintegral.web.id/'
      },
      body: bodyString
    });

    if (!duitkuResponse.ok) {
      const errorText = await duitkuResponse.text();
      console.error("Duitku Error:", errorText);
      return NextResponse.json({ error: `Duitku menolak: ${errorText}` }, { status: 400 });
    }

    const duitkuData = await duitkuResponse.json();
    console.log("RESPONS DUITKU:", duitkuData);

    if (duitkuData.statusCode === '00') {
      return NextResponse.json({ paymentUrl: duitkuData.paymentUrl }); 
    } else {
      return NextResponse.json({ error: duitkuData.statusMessage }, { status: 400 });
    }

  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}