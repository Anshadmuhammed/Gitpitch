"use client";
import Link from "next/link";
import { Search, ListChecks, Send, Settings, User, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { name: "My Profile", href: "/developer", icon: User },
  { name: "Matches", href: "/developer/matches", icon: ListChecks },
  { name: "Applications", href: "/developer/applications", icon: Send },
  { name: "Settings", href: "/developer/settings", icon: Settings },
];

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function DeveloperSidebar({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Developer");
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      // 1. Try cache first for instant load
      const cached = sessionStorage.getItem('dev-name');
      if (cached) setUserName(cached);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('name').eq('id', user.id).single();
        if (data?.name) {
          setUserName(data.name);
          sessionStorage.setItem('dev-name', data.name);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <aside className="w-full flex flex-col h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xs font-medium text-white/50 uppercase tracking-widest mb-4">Developer Hub</h2>
        <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/developer" && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={onNavClick}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive 
                      ? "bg-[#c8f060] text-black font-semibold shadow-[0_0_15px_rgba(200,240,96,0.2)]" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5 space-y-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.04]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8f060] to-[#20201e] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(200,240,96,0.1)]">
               <User size={20} className="text-[#c8f060]" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate text-white">{userName}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#c8f060]/10 text-[#c8f060] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Developer</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
             <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest font-bold">
              <span>Status</span>
              <span className="text-[#c8f060]">Live</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#c8f060] w-full shadow-[0_0_8px_rgba(200,240,96,0.2)]" />
            </div>
          </div>
        </div>

        <button 
          onClick={async () => {
             await supabase.auth.signOut();
             window.location.href = '/login';
          }}
          className="w-full py-2.5 px-3 text-xs font-medium text-center border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-2 group"
        >
          Sign out
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </aside>
  );
}
