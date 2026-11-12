import { NextResponse } from 'next/server';

// 1. Fungsi GET: Verifikasi URL
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Mengambil token dari .env Vercel (dengan fallback ke string lokal Anda jika .env gagal dimuat)
  const VERIFY_TOKEN = process.env.WA_WEBHOOK_VERIFY_TOKEN || 'RAHASIA_KELAS_INTEGRAL_123';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook berhasil diverifikasi oleh Meta!');
    // WAJIB menggunakan text/plain agar Meta tidak menolak challenge
    return new NextResponse(challenge, { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// 2. Fungsi POST: Menangkap data masuk
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
            // TODO: Update status di Prisma berdasarkan status.id (ID Pesan)
          }

          // B. Tangkap Pesan Masuk (Jika wali murid membalas)
          if (value.messages) {
            const message = value.messages[0];
            const sender = message.from;
            
            // Logika aman untuk menangkap teks biasa atau balasan tombol interaktif
            let pesanMasuk = '';
            if (message.type === 'text') {
              pesanMasuk = message.text.body;
            } else if (message.type === 'interactive' && message.interactive.button_reply) {
              pesanMasuk = `[Tombol Ditekan]: ${message.interactive.button_reply.title}`;
            } else {
              pesanMasuk = `[Tipe pesan ${message.type} tidak didukung teks]`;
            }

            console.log(`[PESAN MASUK] Dari ${sender}: ${pesanMasuk}`);
          }
        }
      }
    }
    
    // Selalu kembalikan 200 OK agar Meta berhenti mengirim spam laporan
    return NextResponse.json({ status: 'ok' }, { status: 200 });
    
  } catch (error) {
    console.error('Error Webhook POST:', error);
    // Lebih aman mengembalikan 200 agar Meta tidak melakukan "retry DDOS" ke server Anda saat ada error parsing
    return NextResponse.json({ status: 'error_caught' }, { status: 200 });
  }
}