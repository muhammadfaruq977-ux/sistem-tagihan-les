import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connection } from 'next/server';

export async function GET(request: Request) {
  await connection();

  // 1. PENGAMANAN RUTE (SECURITY CHECK)
  // Hanya aktif di production (Vercel), sehingga bisa dibuka langsung di browser saat localhost
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized: Invalid Cron Secret', { status: 401 });
  }

  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar', 
    month: 'long', 
    year: 'numeric'
  });
  
  const periode = dateFormatter.format(today); 

  try {
    const semuaSiswa = await prisma.siswa.findMany();
    let counterTagihan = 0;

    for (const siswa of semuaSiswa) {
      const tagihanEksisting = await prisma.tagihan.findFirst({
        where: { id_siswa: siswa.id, bulan_tahun: periode }
      });

      const formatRupiah = new Intl.NumberFormat('id-ID', { 
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
      }).format(siswa.besaran_biaya || 0);

      // Sanitasi Nomor WA
      let nomorWaValid = siswa.nomor_wa || '';
      if (nomorWaValid.startsWith('0')) {
        nomorWaValid = '62' + nomorWaValid.substring(1);
      } else if (nomorWaValid.startsWith('+')) {
        nomorWaValid = nomorWaValid.substring(1);
      }

      if (!tagihanEksisting) {
        // --- SKENARIO 1: Buat Tagihan Baru ---
        const idTagihanUnik = `INV-${Date.now()}-${Math.floor(Math.random() * 100)}`;

        const tagihanBaru = await prisma.tagihan.create({
          data: {
            id_tagihan: idTagihanUnik,
            id_siswa: siswa.id,
            nominal: siswa.besaran_biaya,
            bulan_tahun: periode,
            status: 'UNPAID'
          }
        });

        counterTagihan++;

        if (nomorWaValid) {
          try {
            const responMeta = await fetch(`https://graph.facebook.com/v19.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`, 
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: nomorWaValid,
                type: "template", // WAJIB TEMPLATE
                template: {
                  name: "tagihan_les", // GANTI dengan nama template persis di Dasbor Meta Anda
                  language: { code: "id" },
                  components: [
                    {
                      type: "body",
                      parameters: [
                        { type: "text", text: siswa.nama },                  // Variabel {{1}} di Meta
                        { type: "text", text: siswa.les_diikuti },           // Variabel {{2}} di Meta
                        { type: "text", text: periode },                     // Variabel {{3}} di Meta
                        { type: "text", text: formatRupiah },                // Variabel {{4}} di Meta
                        { type: "text", text: tagihanBaru.id_tagihan }       // Variabel {{5}} untuk link
                      ]
                    }
                  ]
                }
              }),
            });

            const hasil = await responMeta.json();
            if (hasil.error) {
               console.error(`[META ERROR] Gagal tagihan baru ke ${siswa.nama}:`, hasil.error.message);
            }
          } catch (err) {
            console.error(`[JARINGAN] Gagal kirim WA ke ${siswa.nama}:`, err);
          }
        }
      }
    }

    return NextResponse.json({ 
      message: `Proses sukses untuk bulan ${periode}`, 
      tagihanBaruDibuat: counterTagihan
    }, { status: 200 });

  } catch (error) {
    console.error("Gagal mengeksekusi sistem tagihan:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}