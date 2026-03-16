import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { BadgeCheck, Search, Users, MapPin, TrendingUp, Inbox, Code, Terminal, ArrowRight } from "lucide-react";
import { clsx } from "clsx";

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#c8f060] animate-pulse"></span>
            <span className="text-xs font-medium tracking-wide">gitpitch 1.0 is live</span>
          </div>
        </Reveal>
        
        <Reveal>
          <h1 className="display-heading max-w-4xl mx-auto mb-6 px-4">
            India's best engineers aren't on LinkedIn. <br className="hidden sm:block" />
            <span className="text-[#c8f060] italic">They're on GitHub.</span>
          </h1>
        </Reveal>
        
        <Reveal>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop messaging candidates who haven't pushed code in months. 
            Search by real commits, top languages, and actual contributions. 
            The tech talent platform built exclusively for Indian recruiters.
          </p>
        </Reveal>

        <Reveal className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/signup" className="btn-primary flex items-center gap-2 justify-center">
            Start finding engineers <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn-ghost flex justify-center">
            Book a Demo
          </Link>
        </Reveal>
        
        <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl mx-auto border-t border-[rgba(255,255,255,0.08)] pt-10">
          <div>
            <div className="text-3xl font-serif text-white mb-1">10M+</div>
            <div className="text-xs text-white/50 uppercase tracking-widest">Indian Devs</div>
          </div>
          <div>
            <div className="text-3xl font-serif text-[#c8f060] mb-1">37%</div>
            <div className="text-xs text-white/50 uppercase tracking-widest">Response Rate</div>
          </div>
          <div>
            <div className="text-3xl font-serif text-white mb-1">48h</div>
            <div className="text-xs text-white/50 uppercase tracking-widest">First Match</div>
          </div>
        </Reveal>
      </section>

      {/* 2. Marquee */}
      <section className="py-10 border-y border-[rgba(255,255,255,0.08)] bg-[#111110] relative overflow-hidden flex whitespace-nowrap">
        <div className="animate-[marquee_20s_linear_infinite] inline-flex items-center gap-12 px-6">
          {["Rust", "Go", "Next.js", "Python", "Solidity", "TypeScript", "Django", "React Native", "Kubernetes", "PostgreSQL", "Flutter"].map((tech, i) => (
            <span key={i} className="text-xl font-serif text-white/40">{tech} Developer</span>
          ))}
        </div>
        <div className="animate-[marquee_20s_linear_infinite] inline-flex items-center gap-12 px-6 absolute top-10 left-full">
          {["Rust", "Go", "Next.js", "Python", "Solidity", "TypeScript", "Django", "React Native", "Kubernetes", "PostgreSQL", "Flutter"].map((tech, i) => (
            <span key={i} className="text-xl font-serif text-white/40">{tech} Developer</span>
          ))}
        </div>
      </section>

      {/* 3. How it works */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <Reveal className="mb-16">
          <h2 className="section-label mb-4">How it works</h2>
          <h3 className="text-4xl sm:text-5xl font-serif leading-tight">From GitHub straight to <br/>your interview pipeline.</h3>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            {[ 
              { step: "01", title: "Search by reality, not resume", desc: "Filter engineers in Bengaluru, Delhi, or remote based on what they actually build, not what they claim." },
              { step: "02", title: "Review real code", desc: "See their top starred repos, language distribution, and commit frequency over the last 12 months." },
              { step: "03", title: "Generate hyper-personalized outreach", desc: "Our AI reads their repositories and writes an email referencing their actual work." },
              { step: "04", title: "Manage pipelines", desc: "Track candidates from 'Contacted' to 'Hired' in our built-in kanban board." }
            ].map((item, i) => (
              <Reveal key={i} className="flex gap-6">
                <div className="text-xl font-serif text-white/30 pt-1">{item.step}</div>
                <div>
                  <h4 className="text-xl font-medium mb-2">{item.title}</h4>
                  <p className="text-white/60 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="relative mt-20 lg:mt-0 px-4 sm:px-0">
            <div className="absolute -inset-4 bg-[#c8f060]/5 rounded-[2rem] blur-3xl -z-10"></div>
            
            {/* Mock Dev Card */}
            <div className="card p-6 mb-6 transform lg:-rotate-2 relative z-10 shadow-2xl bg-[#111110] max-w-sm mx-auto lg:mx-0">
              <div className="flex gap-4 items-start mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-800 shrink-0"></div>
                <div className="min-w-0">
                  <div className="font-medium truncate">Avinash S.</div>
                  <div className="text-xs text-white/50 truncate">@avinassh • Bengaluru</div>
                </div>
                <div className="ml-auto px-2 py-1 bg-[#c8f060]/10 text-[#c8f060] text-[10px] sm:text-xs rounded-md whitespace-nowrap">98% Match</div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] sm:text-xs text-white/70">Go</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] sm:text-xs text-white/70">Python</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] sm:text-xs text-white/70">Docker</span>
              </div>
              <div className="p-3 bg-[#0a0a08] border border-white/5 rounded-lg text-[10px] sm:text-xs font-mono text-white/60">
                <span className="text-[#c8f060]">★ 1.2k</span> top repo: `awesome-go-india`
              </div>
            </div>
 
            {/* Mock Terminal/AI */}
            <div className="card p-6 transform lg:rotate-1 relative z-20 shadow-2xl bg-[#0a0a08] border-white/10 ml-4 lg:ml-8 max-w-sm mx-auto lg:mx-0 mt-[-2rem] lg:mt-0">
              <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>
              <p className="text-xs sm:text-sm text-white/80 font-mono mb-2">
                <span className="text-[#c8f060]">{"{"} subject:</span> "Chat about your awesome-go repo?"
              </p>
              <p className="text-xs sm:text-sm text-white/60 font-mono leading-relaxed">
                Hi Avinash, loved your recent commits to `awesome-go-india`. We are building a high-throughput backend in Go at Gitpitch and I think you'd be a great fit...
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Features */}
      <section className="py-24 bg-[#111110] border-y border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <h2 className="section-label mb-4">Features</h2>
            <h3 className="text-4xl font-serif">Everything you need to source great engineers.</h3>
          </Reveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Code, title: "GitHub Signal", desc: "We index public repos to verify coding claims." },
              { icon: Inbox, title: "Hyper-Personalized", desc: "AI-generated cold emails referencing actual repos." },
              { icon: Users, title: "Pipeline Management", desc: "Built-in Kanban board specifically for tech hiring." },
              { icon: MapPin, title: "City-level Search", desc: "Target engineers locally in BLR, DEL, BOM, etc." },
              { icon: TrendingUp, title: "Salary Benchmarks", desc: "Know if they fit your budget before you message." },
              { icon: BadgeCheck, title: "ATS Integration", desc: "Export hired candidates straight to your ATS." }
            ].map((feature, i) => (
              <Reveal key={i} className="card p-6 hover:bg-[#1a1a18]">
                <div className="w-10 h-10 rounded-full bg-[#c8f060]/10 flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-[#c8f060]" />
                </div>
                <h4 className="font-medium mb-2">{feature.title}</h4>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="section-label mb-4">Pricing</h2>
          <h3 className="text-4xl font-serif">Priced for Indian startups.</h3>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          <Reveal className="card p-8 flex flex-col">
            <div className="text-white/60 text-sm font-medium mb-2">Starter</div>
            <div className="text-4xl font-serif mb-6">₹4,999<span className="text-lg text-white/40 font-sans">/mo</span></div>
            <ul className="space-y-3 mb-8 text-sm text-white/70 flex-grow">
              <li>✓ 100 searches / month</li>
              <li>✓ 20 AI outreach credits</li>
              <li>✓ Basic kanban board</li>
            </ul>
            <Link href="/pricing" className="btn-ghost w-full text-center">Get Started</Link>
          </Reveal>

          <Reveal className="card p-8 flex flex-col border-[#c8f060]/30 shadow-[0_0_30px_rgba(200,240,96,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#c8f060] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Most Popular</div>
            <div className="text-[#c8f060] text-sm font-medium mb-2">Growth</div>
            <div className="text-4xl font-serif mb-6">₹14,999<span className="text-lg text-white/40 font-sans">/mo</span></div>
            <ul className="space-y-3 mb-8 text-sm text-white/70 flex-grow">
              <li>✓ Unlimited searches</li>
              <li>✓ 100 AI outreach credits</li>
              <li>✓ Advanced pipeline & filters</li>
              <li>✓ Premium support</li>
            </ul>
            <Link href="/pricing" className="btn-primary w-full text-center">Try Growth</Link>
          </Reveal>

          <Reveal className="card p-8 flex flex-col">
            <div className="text-white/60 text-sm font-medium mb-2">Enterprise</div>
            <div className="text-4xl font-serif mb-6">Custom</div>
            <ul className="space-y-3 mb-8 text-sm text-white/70 flex-grow">
              <li>✓ ATS Integrations</li>
              <li>✓ Unlimited AI credits</li>
              <li>✓ Dedicated account manager</li>
              <li>✓ API access</li>
            </ul>
            <Link href="/contact" className="btn-ghost w-full text-center">Contact Sales</Link>
          </Reveal>
        </div>
      </section>

      {/* 6. CTA & 7. Footer */}
      <section className="mt-10 border-t border-[rgba(255,255,255,0.08)] bg-[#0a0a08]">
        <div className="py-24 px-6 text-center max-w-4xl mx-auto">
          <Reveal>
            <h2 className="display-heading mb-8">Stop scrolling LinkedIn. <br/>Start finding engineers who actually <span className="text-[#c8f060] italic">build</span>.</h2>
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2">
              Start Free Trial <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
        
        <footer className="py-8 border-t border-[rgba(255,255,255,0.05)] px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-white/40">
            <div>© {new Date().getFullYear()} Gitpitch. Built for India.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </section>
      
      {/* Tailwind marquee animation logic injected via a generic class */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}
