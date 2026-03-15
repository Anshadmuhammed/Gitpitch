"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Send, Wand2, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function OutreachGenerator({
  open,
  onOpenChange,
  candidateName,
  candidateGithub
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateGithub: string;
}) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [tone, setTone] = useState("professional");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          githubUsername: candidateGithub, 
          tone,
          companyName: "Your Company" // Hardcoded for demo
        })
      });
      const data = await res.json();
      if (data.subject) setEmailSubject(data.subject);
      if (data.body) setEmailBody(data.body);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          toEmail: `${candidateGithub}@placeholder.com`, // Mock
          subject: emailSubject,
          content: emailBody
        })
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onOpenChange(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0a0a08]/80 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#111110] border border-white/10 rounded-xl shadow-2xl z-50 p-6 sm:p-8 outline-none flex flex-col max-h-[90vh]">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <Dialog.Title className="text-xl font-serif text-white mb-1">
                Pitch {candidateName}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-white/50">
                Generate a hyper-personalized email based on their GitHub activity.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
               <button className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/50 hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {!emailBody && !loading && (
              <div className="bg-[#0a0a08] p-6 rounded-lg border border-white/5 text-center">
                 <div className="w-12 h-12 rounded-full bg-[#111110] border border-white/10 flex items-center justify-center mx-auto mb-4">
                   <Wand2 size={20} className="text-[#c8f060]" />
                 </div>
                 <h3 className="text-white font-medium mb-2">AI Campaign Generator</h3>
                 <p className="text-sm text-white/50 mb-6">Select a tone to generate a unique pitch referencing their repositories and languages.</p>
                 
                 <div className="flex justify-center gap-3">
                   {["professional", "casual", "technical"].map((t) => (
                     <button 
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-4 py-2 rounded-md text-sm capitalize transition-colors ${tone === t ? 'bg-[#c8f060]/10 text-[#c8f060] border border-[#c8f060]/30' : 'bg-[#111110] text-white/50 border border-white/10 hover:text-white'}`}
                     >
                       {t}
                     </button>
                   ))}
                 </div>
              </div>
            )}

            {loading && (
              <div className="py-20 flex flex-col items-center justify-center text-white/50 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#c8f060]" />
                <p className="text-sm animate-pulse">Analyzing @{candidateGithub}'s repositories...</p>
              </div>
            )}

            {emailBody && !loading && (
              <div className="space-y-4 animate-fade-in">
                 <div>
                   <label className="block text-xs font-medium text-white/70 uppercase tracking-widest mb-2">Subject</label>
                   <input 
                     type="text" 
                     value={emailSubject}
                     onChange={(e) => setEmailSubject(e.target.value)}
                     className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8f060]"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-white/70 uppercase tracking-widest mb-2">Body</label>
                   <textarea 
                     rows={8}
                     value={emailBody}
                     onChange={(e) => setEmailBody(e.target.value)}
                     className="w-full bg-[#0a0a08] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8f060] resize-none"
                   />
                 </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.08)] flex justify-between gap-4">
            {!emailBody ? (
              <button 
                onClick={handleGenerate}
                className="w-full btn-ghost border border-white/10 hover:border-white/30 flex justify-center gap-2 items-center"
              >
                <Wand2 size={16}/> Generate Pitch
              </button>
            ) : sent ? (
              <button disabled className="w-full btn-primary bg-green-500 hover:bg-green-600 text-white flex justify-center gap-2 items-center">
                <CheckCircle2 size={16}/> Sent Successfully
              </button>
            ) : (
              <>
                <button 
                  onClick={handleGenerate}
                  className="flex-1 btn-ghost border border-white/10 hover:border-white/30 flex justify-center gap-2 items-center text-xs"
                >
                  <Wand2 size={14}/> Regenerate
                </button>
                <button 
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 btn-primary flex justify-center gap-2 items-center"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Send size={16}/> Send Pitch</>}
                </button>
              </>
            )}
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
