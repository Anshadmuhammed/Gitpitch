"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DeveloperCard } from "@/components/developers/DeveloperCard";
import { DeveloperProfile } from "@/components/developers/DeveloperProfile";
import { Loader2, Kanban as KanbanIcon, ListFilter } from "lucide-react";

const STAGES = ["saved", "contacted", "replied", "hired"];

export default function ShortlistsPage() {
  const [shortlists, setShortlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const supabase = createClient();

  const fetchShortlists = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('shortlists')
      .select('*, developer_profiles(*)')
      .eq('recruiter_id', session.user.id);

    if (data) setShortlists(data);
    setLoading(false);
  };

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('users').select('credits').eq('id', session.user.id).single();
    if (data) setCredits(data.credits);
  };

  const handleUpdateStatus = async (shortlistId: string, currentStatus: string) => {
    const nextIndex = STAGES.indexOf(currentStatus) + 1;
    if (nextIndex >= STAGES.length) return;
    
    const nextStatus = STAGES[nextIndex];
    const { error } = await supabase
      .from('shortlists')
      .update({ status: nextStatus })
      .eq('id', shortlistId);

    if (!error) {
      setShortlists(prev => prev.map(s => s.id === shortlistId ? { ...s, status: nextStatus } : s));
    }
  };

  useEffect(() => {
    fetchShortlists();
    fetchUserData();
  }, []);

  const selectedShortlist = shortlists.find(s => s.developer_id === selectedProfileId);
  const selectedProfile = selectedShortlist?.developer_profiles || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin text-[#c8f060]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif mb-2">Shortlisted Talent</h1>
          <p className="text-white/50">Manage your pipeline of potential hires.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost !py-2 !px-4 text-xs flex items-center gap-2">
            <ListFilter size={14} /> Filter
          </button>
          <button className="btn-primary !py-2 !px-4 text-xs flex items-center gap-2">
            <KanbanIcon size={14} /> Kanban View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {STAGES.map(stage => (
          <div key={stage} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 truncate">
                {stage}
              </h3>
              <span className="bg-white/5 text-white/40 text-[10px] px-2 py-0.5 rounded-full">
                {shortlists.filter(s => s.status === stage).length}
              </span>
            </div>
            
            <div className="flex flex-col gap-4 min-h-[200px]">
              {shortlists
                .filter(s => s.status === stage)
                .map(item => (
                  <DeveloperCard 
                    key={item.id}
                    profile={item.developer_profiles}
                    onView={setSelectedProfileId}
                    isShortlisted={true}
                    customAction={
                      stage === "hired" ? undefined : {
                        label: "Next Stage →",
                        onClick: () => handleUpdateStatus(item.id, item.status)
                      }
                    }
                  />
                ))}
              {shortlists.filter(s => s.status === stage).length === 0 && (
                <div className="border border-white/5 border-dashed rounded-2xl h-32 flex items-center justify-center text-white/10 text-xs italic">
                  No one here yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <DeveloperProfile 
        profile={selectedProfile}
        open={!!selectedProfileId}
        onOpenChange={(open) => !open && setSelectedProfileId(null)}
        isShortlisted={true}
        credits={credits}
        onOutreachSent={fetchUserData}
      />
    </div>
  );
}
