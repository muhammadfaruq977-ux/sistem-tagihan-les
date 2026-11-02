// src/app/api/duitku/request/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_tagihan } = body;

    // 1. Ambil data tagihan & siswa dari Supabase via Prisma
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
    
    // 2. Buat MD5 Signature sesuai standar Create Invoice Duitku Pop
    const signatureString = `${merchantCode}${id_tagihan}${paymentAmount}${merchantKey}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    // 3. Susun data transaksi
    const payload = {
      merchantCode: merchantCode,
      paymentAmount: paymentAmount,
      paymentMethod: "SP", // QRIS Dinamis
      merchantOrderId: id_tagihan,
      productDetails: `SPP Bulan ${tagihan.bulan_tahun}`,
      email: "admin@kelastambahan.web.id", 
      phoneNumber: tagihan.siswa.nomor_wa,
      customerVaName: tagihan.siswa.nama,
      callbackUrl: `${process.env.BASE_URL}/api/duitku/webhook`, 
      returnUrl: `${process.env.BASE_URL}/bayar/${id_tagihan}`, 
      signature: signature,
      expiryPeriod: 1440
    };

    const bodyString = JSON.stringify(payload);

    // 4. Kirim request ke Duitku Sandbox dengan Header Origin domain resmi
    const duitkuResponse = await fetch(process.env.DUITKU_API_URL!, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json', 
        'Origin': 'https://kelastambahan.web.id',
        'Referer': 'https://kelastambahan.web.id/',
        'Content-Length': Buffer.byteLength(bodyString).toString(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: bodyString
    });

    // 5. Tangani respons gagal
    if (!duitkuResponse.ok) {
      const errorText = await duitkuResponse.text();
      console.error("Duitku Penolakan Firewall:", errorText);
      return NextResponse.json({ error: `Duitku menolak: ${errorText}` }, { status: 400 });
    }

    // 6. Tangani respons sukses
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