"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, User, Building, Shield, ChevronRight, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('users')
      .update({
        name: profile.name,
        company_name: profile.company_name,
        company_size: profile.company_size,
      })
      .eq('id', session.user.id);

    setIsSaving(false);
    alert("Settings saved!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#c8f060]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-2">Settings</h1>
        <p className="text-white/50">Manage your recruiter profile and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="card p-8 bg-[#111110]">
          <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
            <User size={20} className="text-[#c8f060]" />
            Personal Information
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Full Name</label>
                <input 
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#c8f060]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Email Address (Read-only)</label>
                <input 
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-sm text-white/40 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={isSaving} className="btn-primary !py-2.5 !px-8">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Company Card */}
        <div className="card p-8 bg-[#111110]">
          <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
            <Building size={20} className="text-[#c8f060]" />
            Company Details
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Company Name</label>
                <input 
                  type="text"
                  value={profile.company_name || ""}
                  onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#c8f060]"
                  placeholder="e.g. Razorpay"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Team Size</label>
                <select 
                  value={profile.company_size || ""}
                  onChange={(e) => setProfile({...profile, company_size: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#c8f060] appearance-none"
                >
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={isSaving} className="btn-primary !py-2.5 !px-8">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Save Company Info"}
              </button>
            </div>
          </form>
        </div>

        {/* Plan & Billing */}
        <div className="card p-8 bg-[#111110] border border-[#c8f060]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <span className="bg-[#c8f060] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Pro Plan</span>
          </div>
          <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
            <CreditCard size={20} className="text-[#c8f060]" />
            Plan & Billing
          </h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/40 p-6 rounded-2xl border border-white/5">
            <div>
              <div className="text-2xl font-serif mb-1">{profile.credits ?? 0} Credits</div>
              <div className="text-sm text-white/40">Remaining for this billing cycle</div>
            </div>
            <button className="btn-primary flex items-center gap-2 group whitespace-nowrap">
              Upgrade Plan
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="card p-8 bg-[#111110]">
          <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
            <Shield size={20} className="text-[#c8f060]" />
            Security
          </h2>
          <button className="btn-ghost !py-3 !px-6 text-sm flex items-center gap-2">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
