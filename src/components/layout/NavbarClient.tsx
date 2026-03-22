"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export function NavbarClient({ session, role }: { session: any, role?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const dashboardHref = role === 'developer' ? '/developer' : '/dashboard';

  return (
    <nav className="border-b border-[rgba(255,255,255,0.08)] bg-[#0a0a08]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl tracking-tighter flex items-center gap-1 group">
          git<span className="text-[#c8f060] italic group-hover:not-italic transition-all">pitch</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {!session ? (
            <>
              <Link href="/login" className="text-white/60 hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary !py-2 !px-5 !text-xs">
                Start for free
              </Link>
            </>
          ) : (
            <>
              <Link href={dashboardHref} className="text-white/60 hover:text-white transition-colors">
                {role === 'developer' ? 'My Profile' : 'Dashboard'}
              </Link>
              <LogoutButton />
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0a08] border-b border-white/10 p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 z-50">
          {!session ? (
            <div className="flex flex-col gap-4">
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="text-lg text-white/70 hover:text-white py-2"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full text-center"
              >
                Start for free
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link 
                href={dashboardHref}
                onClick={() => setIsOpen(false)}
                className="text-lg text-white/70 hover:text-white py-2"
              >
                {role === 'developer' ? 'My Profile' : 'Dashboard'}
              </Link>
              <div onClick={() => setIsOpen(false)}>
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
