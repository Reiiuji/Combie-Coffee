'use client'; // <--- WAJIB ADA untuk fitur interaktif/event handler

import Link from "next/link";
import { useState } from "react"; // Kita bisa pakai state jika perlu

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative flex flex-col">
      
      {/* 1. GAMBAR BACKGROUND (Atas) */}
      <div className="absolute inset-0 z-0 h-[65%] w-full bg-gray-900">
         {/* Gambar Kopi */}
         <img 
           src="/images/landing-coffee.jpg" 
           alt="Combi Cafe Coffee"
           className="w-full h-full object-cover opacity-90"
           onError={(e) => {
             // Event handler ini yang menyebabkan error jika tidak ada 'use client'
             e.target.style.display = 'none'; 
           }}
         />
         {/* Gradient Overlay (Supaya teks terbaca & transisi halus ke bawah) */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80"></div>
      </div>

      {/* 2. KONTEN TEKS (Bawah - Bottom Sheet Style) */}
      <div className="z-10 mt-auto w-full bg-[#FFFBF2] rounded-t-[35px] px-8 pt-12 pb-10 flex flex-col items-center text-center shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-10 duration-700">
        
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight mb-4 font-sans tracking-tight">
          Fall in Love with <br />
          Coffee in Blissful <br />
          Delight!
        </h1>

        {/* Subheadline */}
        <p className="text-gray-500 text-sm md:text-base mb-8 leading-relaxed max-w-xs mx-auto">
          Welcome to our cozy coffee corner, where every cup is a delightful for you.
        </p>

        {/* Tombol Get Started */}
        <Link 
          href="/customer/menu" 
          className="w-full max-w-sm"
        >
          <button className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-orange-500/30">
            Get Started
          </button>
        </Link>

      </div>
    </div>
  );
}