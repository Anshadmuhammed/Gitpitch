"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, MapPin, Code2, Link as LinkIcon, Star, GitFork, Users } from "lucide-react";
import { clsx } from "clsx";
import { DeveloperProfile as ProfileType } from "@/types";

import { useState } from "react";
import { OutreachModal } from "./OutreachModal";

export function DeveloperProfile({
  profile,
  open,
  onOpenChange,
  isShortlisted,
  onShortlist,
  credits,
  onOutreachSent
}: {
  profile: ProfileType & { users?: { name: string; avatar_url: string } } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isShortlisted?: boolean;
  onShortlist?: () => void;
  credits?: number;
  onOutreachSent?: () => void;
}) {
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);

  if (!profile) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0a0a08]/80 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111110] border border-white/10 rounded-xl shadow-2xl z-50 p-0 outline-none animate-in zoom-in-95 duration-200">
          
          <div className="sticky top-0 right-0 p-4 flex justify-end z-20">
            <Dialog.Close asChild>
               <button className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/50 hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </Dialog.Close>
          </div>

          <div className="px-8 pb-10 -mt-10">
            <div className="flex flex-col md:flex-row gap-6 md:items-end mb-8">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-zinc-800 border-4 border-[#111110] relative z-10 shrink-0 shadow-xl">
                {profile.users?.avatar_url || profile.github_raw?.user?.avatar_url ? (
                  <img 
                    src={profile.users?.avatar_url || profile.github_raw?.user?.avatar_url} 
                    alt={profile.github_username}
                    loading="lazy"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 bg-[#111110]">?</div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-serif text-white mb-1">
                  {profile.users?.name || profile.github_raw?.user?.name || profile.github_username}
                </h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/50">
                   <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#c8f060] transition-colors">
                     <LinkIcon size={14} /> @{profile.github_username}
                   </a>
                   <span className="flex items-center gap-1.5"><MapPin size={14} /> {profile.city || profile.location || 'India'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={onShortlist}
                  className={clsx(
                    "btn-ghost !py-2.5 !px-5 text-sm",
                    isShortlisted && "bg-[#c8f060]/10 text-[#c8f060] border-[#c8f060]/20"
                  )}
                 >
                   {isShortlisted ? "Shortlisted ✓" : "Shortlist"}
                 </button>
                 <button 
                  disabled={credits === 0}
                  onClick={() => setIsOutreachOpen(true)}
                  className="btn-primary !py-2.5 !px-5 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {credits === 0 ? "No Credits left" : "Generate Outreach →"}
                 </button>
              </div>
            </div>

            {profile.bio && (
              <div className="mb-10">
                <h3 className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-4">About Developer</h3>
                <p className="text-white/80 leading-relaxed text-base">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
               <div className="bg-[#0a0a08] p-4 rounded-xl border border-white/5">
                 <div className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                   <Star size={12} className="text-[#c8f060]"/> Stars
                 </div>
                 <div className="text-xl font-medium">{formatNumber(profile.total_stars ?? 0)}</div>
               </div>
               <div className="bg-[#0a0a08] p-4 rounded-xl border border-white/5">
                 <div className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                   <Users size={12} className="text-[#c8f060]"/> Followers
                 </div>
                 <div className="text-xl font-medium">{formatNumber(profile.followers ?? 0)}</div>
               </div>
               <div className="bg-[#0a0a08] p-4 rounded-xl border border-white/5">
                 <div className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                   <Code2 size={12} className="text-[#c8f060]"/> Main Tech
                 </div>
                 <div className="text-sm font-medium pt-0.5 truncate">{Array.isArray(profile?.top_languages) ? profile.top_languages[0] : 'N/A'}</div>
               </div>
               <div className="bg-[#0a0a08] p-4 rounded-xl border border-white/5">
                 <div className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                   <GitFork size={12} className="text-[#c8f060]"/> Repos
                 </div>
                 <div className="text-xl font-medium">{Array.isArray(profile?.top_repos) ? profile.top_repos.length : 0}</div>
               </div>
            </div>

            <div className="mb-10">
               <h3 className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-4">Top Languages</h3>
               <div className="flex flex-wrap gap-2.5">
                 {(Array.isArray(profile?.top_languages) ? profile.top_languages : []).map((lang: string) => (
                   <span key={lang} className="px-3.5 py-1.5 bg-[#c8f060]/5 border border-[#c8f060]/10 rounded-full text-xs text-white/90 flex items-center gap-2 font-medium">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(lang) }}></span>
                     {lang}
                   </span>
                 ))}
               </div>
            </div>

            <div>
               <h3 className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-5 text-right flex items-center justify-between">
                 <span>Top Repositories</span>
                 <span className="h-px bg-white/5 flex-1 ml-4"></span>
               </h3>
               <div className="space-y-4">
                 {(Array.isArray(profile?.top_repos) ? profile.top_repos : []).slice(0, 5).map((repo: any) => (
                   <div key={repo.name} className="group bg-[#080807] p-5 rounded-xl border border-white/5 hover:border-[#c8f060]/20 transition-all">
                     <div className="flex justify-between items-start mb-2.5">
                       <a href={repo.url} target="_blank" rel="noreferrer" className="text-lg font-medium text-white group-hover:text-[#c8f060] transition-colors flex items-center gap-2">
                         {repo.name}
                         <LinkIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                       </a>
                       <div className="flex items-center gap-4 text-xs font-mono">
                         {repo.language && <span className="text-white/40">{repo.language}</span>}
                         <span className="text-[#c8f060] flex items-center gap-1">
                           <Star size={12} fill="currentColor" /> {repo.stars}
                         </span>
                       </div>
                     </div>
                     {repo.description && <p className="text-sm text-white/50 leading-relaxed mb-0">{repo.description}</p>}
                   </div>
                 ))}
               </div>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <OutreachModal 
        developer={{
          id: profile.id,
          name: profile.users?.name || profile.github_username,
          github_username: profile.github_username,
          bio: profile.bio,
          top_languages: profile.top_languages,
          top_repos: profile.top_repos
        }}
        open={isOutreachOpen}
        onOpenChange={setIsOutreachOpen}
        onSent={() => onOutreachSent?.()}
        credits={credits ?? 0}
      />
    </Dialog.Root>
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
