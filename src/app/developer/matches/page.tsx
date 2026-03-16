"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Briefcase, AlertCircle, Loader2, ChevronRight, UserCircle } from "lucide-react";
import Link from "next/link";

export default function MatchesPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('developer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin text-[#c8f060]" size={32} />
      </div>
    );
  }

  // Calculate completeness (same logic as profile page)
  const fields = [profile?.github_username, profile?.preferred_cities?.length > 0, profile?.preferred_roles?.length > 0, profile?.top_languages?.length > 0];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-2">Job Matches</h1>
        <p className="text-white/50">Companies interested in your profile will appear here.</p>
      </div>

      {/* Profile Completeness Bar */}
      <div className="bg-[#111110] border border-white/5 p-8 rounded-3xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
           <UserCircle size={40} className="text-white/[0.03]" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <h3 className="text-lg font-serif mb-1">Profile Completeness</h3>
            <p className="text-sm text-white/40">Highly completed profiles get 5x more recruiter interest.</p>
          </div>
          <span className="text-[#c8f060] font-mono text-xl">{completeness}%</span>
        </div>
        
        <div className="space-y-4">
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#c8f060] transition-all duration-700 ease-out shadow-[0_0_15px_rgba(200,240,96,0.3)]" 
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <Link href="/developer" className="inline-flex items-center gap-2 text-xs text-[#c8f060] hover:underline">
              Complete your profile to unlock more matches <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-32 border border-white/5 border-dashed rounded-3xl bg-[#0a0a08]/50 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Briefcase className="text-white/10" size={32} />
        </div>
        <h2 className="text-xl font-medium mb-3">No matches yet</h2>
        <p className="text-white/40 mb-8 max-w-sm mx-auto">
          Recruiters are currently searching for developers. 
          Make sure your profile is 100% complete and <span className="text-white font-medium">'Open to work'</span> is turned on in your settings.
        </p>
        <Link href="/developer" className="btn-primary !py-2.5 !px-8 text-sm">
          Optimize My Profile
        </Link>
      </div>
    </div>
  );
}
