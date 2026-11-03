import { redirect } from 'next/navigation';

export default function HalamanCari({ searchParams }: { searchParams: { id?: string } }) {
  // Mengambil parameter "id" dari URL yang dikirim oleh kotak pencarian
  const idTagihan = searchParams.id;
  
  // Jika pengguna memasukkan ID, langsung arahkan ke halaman pembayaran tagihan tersebut
  if (idTagihan) {
    redirect(`/bayar/${idTagihan}`);
  } else {
    // Jika iseng menekan enter tanpa mengisi ID, kembalikan ke beranda
    redirect('/');
  }
}