"use client";
import { useState } from "react";
import { DeveloperCard } from "@/components/developers/DeveloperCard";
import { DeveloperProfile as ProfileType } from "@/types";

// Mock data for the UI
const MOCK_PROFILES: (ProfileType & { status: string })[] = [
  {
    id: "1",
    user_id: "u1",
    github_username: "avinassh",
    github_id: "1",
    bio: "Python hacker and open source contributor.",
    location: "Bengaluru, India",
    city: "Bengaluru",
    followers: 2450,
    total_stars: 4500,
    top_languages: ["Python", "Go"],
    top_repos: [],
    last_synced_at: new Date().toISOString(),
    status: "Shortlisted"
  },
  {
    id: "2",
    user_id: "u2",
    github_username: "MattIPv4",
    github_id: "2",
    bio: "Building cool things.",
    location: "Mumbai, India",
    city: "Mumbai",
    followers: 1200,
    total_stars: 8000,
    top_languages: ["TypeScript", "JavaScript", "Rust"],
    top_repos: [],
    last_synced_at: new Date().toISOString(),
    status: "Interviewing"
  }
];

const COLUMNS = ["Shortlisted", "Interviewing", "Offered", "Rejected"];

export default function ShortlistsPage() {
  const [items, setItems] = useState(MOCK_PROFILES);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setItems((prev) => 
      prev.map((item) => item.id === id ? { ...item, status } : item)
    );
  };

  return (
    <div className="p-6 lg:p-10 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Shortlists</h1>
        <p className="text-white/50">Manage your candidate pipeline.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div 
            key={col} 
            className="w-80 shrink-0 flex flex-col bg-[#111110] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
          >
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] bg-[#0a0a08] flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-widest text-white/70">{col}</h2>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">
                {items.filter(i => i.status === col).length}
              </span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {items.filter(i => i.status === col).map(profile => (
                <div 
                  key={profile.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, profile.id)}
                  className="cursor-move opacity-90 transition-opacity hover:opacity-100"
                >
                  {/* Reuse the DeveloperCard but make it a bit more compact if needed. Using as is for demo. */}
                  <DeveloperCard profile={profile} onView={() => {}} />
                </div>
              ))}
              {items.filter(i => i.status === col).length === 0 && (
                <div className="text-center py-10 border border-white/5 border-dashed rounded-lg">
                   <p className="text-xs text-white/40">Drop candidates here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
