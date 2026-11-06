// src/app/admin/siswa/TombolClient.tsx
'use client';

import { hapusSiswa, bayarCash } from '../actions';

export function TombolHapus({ idSiswa }: { idSiswa: string }) {
  return (
    <form action={hapusSiswa} onSubmit={(e) => { if(!window.confirm('Yakin hapus siswa ini? Semua riwayat tagihannya juga akan terhapus permanen!')) e.preventDefault(); }}>
      <input type="hidden" name="id" value={idSiswa} />
      <button type="submit" className="px-4 py-2 text-xs font-bold text-red-500 rounded-xl bg-[#e9f0fb]/80 border border-white/80 shadow-[inset_5px_5px_12px_rgba(163,184,214,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.95)] hover:text-red-600 transition-colors cursor-pointer">
        Hapus
      </button>
    </form>
  );
}

export function TombolBayarCash({ idTagihan, idSiswa }: { idTagihan: string, idSiswa: string }) {
  return (
    <form action={bayarCash} onSubmit={(e) => { if(!window.confirm('Tandai tagihan ini menjadi LUNAS secara Cash/Tunai?')) e.preventDefault(); }}>
      <input type="hidden" name="id_tagihan" value={idTagihan} />
      <input type="hidden" name="id_siswa" value={idSiswa} />
      <button type="submit" className="px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-2xl shadow-[0_8px_16px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer">
        Bayar Cash
      </button>
    </form>
  );
}