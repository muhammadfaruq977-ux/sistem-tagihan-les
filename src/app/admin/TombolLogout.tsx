"use client";

import { useRouter } from 'next/navigation';

export default function TombolLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="w-full p-4 rounded-xl bg-[#e8f0f7] shadow-[4px_4px_10px_#c7d3e1,-4px_-4px_10px_#ffffff] hover:shadow-[inset_3px_3px_6px_#c7d3e1,inset_-3px_-3px_6px_#ffffff] text-red-500 font-bold transition-all"
    >
      Logout
    </button>
  );
}