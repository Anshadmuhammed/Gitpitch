"use client";
import { useState, useEffect } from "react";
import { SearchFilters } from "@/components/developers/SearchFilters";
import { DeveloperCard } from "@/components/developers/DeveloperCard";
import { DeveloperProfile as DeveloperProfileModal } from "@/components/developers/DeveloperProfile";
import { DeveloperProfile as ProfileType } from "@/types";
import { Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
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

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
      } else {
        fetchProfiles({});
      }
    }
    checkSession()
  }, []);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || null;

  return (
    <div className="flex h-full">
      <SearchFilters onFilterChange={fetchProfiles} />
      
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif mb-2">Discover Top Talent</h1>
          <p className="text-white/50">Search {profiles.length} Indian developers who skipped LinkedIn today.</p>
        </div>

        {!initialLoaded && loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#c8f060]" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 border border-white/10 border-dashed rounded-xl bg-[#0a0a08]">
            <p className="text-white/50">No developers match your exact criteria.</p>
            <button onClick={() => fetchProfiles({})} className="text-[#c8f060] hover:underline text-sm mt-2">Clear filters</button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {profiles.map(profile => (
              <DeveloperCard 
                key={profile.id} 
                profile={profile} 
                onView={setSelectedProfileId} 
              />
            ))}
          </div>
        )}
      </div>

      <DeveloperProfileModal 
        profile={selectedProfile}
        open={!!selectedProfileId}
        onOpenChange={(open) => !open && setSelectedProfileId(null)}
      />
    </div>
  );
}
