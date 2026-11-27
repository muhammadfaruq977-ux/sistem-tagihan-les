// src/app/api/ipaymu/request/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateIpaymuHeaders } from '@/lib/ipaymu';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const isJsonRequest = contentType.includes('application/json');
    let idTagihan = '';

    if (isJsonRequest) {
      const body = await request.json();
      idTagihan = String(body.id_tagihan || body.tagihanId || '');
    } else {
      const formData = await request.formData();
      idTagihan = String(formData.get('id_tagihan') || '');
    }

    if (!idTagihan) {
      return NextResponse.json({ error: 'id_tagihan wajib dikirim' }, { status: 400 });
    }

    const tagihan = await prisma.tagihan.findUnique({
      where: { id_tagihan: idTagihan },
      include: { siswa: true },
    });

    if (!tagihan) {
      return NextResponse.json({ error: 'Data tagihan tidak ditemukan' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (tagihan.status === 'PAID') {
      if (!isJsonRequest) {
        return NextResponse.redirect(`${appUrl}/bayar/${tagihan.id_tagihan}`, 303);
      }
      return NextResponse.json({ error: 'Tagihan ini sudah lunas' }, { status: 400 });
    }

    // Samakan perhitungan nominal dengan halaman /bayar/[id]
    const nominalBiaya = tagihan.nominal;
    const biayaAdmin = Math.ceil(nominalBiaya * 0.007);
    const totalBayar = nominalBiaya + biayaAdmin;

    // Sanitasi nomor HP pembeli (format 08xxx untuk iPaymu)
    let buyerPhone = tagihan.siswa.nomor_wa.trim();
    if (buyerPhone.startsWith('62')) {
      buyerPhone = '0' + buyerPhone.substring(2);
    } else if (buyerPhone.startsWith('+62')) {
      buyerPhone = '0' + buyerPhone.substring(3);
    }

    const payload = {
      product: [`Iuran Kelas Tambahan (${tagihan.bulan_tahun}) - ${tagihan.siswa.nama}`],
      qty: ['1'],
      price: [String(totalBayar)],
      description: [`${tagihan.id_tagihan} - ${tagihan.siswa.les_diikuti}`],
      returnUrl: `${appUrl}/bayar/${tagihan.id_tagihan}?status=sukses`,
      cancelUrl: `${appUrl}/bayar/${tagihan.id_tagihan}?status=batal`,
      notifyUrl: `${appUrl}/api/ipaymu/webhook`,
      referenceId: tagihan.id_tagihan,
      buyerName: tagihan.siswa.nama,
      buyerEmail: 'wali@kelastambahanintegral.web.id',
      buyerPhone,
      paymentMethod: 'qris',
    };

    const { headers, bodyString } = generateIpaymuHeaders(payload, 'POST');

    const response = await fetch(`${process.env.IPAYMU_BASE_URL}/payment`, {
      method: 'POST',
      headers,
      body: bodyString,
    });

    const result = await response.json();

    if (!response.ok || !result.Success || !result.Data?.Url) {
      console.error('iPaymu Request Error:', result);
      return NextResponse.json(
        { error: result.Message || 'Gagal membuat link pembayaran iPaymu' },
        { status: 400 }
      );
    }

    // Redirect langsung ke halaman QRIS iPaymu jika dipanggil dari <form> HTML
    if (!isJsonRequest) {
      return NextResponse.redirect(result.Data.Url, 303);
    }

    return NextResponse.json({
      paymentUrl: result.Data.Url,
      sessionId: result.Data.SessionID,
    });
  } catch (error) {
    console.error('Internal iPaymu Request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}