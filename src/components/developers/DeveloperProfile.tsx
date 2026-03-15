"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, MapPin, Code2, Link as LinkIcon, Star, GitFork, Users } from "lucide-react";
import { DeveloperProfile as ProfileType } from "@/types";

export function DeveloperProfile({
  profile,
  open,
  onOpenChange
}: {
  profile: ProfileType & { users?: { name: string; avatar_url: string } } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!profile) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0a0a08]/80 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111110] border border-white/10 rounded-xl shadow-2xl z-50 p-0 outline-none">
          
          <div className="sticky top-0 right-0 p-4 flex justify-end z-10">
            <Dialog.Close asChild>
               <button className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/50 hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </Dialog.Close>
          </div>

          <div className="px-8 pb-8 -mt-10">
            <div className="flex gap-6 items-end mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-4 border-[#111110] relative z-10 shrink-0">
                {profile.users?.avatar_url || profile.github_raw?.user?.avatar_url ? (
                  <img 
                    src={profile.users?.avatar_url || profile.github_raw?.user?.avatar_url} 
                    alt={profile.github_username}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 bg-[#111110]">?</div>
                )}
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-serif text-white mb-1">
                  {profile.users?.name || profile.github_raw?.user?.name || profile.github_username}
                </h2>
                <div className="flex items-center gap-4 text-sm text-white/50">
                   <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#c8f060] transition-colors">
                     <LinkIcon size={14} /> @{profile.github_username}
                   </a>
                   <span className="flex items-center gap-1"><MapPin size={14} /> {profile.city || profile.location || 'India'}</span>
                </div>
              </div>
              <div className="pb-2">
                 <button className="btn-primary">Shortlist Candidate</button>
              </div>
            </div>

            {profile.bio && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-3">About</h3>
                <p className="text-white/80 leading-relaxed text-sm">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-8">
               <div className="bg-[#0a0a08] p-4 rounded-lg border border-white/5">
                 <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><Star size={12}/> Total Stars</div>
                 <div className="text-xl font-medium">{formatNumber(profile.total_stars)}</div>
               </div>
               <div className="bg-[#0a0a08] p-4 rounded-lg border border-white/5">
                 <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><Users size={12}/> Followers</div>
                 <div className="text-xl font-medium">{formatNumber(profile.followers)}</div>
               </div>
               <div className="bg-[#0a0a08] p-4 rounded-lg border border-white/5">
                 <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><Code2 size={12}/> Top Lang</div>
                 <div className="text-sm font-medium pt-1 truncate">{profile.top_languages[0] || 'N/A'}</div>
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-3">Top Languages</h3>
               <div className="flex flex-wrap gap-2">
                 {profile.top_languages?.map((lang) => (
                   <span key={lang} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/80 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(lang) }}></span>
                     {lang}
                   </span>
                 ))}
               </div>
            </div>

            <div>
               <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Top Repositories</h3>
               <div className="space-y-3">
                 {profile.top_repos?.map((repo) => (
                   <div key={repo.name} className="bg-[#0a0a08] p-4 rounded-lg border border-white/5">
                     <div className="flex justify-between items-start mb-2">
                       <a href={repo.url} target="_blank" rel="noreferrer" className="text-base font-medium text-[#c8f060] hover:underline">
                         {repo.name}
                       </a>
                       <div className="flex items-center gap-3 text-xs text-white/40">
                         {repo.language && <span className="flex items-center gap-1"><Code2 size={12}/> {repo.language}</span>}
                         <span className="flex items-center gap-1"><Star size={12}/> {repo.stars}</span>
                       </div>
                     </div>
                     <p className="text-sm text-white/60 line-clamp-2">{repo.description}</p>
                   </div>
                 ))}
               </div>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
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
