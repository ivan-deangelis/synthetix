'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export default function Navbar({ user }: { user: User | null }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed z-50 transition-colors duration-300 ease-in-out ${
        isScrolled
          ? 'top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl rounded-full border border-zinc-800 bg-black/50 backdrop-blur-xl shadow-2xl shadow-black/50'
          : 'top-0 left-0 w-full border-transparent bg-transparent'
      }`}
    >
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 max-w-5xl`}>
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
              <Image
                className='relative object-contain'
                width={150}
                height={150}
                src="/logo.png" 
                alt="Synthetix Logo" 
              />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              How it Works
            </a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
