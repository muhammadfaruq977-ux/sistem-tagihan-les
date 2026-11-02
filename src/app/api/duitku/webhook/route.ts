// src/app/api/duitku/webhook/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Duitku mengirim callback dalam bentuk Form Data, bukan JSON
    const formData = await request.formData();
    
    const merchantCode = formData.get('merchantCode') as string;
    const amount = formData.get('amount') as string;
    const merchantOrderId = formData.get('merchantOrderId') as string;
    const signature = formData.get('signature') as string;
    const reference = formData.get('reference') as string;
    const resultCode = formData.get('resultCode') as string;

    // 2. Verifikasi Keamanan (Cegah Hacker memalsukan pembayaran)
    // Rumus Signature Callback Duitku: MD5(merchantCode + amount + merchantOrderId + merchantKey)
    const merchantKey = process.env.DUITKU_MERCHANT_KEY!;
    const signatureString = `${merchantCode}${amount}${merchantOrderId}${merchantKey}`;
    const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');

    if (calculatedSignature !== signature) {
      console.error("Signature tidak valid!");
      return NextResponse.json({ error: 'Bad Signature' }, { status: 403 });
    }

    // 3. Cek apakah pembayaran Sukses (resultCode '00' artinya Sukses)
    if (resultCode === '00') {
      // 4. Update status tagihan di Supabase menjadi PAID
      const tagihanUpdate = await prisma.tagihan.update({
        where: { id_tagihan: merchantOrderId },
        data: { status: 'PAID' },
        include: { siswa: true } // Tarik sekalian data siswanya untuk kirim WA
      });

      // 5. Kirim Resi Sukses via WhatsApp ke Wali Murid
      if (tagihanUpdate.siswa && tagihanUpdate.siswa.nomor_wa) {
        await fetch(`https://graph.facebook.com/v21.0/${process.env.META_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.META_WA_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: tagihanUpdate.siswa.nomor_wa,
            type: "template",
            template: {
              name: "pembayaran_berhasil", // Pastikan template ini sudah dibuat & diapprove Meta
              language: { code: "id" },
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: tagihanUpdate.siswa.nama },
                    { type: "text", text: tagihanUpdate.bulan_tahun },
                    { type: "text", text: reference } // Nomor referensi Duitku sebagai bukti
                  ]
                }
              ]
            }
          })
        });
      }
    }

    // 6. WAJIB mengembalikan status 200 agar Duitku tahu webhook sudah kita terima
    // Jika tidak membalas 200, Duitku akan mengirim ulang webhook berkali-kali
    return NextResponse.json({ message: 'Callback Success' }, { status: 200 });

  } catch (error) {
    console.error("Error Webhook:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}