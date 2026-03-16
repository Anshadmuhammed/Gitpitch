"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RecruiterOnboardingPage() {
  const [company, setCompany] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [hiringRoles, setHiringRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Unauthorized");

      // Save to public.users or recruiter_profiles
      await supabase.from('users').update({
        company_name: company,
        company_size: companySize,
        hiring_roles: hiringRoles
      }).eq('id', session.user.id);

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 lg:p-12 border-t border-[rgba(255,255,255,0.08)]">
      <div className="w-full max-w-md card p-8 sm:p-10 relative overflow-hidden">
        <h1 className="text-3xl font-serif mb-2">Welcome to Gitpitch</h1>
        <p className="text-white/50 text-sm mb-8">
          Tell us a bit about your company before you start searching for top developers.
        </p>

        <form onSubmit={handleFinish} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-white/70 uppercase tracking-widest mb-2">
              Company Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
              <input 
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
                placeholder="e.g. Razorpay"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 uppercase tracking-widest mb-2">
              Company Size
            </label>
            <select 
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8f060] transition-colors text-white/70 appearance-none"
              required
            >
              <option value="">Select size...</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 uppercase tracking-widest mb-2">
              What roles are you hiring for?
            </label>
            <div className="flex flex-wrap gap-2">
              {["Frontend", "Backend", "Fullstack", "Mobile", "DevOps", "AI/ML"].map(role => (
                <button 
                  key={role}
                  type="button"
                  onClick={() => setHiringRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-colors ${hiringRoles.includes(role) ? 'bg-[#c8f060] border-[#c8f060] text-black' : 'border-white/10 text-white/50 hover:border-white/20'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md">{error}</div>}

          <button disabled={loading || !company.trim()} className="w-full btn-primary mt-6 tracking-wide">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Complete Onboarding"}
          </button>
        </form>
      </div>
    </div>
  );
}
