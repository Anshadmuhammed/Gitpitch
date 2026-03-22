"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Send, ExternalLink, MailOpen, User } from "lucide-react";
import { clsx } from "clsx";

export default function OutreachPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('outreach_campaigns')
        .select('*, developer_profiles(*)')
        .eq('recruiter_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setCampaigns(data);
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#c8f060]" size={32} />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'opened': return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      case 'replied': return 'bg-[#c8f060]/10 text-[#c8f060] border-[#c8f060]/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-2">Outreach Campaigns</h1>
        <p className="text-white/50">Track the messages you've sent to top developers.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-32 border border-white/5 border-dashed rounded-3xl bg-[#0a0a08]/50 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Send className="text-white/20" size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No outreach campaigns yet</h2>
          <p className="text-white/40 mb-8 max-w-xs mx-auto">Find a developer and generate your first personalized message to see it here!</p>
          <a href="/dashboard" className="btn-primary !py-2 !px-6 text-sm">Find Developers</a>
        </div>
      ) : (
        <div className="bg-[#111110] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Developer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Subject</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-white/10">
                           <img 
                            src={camp.developer_profiles?.github_raw?.user?.avatar_url} 
                            alt={camp.developer_profiles?.github_username}
                            loading="lazy"
                            className="w-full h-full object-cover"
                           />
                        </div>
                        <div>
                          <div className="text-sm font-medium">@{camp.developer_profiles?.github_username}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-wider">{camp.developer_profiles?.city || 'India'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/70 max-w-xs truncate">{camp.subject}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        getStatusColor(camp.status)
                      )}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-white/40">
                        {new Date(camp.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-white/20 hover:text-[#c8f060] hover:bg-[#c8f060]/10 rounded-lg transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
