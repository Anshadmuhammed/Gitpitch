"use client";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to join waitlist");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 lg:p-12 border-t border-[rgba(255,255,255,0.08)]">
      <div className="w-full max-w-md card p-8 sm:p-10 text-center relative overflow-hidden">
        {success ? (
          <div className="py-8 animate-fade-in">
             <div className="w-16 h-16 rounded-full bg-[#c8f060]/10 flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 size={32} className="text-[#c8f060]" />
             </div>
             <h2 className="text-3xl font-serif mb-3 text-white">You're on the list!</h2>
             <p className="text-white/60 mb-8">
               We'll notify you as soon as Gitpitch opens to the public. Keep an eye on your inbox.
             </p>
             <Link href="/" className="btn-ghost px-6 py-2.5 inline-flex">
               ← Back to Home
             </Link>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-serif mb-3">Join the Waitlist</h1>
            <p className="text-white/50 text-sm mb-8">
              Be the first to know when Gitpitch 1.0 launches. 
              Get exclusive early access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3.5 text-center text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md">{error}</div>}

              <button disabled={loading || !email} className="w-full btn-primary py-3.5 tracking-wide">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Request Access"}
              </button>
            </form>

            <p className="text-xs text-white/30 mt-6">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
