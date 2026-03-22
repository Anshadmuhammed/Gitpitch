"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Github, MapPin, Code2, Star, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import * as Select from "@radix-ui/react-select";
import { DeveloperCard } from "@/components/developers/DeveloperCard";
import { DeveloperProfile } from "@/types";

export default function DeveloperPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Form states
  const [openToWork, setOpenToWork] = useState(true);
  const [salary, setSalary] = useState([15]); // ₹ lakh
  const [selectedCities, setSelectedCities] = useState<string[]>(["Bengaluru"]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Frontend Engineer"]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('developer_profiles')
        .select(`*`)
        .eq('user_id', user.id)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setGithubUsername(data.github_username);
        setOpenToWork(data.open_to_work ?? true);
        if (data.salary_expectation) setSalary([data.salary_expectation]);
        if (data.preferred_cities) setSelectedCities(data.preferred_cities);
        if (data.preferred_roles) setSelectedRoles(data.preferred_roles);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const [syncing, setSyncing] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");

  const handleSync = async (usernameToSync?: string) => {
    const userToSync = usernameToSync || profile?.github_username || githubUsername;
    if (!userToSync) return;

    setSyncing(true);
    try {
      const res = await fetch(`/api/github/sync`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userToSync })
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setGithubUsername(data.profile.github_username);
        alert("GitHub profile synced successfully!");
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to sync profile");
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('developer_profiles')
        .update({
          open_to_work: openToWork,
          salary_expectation: salary[0],
          preferred_cities: selectedCities,
          preferred_roles: selectedRoles
        })
        .eq('user_id', user.id);
        
      if (error) {
        console.error(error);
        alert(`Failed to save preferences: ${error.message}`);
      } else {
        alert("Preferences saved successfully!");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8f060]" />
      </div>
    );
  }

  // Calculate completeness
  const fields = [profile?.github_username, selectedCities.length > 0, selectedRoles.length > 0, profile?.top_languages?.length > 0];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Left Col: Settings */}
        <div className="flex-1 space-y-10">
          <header>
            <h1 className="text-3xl font-serif mb-2">My Profile</h1>
            <p className="text-white/50">Manage how you appear to top tech recruiters.</p>
          </header>

          {/* Progress Bar */}
          <div className="bg-[#111110] border border-white/5 p-6 rounded-2xl">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Profile Completeness</h3>
                <p className="text-xs text-white/40">Complete your profile to get 3x more visibility.</p>
              </div>
              <span className="text-[#c8f060] font-mono text-sm">{completeness}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#c8f060] transition-all duration-500" 
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-white/40">Connection</h2>
            <div className="card p-6">
              {!profile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Github size={24} />
                    </div>
                    <div>
                      <div className="font-medium">Connect your GitHub</div>
                      <div className="text-xs text-white/40">Sync your profile to show off your projects.</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="Enter GitHub username"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#c8f060]"
                    />
                    <button 
                      onClick={() => handleSync()}
                      disabled={syncing || !githubUsername}
                      className="btn-primary !py-2 !px-6 text-sm flex items-center gap-2"
                    >
                      {syncing ? <Loader2 className="animate-spin" size={16} /> : "Sync Profile"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                      {profile.github_raw?.user?.avatar_url ? (
                        <img src={profile.github_raw.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Github size={24} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">@{profile.github_username}</div>
                      <div className="text-xs text-white/40">GitHub Profile Synced</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSync()}
                    disabled={syncing}
                    className="text-xs px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-2"
                  >
                    {syncing && <Loader2 className="animate-spin" size={12} />}
                    Refresh Sync
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Preferences */}
          <section className="space-y-6">
            <h2 className="text-sm font-medium uppercase tracking-widest text-white/40">Work Preferences</h2>
            
            <div className="space-y-8">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Open to work</div>
                  <div className="text-xs text-white/40">Recruiters will see you in active search results.</div>
                </div>
                <button 
                  onClick={() => setOpenToWork(!openToWork)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${openToWork ? 'bg-[#c8f060]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${openToWork ? 'right-1 bg-black' : 'left-1 bg-white/50'}`} />
                </button>
              </div>

              {/* Salary Slider */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-white/70">Minimum Salary Expectation</label>
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

              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {saving ? "Saving Changes..." : "Save Profile Preferences"}
              </button>
            </div>
          </section>
        </div>

        {/* Right Col: Preview */}
        <div className="hidden lg:block w-80 space-y-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-white/40">Recruiter Preview</h2>
          <div className="sticky top-24">
            <div className="p-4 rounded-2xl border border-dashed border-white/20 bg-white/5 mb-4">
              <p className="text-[10px] text-center text-white/40 italic flex items-center justify-center gap-2">
                <AlertCircle size={12} />
                This is how recruiters see you
              </p>
            </div>
            {profile && (
              <DeveloperCard 
                profile={{
                  ...profile,
                  city: selectedCities[0],
                  open_to_work: openToWork,
                  // @ts-ignore
                  users: profile.users
                }} 
                onView={() => {}} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
