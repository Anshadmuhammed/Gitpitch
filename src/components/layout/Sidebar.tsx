import Link from "next/link";
import { Search, ListChecks, Send, Settings, User } from "lucide-react";
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
  const [credits, setCredits] = useState<number | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('credits')
          .eq('id', session.user.id)
          .single();
        if (data) setCredits(data.credits);
      }
    };
    fetchCredits();

    // Optional: Realtime update
    const channel = supabase
      .channel('user-credits')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users' 
      }, (payload) => {
        if (payload.new.credits !== undefined) {
          setCredits(payload.new.credits);
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

      <div className="mt-auto p-6 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#111110] border border-white/10 flex items-center justify-center shrink-0">
             <User size={20} className="text-white/50" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium truncate">My Account</div>
            <div className="text-xs text-[#c8f060] flex items-center gap-1.5">
              {credits !== null ? `${credits} Credits left` : 'Loading...'}
              {credits === 0 && <Link href="/pricing" className="text-white/40 hover:text-white underline">Buy more</Link>}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
