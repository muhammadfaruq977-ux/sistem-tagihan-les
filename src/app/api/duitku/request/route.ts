// src/app/api/duitku/request/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Mendukung request dari Form HTML langsung (x-www-form-urlencoded) maupun JSON
    const contentType = request.headers.get('content-type') || '';
    let id_tagihan = '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      id_tagihan = formData.get('id_tagihan') as string;
    } else {
      const body = await request.json();
      id_tagihan = body.id_tagihan;
    }

    if (!id_tagihan) {
      return NextResponse.json({ error: 'ID Tagihan tidak ditemukan' }, { status: 400 });
    }

    // Cari data di database
    const tagihan = await prisma.tagihan.findUnique({
      where: { id_tagihan },
      include: { siswa: true }
    });

    if (!tagihan || tagihan.status === 'PAID') {
      return NextResponse.json({ error: 'Tagihan tidak valid atau sudah lunas' }, { status: 400 });
    }

    const merchantCode = process.env.DUITKU_MERCHANT_CODE!;
    const merchantKey = process.env.DUITKU_MERCHANT_KEY!;
    const paymentAmount = tagihan.nominal; 
    
    // Otentikasi Header HMAC SHA256
    const timestamp = Date.now().toString();
    const stringToSign = `${merchantCode}${timestamp}`;
    const signature = crypto.createHmac('sha256', merchantKey).update(stringToSign).digest('hex');

    // Susun Payload
    const payload = {
      merchantCode: merchantCode,
      paymentAmount: paymentAmount,
      paymentMethod: "SP", // Spesifik QRIS
      merchantOrderId: id_tagihan,
      productDetails: `SPP Bulan ${tagihan.bulan_tahun}`,
      email: "admin@kelastambahanintegral.web.id", 
      phoneNumber: tagihan.siswa.nomor_wa,
      customerVaName: tagihan.siswa.nama,
      // Ini yang membuat nama siswa muncul di Duitku
      customerDetail: {
        firstName: tagihan.siswa.nama,
        lastName: "",
        email: "admin@kelastambahanintegral.web.id",
        phoneNumber: tagihan.siswa.nomor_wa
      },
      callbackUrl: `${process.env.BASE_URL}/api/duitku/webhook`, 
      returnUrl: `${process.env.BASE_URL}/bayar/${id_tagihan}`, 
      expiryPeriod: 1440
    };

    const bodyString = JSON.stringify(payload);

    // Kirim ke Duitku
    const duitkuResponse = await fetch(process.env.DUITKU_API_URL!, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json', 
        'x-duitku-merchantcode': merchantCode,
        'x-duitku-timestamp': timestamp,
        'x-duitku-signature': signature,
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

    if (duitkuData.statusCode === '00') {
      // Karena kita akan menekan tombol dari tag HTML <form>, 
      // API ini akan langsung me-redirect browser ke halaman QRIS Duitku
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        return NextResponse.redirect(duitkuData.paymentUrl, 303);
      }
      return NextResponse.json({ paymentUrl: duitkuData.paymentUrl }); 
    } else {
      return NextResponse.json({ error: duitkuData.statusMessage }, { status: 400 });
    }

  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}