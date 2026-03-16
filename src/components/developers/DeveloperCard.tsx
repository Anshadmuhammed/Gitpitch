"use client";
import { DeveloperProfile } from "@/types";
import { MapPin, Code2, Star, Github } from "lucide-react";
import { clsx } from "clsx";

export function DeveloperCard({ 
  profile, 
  onView,
  isShortlisted,
  onShortlist,
  customAction
}: { 
  profile: DeveloperProfile & { users?: { name: string; avatar_url: string } }; 
  onView: (id: string) => void;
  isShortlisted?: boolean;
  onShortlist?: () => void;
  customAction?: { label: string; onClick: () => void };
}) {
  // Mock match score randomly between 75-98 for the demo
  const matchScore = Math.floor(Math.random() * (98 - 75 + 1) + 75);

  return (
    <div className="card p-5 flex flex-col h-full bg-[#111110]">
      <div className="flex gap-4 items-start mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
          {profile.users?.avatar_url || profile.github_raw?.user?.avatar_url ? (
            <img 
              src={profile.users?.avatar_url || profile.github_raw?.user?.avatar_url} 
              alt={profile.github_username}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50"><Github size={20} /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-white">
            {profile.users?.name || profile.github_username}
          </div>
          <div className="text-xs text-white/50 truncate flex items-center gap-1 mt-0.5">
            @{profile.github_username}
          </div>
          <div className="text-xs text-white/40 flex items-center gap-1 mt-1 truncate">
            <MapPin size={10} />
            {profile.city || profile.location || 'India'}
          </div>
        </div>
        <div className="px-2 py-1 bg-[#c8f060]/10 text-[#c8f060] text-[10px] font-medium rounded-md whitespace-nowrap">
          {matchScore}% Match
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4 max-h-16 overflow-hidden">
        {profile.top_languages?.slice(0, 4).map((lang) => (
          <span key={lang} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/70 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getLanguageColor(lang) }}></span>
            {lang}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
        {profile.top_repos?.[0] && (
          <div className="text-xs text-white/60 font-mono truncate bg-[#0a0a08] p-2 rounded border border-white/5">
            <span className="text-[#c8f060]">★ {formatNumber(profile.top_repos[0].stars)}</span> {profile.top_repos[0].name}
          </div>
        )}
        
        <div className="flex gap-2">
          <button 
            onClick={() => onView(profile.id)}
            className="flex-1 btn-ghost !py-2 !text-xs !px-0 flex items-center justify-center"
          >
            View Profile
          </button>
           {customAction ? (
            <button 
              onClick={(e) => { e.stopPropagation(); customAction.onClick(); }}
              className="flex-1 !py-2 !text-xs !px-0 flex items-center justify-center bg-[#c8f060] text-black font-semibold rounded hover:bg-[#b0d650] transition-colors"
            >
              {customAction.label}
            </button>
          ) : (
            <button 
              onClick={onShortlist}
              className={clsx(
                "flex-1 !py-2 !text-xs !px-0 flex items-center justify-center transition-all",
                isShortlisted 
                  ? "bg-[#c8f060]/10 text-[#c8f060] border border-[#c8f060]/20" 
                  : "btn-primary bg-white text-black border border-transparent hover:bg-white/90"
              )}
            >
              {isShortlisted ? "Shortlisted ✓" : "Shortlist"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    'TypeScript': '#3178c6',
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'C++': '#f34b7d',
    'Java': '#b07219',
    'Ruby': '#701516'
  };
  return colors[lang] || '#8b8b8b';
}
