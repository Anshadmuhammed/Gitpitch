"use client";
import { useState, useEffect } from "react";
import { SearchFilters } from "@/components/developers/SearchFilters";
import { DeveloperCard } from "@/components/developers/DeveloperCard";
import { DeveloperProfile as DeveloperProfileModal } from "@/components/developers/DeveloperProfile";
import { DeveloperProfile as ProfileType } from "@/types";
import { Loader2, Filter, X, CheckCircle } from "lucide-react";
import { createClient } from '@/utils/supabase/client'
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [credits, setCredits] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProfiles = async (filters: { languages?: string[]; city?: string; open_to_work?: boolean }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.languages?.length) params.set("languages", filters.languages.join(","));
      if (filters.city) params.set("city", filters.city);
      if (filters.open_to_work) params.set("open_to_work", "true");

      const res = await fetch(`/api/github/search?${params.toString()}`);
      const data = await res.json();
      if (data.results) {
        setProfiles(data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  };

  const fetchUserData = async (uid: string) => {
    // Fetch credits
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', uid)
      .single();
    if (userData) setCredits(userData.credits ?? 0);

    // Fetch shortlists
    const { data: shortlistData } = await supabase
      .from('shortlists')
      .select('developer_id')
      .eq('recruiter_id', uid);
    if (shortlistData) {
      setShortlistedIds(shortlistData.map(s => s.developer_id));
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      setUserId(session.user.id);

      // Check role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (userData?.role === 'developer') {
        router.replace('/developer')
      } else {
        await Promise.all([
          fetchProfiles({}),
          fetchUserData(session.user.id)
        ]);
      }
    }
    checkSession()
  }, []);

  const [toast, setToast] = useState<string | null>(null);

  const handleShortlist = async (devId: string) => {
    if (!userId) return;

    const isCurrentlyShortlisted = shortlistedIds.includes(devId);
    
    if (isCurrentlyShortlisted) return;

    const { error } = await supabase.from('shortlists').insert({
      recruiter_id: userId,
      developer_id: devId,
      status: 'saved'
    });

    if (!error) {
      setShortlistedIds(prev => [...prev, devId]);
      setToast("Added to shortlist!");
      setTimeout(() => setToast(null), 3000);
    } else {
      console.error(error);
    }
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || null;

  return (
    <div className="flex h-full relative">
      {/* Desktop Search Sidebar */}
      <div className="hidden lg:block w-72 bg-[#111110] border-r border-white/5 p-6 h-full overflow-y-auto">
        <SearchFilters onFilterChange={fetchProfiles} />
      </div>
      
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4 lg:mt-0">
          <div>
            <h1 className="text-3xl font-serif mb-2">Discover Top Talent</h1>
            <p className="text-white/50">
              {loading ? (
                "Searching developers..."
              ) : (
                `Showing ${profiles.length} Indian developers based on GitHub commits.`
              )}
            </p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                <Filter size={16} />
                Filters
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-[#0a0a08]/90 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
              <Dialog.Content className="fixed right-0 top-0 h-full w-[85%] max-w-[320px] bg-[#111110] p-6 z-50 animate-in slide-in-from-right duration-300 outline-none">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-serif">Filters</h2>
                  <Dialog.Close asChild>
                    <button className="p-2 text-white/50 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-100px)]">
                   <SearchFilters onFilterChange={fetchProfiles} />
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {!initialLoaded && loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card h-64 bg-[#111110] animate-pulse" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-32 border border-white/5 border-dashed rounded-3xl bg-[#0a0a08]/50 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Filter className="text-white/20" size={32} />
            </div>
            <h2 className="text-xl font-medium mb-2">No developers found</h2>
            <p className="text-white/40 mb-8 max-w-xs mx-auto">Try broadening your search criteria or adjusting your filters.</p>
            <button onClick={() => fetchProfiles({})} className="text-[#c8f060] font-medium hover:underline flex items-center gap-2">
              <X size={14} /> Clear all filters
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {profiles.map(profile => (
              <DeveloperCard 
                key={profile.id} 
                profile={profile} 
                onView={setSelectedProfileId}
                isShortlisted={shortlistedIds.includes(profile.id)}
                onShortlist={() => handleShortlist(profile.id)}
              />
            ))}
          </div>
        )}
      </div>

      <DeveloperProfileModal 
        profile={selectedProfile}
        open={!!selectedProfileId}
        onOpenChange={(open) => !open && setSelectedProfileId(null)}
        isShortlisted={selectedProfile ? shortlistedIds.includes(selectedProfile.id) : false}
        onShortlist={() => selectedProfile && handleShortlist(selectedProfile.id)}
        credits={credits}
        onOutreachSent={() => userId && fetchUserData(userId)}
      />

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-[#c8f060] text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium"
          >
            <CheckCircle size={18} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
