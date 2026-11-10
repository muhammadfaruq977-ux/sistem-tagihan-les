import { NextResponse } from 'next/server';

// Buat kata sandi rahasia Anda sendiri (bebas)
const VERIFY_TOKEN = 'RAHASIA_KELAS_INTEGRAL_123';

// 1. Fungsi GET: Syarat wajib dari Meta untuk memverifikasi URL ini aktif
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Cek apakah token yang dikirim Meta cocok dengan token buatan kita
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook berhasil diverifikasi oleh Meta!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// 2. Fungsi POST: Menangkap status terkirim/dibaca dan pesan balasan wali murid
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;
          
          // A. Tangkap Laporan Status Pesan (sent, delivered, read, failed)
          if (value.statuses) {
            const status = value.statuses[0];
            console.log(`[STATUS PESAN] Nomor ${status.recipient_id} -> ${status.status.toUpperCase()}`);
            // Nanti Anda bisa gunakan ID pesan untuk update database Prisma di sini
          }

          // B. Tangkap Pesan Masuk (Jika wali murid membalas)
          if (value.messages) {
            const message = value.messages[0];
            console.log(`[PESAN MASUK] Dari ${message.from}: ${message.text?.body}`);
          }
        }
      }
    }
    
    // Wajib merespons dengan status 200 OK agar Meta tidak terus-menerus mengirim ulang data
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Error Webhook POST:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}