"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Send, Sparkles, Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export function OutreachModal({
  developer,
  open,
  onOpenChange,
  onSent,
  credits
}: {
  developer: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: () => void;
  credits: number;
}) {
  const [roleDescription, setRoleDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ id: string; subject: string; body: string } | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/outreach/generate", {
        method: "POST",
        body: JSON.stringify({ 
          developer_id: developer.id, 
          job_description: roleDescription, 
          tone: tone.toLowerCase() 
        }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedContent(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (credits <= 0) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        body: JSON.stringify({ 
          campaign_id: generatedContent?.id,
          developer_email: developer.email 
        }),
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onSent();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0a0a08]/90 backdrop-blur-md z-[60] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-[#111110] border border-white/10 rounded-2xl shadow-2xl z-[70] p-0 outline-none overflow-hidden animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c8f060]/20 flex items-center justify-center">
                <Sparkles size={16} className="text-[#c8f060]" />
              </div>
              <h2 className="text-xl font-serif">Outreach Generator</h2>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-8">
            {!generatedContent ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
                    Describe the Role
                  </label>
                  <textarea 
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer with Next.js experience... we are a Series B fintech based in Bangalore."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#c8f060] transition-colors min-h-[120px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
                    Tone Selector
                  </label>
                  <div className="flex gap-2">
                    {["Professional", "Friendly", "Direct"].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTone(t)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-xs font-medium border transition-all",
                          tone === t ? "bg-[#c8f060] text-black border-[#c8f060]" : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {credits === 0 && (
                  <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-red-200/70 leading-relaxed">
                      You have 0 credits remaining. <a href="/pricing" className="text-red-400 hover:underline">Upgrade your plan</a> to send this outreach.
                    </p>
                  </div>
                )}

                <button 
                  disabled={!roleDescription.trim() || isGenerating}
                  onClick={handleGenerate}
                  className="w-full btn-primary !py-4 flex items-center justify-center gap-2 group"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      Generate Custom Message
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
                    Subject Line
                  </label>
                  <input 
                    type="text"
                    value={generatedContent.subject}
                    onChange={(e) => setGeneratedContent({...generatedContent, subject: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c8f060] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
                    Email Body
                  </label>
                  <textarea 
                    value={generatedContent.body}
                    onChange={(e) => setGeneratedContent({...generatedContent, body: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#c8f060] transition-colors min-h-[200px] resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setGeneratedContent(null)}
                    className="flex-1 btn-ghost !py-4"
                  >
                    Back
                  </button>
                  <button 
                    disabled={isSending || credits <= 0}
                    onClick={handleSend}
                    className="flex-[2] btn-primary !py-4 flex items-center justify-center gap-2"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        <Send size={18} />
                        Send Now (1 Credit)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
