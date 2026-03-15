"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Github } from "lucide-react";

export default function DeveloperOnboardingPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync GitHub profile");

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
        <h1 className="text-3xl font-serif mb-2">Connect your GitHub</h1>
        <p className="text-white/50 text-sm mb-8">
          Gitpitch uses your actual commits and stars to match you with top Indian tech companies. 
          No resumes required.
        </p>

        <form onSubmit={handleSync} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 uppercase tracking-widest mb-2">
              GitHub Username
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
                placeholder="e.g. torvalds"
                required
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              We'll fetch your top languages, repos, and total stars.
            </p>
          </div>

          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md">{error}</div>}

          <button disabled={loading || !username.trim()} className="w-full btn-primary mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sync Profile & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
