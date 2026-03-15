"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RecruiterOnboardingPage() {
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
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

      // For simplicity in UI demo, we might store this in users table or a recruiter_profiles table.
      // Assuming users table has metadata JSON column or we just skip saving for now since it's a demo.
      // We will just update users table if we had columns, else skip to dashboard.

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

        <form onSubmit={handleFinish} className="space-y-4">
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
              Company Website (Optional)
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
              <input 
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
                placeholder="https://"
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md">{error}</div>}

          <button disabled={loading || !company.trim()} className="w-full btn-primary mt-6 tracking-wide">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Go to Dashboard ->"}
          </button>
        </form>
      </div>
    </div>
  );
}
