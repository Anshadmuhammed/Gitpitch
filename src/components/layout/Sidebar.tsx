import Link from "next/link";
import { Search, ListChecks, Send, Settings, User, ArrowRight } from "lucide-react";
import { clsx } from "clsx";

// For demo purposes and easy usage in server component, we just render NavLinks
const NAV_ITEMS = [
  { name: "Search Developers", href: "/dashboard", icon: Search },
  { name: "Shortlists", href: "/dashboard/shortlists", icon: ListChecks },
  { name: "Outreach Campaigns", href: "/dashboard/outreach", icon: Send },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
  const [user, setUser] = useState<{name: string, credits: number | null}>({name: "My Account", credits: null});
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Try Cache first for instant load
      const cachedTitle = sessionStorage.getItem('user-title');
      const cachedCredits = sessionStorage.getItem('user-credits');
      if (cachedTitle) setUser(prev => ({ ...prev, name: cachedTitle, credits: cachedCredits ? parseInt(cachedCredits) : prev.credits }));

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('name, credits')
          .eq('id', session.user.id)
          .order('created_at', { ascending: false }) // Added to prevent duplicate results error
          .limit(1) // Added to prevent duplicate results error
          .single();
        if (data) {
          const newName = data.name || "My Account";
          setUser({ name: newName, credits: data.credits });
          sessionStorage.setItem('user-title', newName);
          if (data.credits !== null) sessionStorage.setItem('user-credits', data.credits.toString());
        }
      }
    };
    fetchUserData();

    const channel = supabase
      .channel('user-sidebar')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users' 
      }, (payload) => {
        if (payload.new.credits !== undefined || payload.new.name !== undefined) {
          setUser(prev => ({
            name: payload.new.name || prev.name,
            credits: payload.new.credits !== undefined ? payload.new.credits : prev.credits
          }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, []);

  return (
    <aside className="w-full flex flex-col h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xs font-medium text-white/50 uppercase tracking-widest mb-4">Dashboard</h2>
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onNavClick}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-[#c8f060] text-black font-semibold" 
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8f060] to-[#a8d040] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(200,240,96,0.2)]">
               <User size={20} className="text-black" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate text-white">{user.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Recruiter</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest font-bold">
              <span>Outreach Credits</span>
              <span className="text-[#c8f060]">{user.credits ?? 0} left</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#c8f060] transition-all duration-1000 shadow-[0_0_8px_rgba(200,240,96,0.3)]" 
                style={{ width: `${Math.min(((user?.credits || 0) / 100) * 100, 100)}%` }}
              />
            </div>
            {user.credits === 0 && (
              <Link href="/pricing" className="block text-center text-[10px] text-[#c8f060] hover:underline pt-1">
                Upgrade to get more credits
              </Link>
            )}
          </div>
        </div>

        <button 
          onClick={async () => {
             const supabase = createClient();
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
