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

export function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <aside className="w-full flex flex-col h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xs font-medium text-white/50 uppercase tracking-widest mb-4">Dashboard</h2>
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={onNavClick}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#111110] border border-white/10 flex items-center justify-center">
             <User size={20} className="text-white/50" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium truncate">My Account</div>
            <div className="text-xs text-[#c8f060]">20 Credits left</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
