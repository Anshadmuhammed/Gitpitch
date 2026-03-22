"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["recruiter", "developer"]),
});

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "recruiter" }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setLoading(true);
    setError("");
    
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, role: data.role }
      }
    });

    if (authError) {
      const errorMessages: Record<string, string> = {
        'User already registered': 'An account with this email already exists. Try logging in.',
        'Invalid email': 'Please enter a valid email address.',
        'Password should be at least 6 characters': 'Password must be at least 6 characters.',
      };
      // For rate limits like "Email rate limit exceeded" we just show the message or a fallback
      setError(errorMessages[authError.message] || authError.message || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Upsert into users table (robust against retries)
      const { error: upsertError } = await supabase.from("users").upsert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role
      });

      if (upsertError) {
        console.error('User persistence error:', upsertError)
        setError("Account created, but failed to save profile. Please try logging in.");
        setLoading(false);
        return;
      }

      // 3. Redirect to onboarding
      router.push(`/onboarding/${data.role}`);
      router.refresh();
    }
  };

  const handleOAuth = async () => {
    // We pass the role in the redirect URL so the callback can capture it
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: `${window.location.origin}/api/auth/callback?role=${selectedRole}`,
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 lg:p-12 border-t border-[rgba(255,255,255,0.08)]">
      <div className="w-full max-w-md card p-8 sm:p-10 relative overflow-hidden">
        <h1 className="text-3xl font-serif mb-2">Create an account</h1>
        <p className="text-white/50 text-sm mb-8">Join Gitpitch and find your next opportunity.</p>

        <div className="flex bg-[#0a0a08] p-1 rounded-lg border border-white/10 mb-6">
          <button type="button" onClick={() => setValue("role", "recruiter")} className={clsx("flex-1 text-sm py-2 rounded-md transition-colors", selectedRole === "recruiter" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}>
            I'm hiring
          </button>
          <button type="button" onClick={() => setValue("role", "developer")} className={clsx("flex-1 text-sm py-2 rounded-md transition-colors", selectedRole === "developer" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}>
            I'm a developer
          </button>
        </div>

        <button 
          onClick={handleOAuth}
          className="w-full btn-ghost flex items-center justify-center gap-3 mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <div className="text-xs text-white/40 uppercase tracking-widest">Or email</div>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input 
              {...register("name")}
              className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
              placeholder="Full name"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <input 
              {...register("email")}
              className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
              placeholder="Email address"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input 
              {...register("password")}
              type="password"
              className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
              placeholder="Password (min 6 chars)"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md">{error}</div>}

          <button disabled={loading} className="w-full btn-primary mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-8">
          Already have an account? <Link href="/login" className="text-[#c8f060] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
