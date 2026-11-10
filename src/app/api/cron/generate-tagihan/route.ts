// src/app/api/cron/generate-tagihan/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connection } from 'next/server';

export async function GET(request: Request) {
  await connection();

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
    let counterPengingat = 0;

    for (const siswa of semuaSiswa) {
      const tagihanEksisting = await prisma.tagihan.findFirst({
        where: { id_siswa: siswa.id, bulan_tahun: periode }
      });

      const formatRupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(siswa.besaran_spp || 0);

      // Pastikan format nomor WA diawali dengan 62 (hapus awalan 0 atau +)
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
            nominal: siswa.besaran_spp,
            bulan_tahun: periode,
            status: 'UNPAID'
          }
        });

        counterTagihan++;

        if (nomorWaValid) {
          const pesanBaru = `Halo Bapak/Ibu wali dari *${siswa.nama}*.\n\nBerikut adalah tagihan SPP Kelas Tambahan Integral (Program: *${siswa.les_diikuti}*) untuk periode *${periode}* sebesar *${formatRupiah}*.\n\nSilakan lakukan pembayaran melalui link berikut:\nhttps://kelastambahanintegral.web.id/bayar/${tagihanBaru.id_tagihan}\n\nTerima kasih.`;
          
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
                type: "text",
                text: { 
                  preview_url: true,
                  body: pesanBaru 
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

      } else if (tagihanEksisting.status === 'UNPAID') {
        // --- SKENARIO 2: Kirim WA Pengingat ---
        counterPengingat++;

        if (nomorWaValid) {
          const pesanPengingat = `*PENGINGAT PEMBAYARAN SPP*\n\nHalo Bapak/Ibu wali dari *${siswa.nama}*.\n\nKami mengingatkan bahwa tagihan SPP Kelas Tambahan Integral (Program: *${siswa.les_diikuti}*) periode *${periode}* sebesar *${formatRupiah}* saat ini masih berstatus *BELUM LUNAS*.\n\nAbaikan pesan ini jika Anda baru saja melakukan pembayaran.\n\nLink Pembayaran:\nhttps://kelastambahanintegral.web.id/bayar/${tagihanEksisting.id_tagihan}\n\nTerima kasih.`;
          
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
                type: "text",
                text: { 
                  preview_url: true,
                  body: pesanPengingat 
                }
              }),
            });

            const hasil = await responMeta.json();
            if (hasil.error) {
               console.error(`[META ERROR] Gagal pengingat ke ${siswa.nama}:`, hasil.error.message);
            }
          } catch (err) {
            console.error(`[JARINGAN] Gagal kirim WA pengingat ke ${siswa.nama}:`, err);
          }
        }
      }
    }

    return NextResponse.json({ 
      message: `Proses sukses untuk bulan ${periode}`, 
      tagihanBaruDibuat: counterTagihan, 
      pesanPengingatDikirim: counterPengingat 
    }, { status: 200 });

  } catch (error) {
    console.error("Gagal mengeksekusi sistem tagihan:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}