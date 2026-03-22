"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  User, 
  Github, 
  Shield, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  EyeOff, 
  CreditCard,
  MapPin,
  Code2,
  CheckCircle
} from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import { motion, AnimatePresence } from "framer-motion";

export default function DeveloperSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const supabase = createClient();

  // Form states (synced with DB)
  const [openToWork, setOpenToWork] = useState(true);
  const [salary, setSalary] = useState([15]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [hideProfile, setHideProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [userRes, profileRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('developer_profiles').select('*').eq('user_id', user.id).order('id', { ascending: false }).limit(1).maybeSingle()
      ]);

      if (userRes.data) setUserData(userRes.data);
      if (profileRes.data) {
        setProfile(profileRes.data);
        setOpenToWork(profileRes.data.open_to_work ?? true);
        if (profileRes.data.salary_expectation) setSalary([profileRes.data.salary_expectation]);
        if (profileRes.data.preferred_cities) setSelectedCities(profileRes.data.preferred_cities);
        if (profileRes.data.preferred_roles) setSelectedRoles(profileRes.data.preferred_roles);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;

    const { error } = await supabase
      .from('developer_profiles')
      .update({
        open_to_work: openToWork,
        salary_expectation: salary[0],
        preferred_cities: selectedCities,
        preferred_roles: selectedRoles,
      })
      .eq('user_id', user.id);

    if (!error) {
      setToast("Settings saved!");
      setTimeout(() => setToast(null), 3000);
    }
    setIsSaving(false);
  };

  const handleSync = async () => {
    if (!profile?.github_username) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/github/sync`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profile.github_username })
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setToast("GitHub profile synced!");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#c8f060]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto mb-10">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-2">Settings</h1>
        <p className="text-white/50">Manage your profile, visibility, and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="card p-8 bg-[#111110]">
          <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
            <User size={20} className="text-[#c8f060]" />
            Account Information
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                {profile?.github_raw?.user?.avatar_url ? (
                  <img src={profile.github_raw.user.avatar_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20"><User size={32} /></div>
                )}
              </div>
              <div>
                <div className="text-xl font-medium">{userData?.name || "Developer"}</div>
                <div className="text-sm text-white/40">{userData?.email}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Email Address (Read-only)</label>
                <input 
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-sm text-white/40 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Card */}
        <div className="card p-8 bg-[#111110]">
          <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
            <Github size={20} className="text-[#c8f060]" />
            GitHub Integration
          </h2>
          <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                 <Github size={20} />
               </div>
               <div>
                  <div className="text-sm font-medium">@{profile?.github_username || "Not connected"}</div>
                  <div className="text-xs text-white/40">Last synced: {profile?.last_synced_at ? new Date(profile.last_synced_at).toLocaleDateString() : 'Never'}</div>
               </div>
             </div>
             <button 
               onClick={handleSync}
               disabled={syncing || !profile}
               className="text-xs px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-2"
             >
               {syncing && <Loader2 className="animate-spin" size={12} />}
               Resync from GitHub
             </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-8 bg-[#111110]">
          <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
            <Code2 size={20} className="text-[#c8f060]" />
            Work Preferences
          </h2>
          <div className="space-y-10">
            {/* Open to Work Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Open to work</div>
                <div className="text-xs text-white/40">Visible to recruiters in search results.</div>
              </div>
              <button 
                onClick={() => setOpenToWork(!openToWork)}
                className={`w-12 h-6 rounded-full transition-colors relative ${openToWork ? 'bg-[#c8f060]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${openToWork ? 'right-1 bg-black' : 'left-1 bg-white/50'}`} />
              </button>
            </div>

            {/* Salary */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <label className="text-white/70">Min Salary Expectation</label>
                <span className="text-[#c8f060] font-mono">₹{salary[0]} LPA</span>
              </div>
              <Slider.Root 
                className="relative flex items-center select-none touch-none w-full h-5"
                value={salary}
                onValueChange={setSalary}
                max={100}
                step={1}
              >
                <Slider.Track className="bg-white/10 relative grow rounded-full h-[3px]">
                  <Slider.Range className="absolute bg-[#c8f060] rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[#c8f060] rounded-full hover:scale-110 focus:outline-none transition-transform cursor-pointer" />
              </Slider.Root>
            </div>

            {/* Cities */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/70">Preferred Cities</label>
              <div className="flex flex-wrap gap-2">
                {["Bengaluru", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Remote"].map(city => (
                  <button 
                    key={city}
                    onClick={() => setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city])}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${selectedCities.includes(city) ? 'bg-[#c8f060] border-[#c8f060] text-black' : 'border-white/10 text-white/50 hover:border-white/20'}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/70">Preferred Roles</label>
              <div className="flex flex-wrap gap-2">
                {["Frontend Engineer", "Backend Engineer", "Fullstack", "DevOps", "AI/ML", "Mobile"].map(role => (
                  <button 
                    key={role}
                    onClick={() => setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${selectedRoles.includes(role) ? 'bg-[#c8f060] border-[#c8f060] text-black' : 'border-white/10 text-white/50 hover:border-white/20'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="card p-8 bg-[#111110]">
          <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
            <EyeOff size={20} className="text-[#c8f060]" />
            Privacy
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Hide my profile</div>
              <div className="text-xs text-white/40">Completely hide your profile from all recruiters.</div>
            </div>
            <button 
              onClick={() => setHideProfile(!hideProfile)}
              className={`w-12 h-6 rounded-full transition-colors relative ${hideProfile ? 'bg-[#c8f060]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${hideProfile ? 'right-1 bg-black' : 'left-1 bg-white/50'}`} />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 pt-10 pb-4 bg-gradient-to-t from-[#0a0a08] via-[#0a0a08] to-transparent z-10 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary !py-3 !px-12 shadow-2xl flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            Save Settings
          </button>
        </div>

        {/* Danger Zone */}
        <div className="card p-8 bg-red-500/5 border border-red-500/10 mt-12">
          <h2 className="text-lg font-serif mb-2 text-red-500 flex items-center gap-2">
            <Trash2 size={20} />
            Danger Zone
          </h2>
          <p className="text-sm text-white/40 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500 hover:text-white transition-all">
            Delete Account
          </button>
        </div>
      </div>

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
