// src/app/api/ipaymu/webhook/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateIpaymuHeaders } from '@/lib/ipaymu';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    } else {
      body = await request.json();
    }

    console.log('>>> PAYLOAD WEBHOOK IPAYMU MASUK:', JSON.stringify(body));

    const trxId = body.trx_id;
    const referenceId = body.reference_id;
    const status = (body.status || '').toLowerCase();
    const statusCode = String(body.status_code || '');

    if (!referenceId) {
      console.error('Webhook iPaymu Error: reference_id kosong.');
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    const isSuccessPayload = status === 'berhasil' || statusCode === '1';

    if (!isSuccessPayload) {
      console.log(`[INFO] Webhook iPaymu untuk ${referenceId} berstatus: ${status} (${statusCode})`);
      return NextResponse.json({ message: 'Callback received' }, { status: 200 });
    }

    // Verifikasi keaslian transaksi ke server iPaymu jika trx_id tersedia
    if (trxId) {
      const checkPayload = { transactionId: Number(trxId) };
      const { headers, bodyString } = generateIpaymuHeaders(checkPayload, 'POST');

      const verifyRes = await fetch(`${process.env.IPAYMU_BASE_URL}/transaction`, {
        method: 'POST',
        headers,
        body: bodyString,
      });

      const verifyData = await verifyRes.json();
      const verifiedStatus = String(verifyData?.Data?.Status ?? '');
      const verifiedRef = verifyData?.Data?.ReferenceId;

      if (!verifyData?.Success || verifiedStatus !== '1' || verifiedRef !== referenceId) {
        console.error('Webhook iPaymu Error: Verifikasi transaksi gagal!', verifyData);
        return NextResponse.json({ error: 'Invalid Transaction' }, { status: 403 });
      }
    }

    // Filter status: 'UNPAID' mencegah kirim WA ganda jika webhook dikirim ulang oleh iPaymu
    const updateResult = await prisma.tagihan.updateMany({
      where: {
        id_tagihan: referenceId,
        status: 'UNPAID',
      },
      data: { status: 'PAID' },
    });

    if (updateResult.count > 0) {
      console.log(`[SUCCESS] Tagihan ${referenceId} berhasil di-update menjadi PAID.`);

      // --- INTEGRASI META WHATSAPP API ---
      const tagihanData = await prisma.tagihan.findUnique({
        where: { id_tagihan: referenceId },
        include: { siswa: true },
      });

      if (tagihanData?.siswa?.nomor_wa) {
        const formatRupiah = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(tagihanData.nominal);

        let nomorWaValid = tagihanData.siswa.nomor_wa.trim();
        if (nomorWaValid.startsWith('0')) {
          nomorWaValid = '62' + nomorWaValid.substring(1);
        } else if (nomorWaValid.startsWith('+')) {
          nomorWaValid = nomorWaValid.substring(1);
        }

        try {
          const responMeta = await fetch(
            `https://graph.facebook.com/v19.0/${process.env.WA_PHONE_NUMBER_ID}/messages`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: nomorWaValid,
                type: 'template',
                template: {
                  name: 'pembayaran_berhasil',
                  language: { code: 'id' },
                  components: [
                    {
                      type: 'body',
                      parameters: [
                        { type: 'text', text: tagihanData.siswa.nama },  // {{1}}
                        { type: 'text', text: tagihanData.bulan_tahun }, // {{2}}
                        { type: 'text', text: formatRupiah },            // {{3}}
                        { type: 'text', text: tagihanData.id_tagihan },  // {{4}}
                      ],
                    },
                  ],
                },
              }),
            }
          );

          const hasil = await responMeta.json();
          if (hasil.error) {
            console.error(
              `[META ERROR] Gagal notifikasi lunas ke ${tagihanData.siswa.nama}:`,
              hasil.error.message
            );
          } else {
            console.log(`[SUCCESS] Notifikasi Lunas terkirim ke WA ${tagihanData.siswa.nama}`);
          }
        } catch (waError) {
          console.error(`[ERROR] Gagal mengirim WA Meta ke ${tagihanData.siswa.nama}:`, waError);
        }
      }
    } else {
      console.log(`[INFO] Tagihan ${referenceId} sudah berstatus PAID atau tidak ditemukan.`);
    }

    return NextResponse.json({ message: 'Callback processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Internal Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}