import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#0a0613] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                className='relative object-contain'
                width={150}
                height={150}
                src="/logo.png" 
                alt="Synthetix Logo" 
              />
            </Link>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-xs">
              The next generation of API development. Build, mock, and deploy faster than ever before with AI-powered tools.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-6 lg:justify-items-end">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="#features" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Platform</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/login" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Synthetix Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
