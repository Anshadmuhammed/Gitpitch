"use client";
import Link from "next/link";
import { User, Briefcase, Settings, Github, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { name: "My Profile", href: "/developer", icon: User },
  { name: "Matches", href: "/developer/matches", icon: Briefcase },
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('name').eq('id', user.id).single();
        if (data?.name) setUserName(data.name);
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

      <div className="mt-auto p-6 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#111110] border border-white/10 flex items-center justify-center shrink-0">
             <User size={20} className="text-white/50" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate text-white">{userName}</div>
            <div className="text-[10px] text-[#c8f060] uppercase tracking-widest font-bold">Profile Live</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
