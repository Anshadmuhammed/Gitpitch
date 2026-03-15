"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export function SearchFilters({
  onFilterChange,
}: {
  onFilterChange: (filters: { languages: string[]; city: string; open_to_work: boolean }) => void;
}) {
  const [languages, setLanguages] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [openToWork, setOpenToWork] = useState(false);

  // Debounce apply
  useEffect(() => {
    const t = setTimeout(() => {
      onFilterChange({ languages, city, open_to_work: openToWork });
    }, 300);
    return () => clearTimeout(t);
  }, [languages, city, openToWork, onFilterChange]);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const popLangs = ["TypeScript", "Python", "Go", "Rust", "React", "Node"];

  return (
    <div className="w-72 bg-[#111110] border-r border-[rgba(255,255,255,0.08)] h-[calc(100vh-64px)] overflow-y-auto hidden lg:block p-6">
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Top Languages</h3>
        <div className="space-y-2">
          {popLangs.map((lang) => (
            <label key={lang} className="flex items-center gap-2 text-sm text-white/70 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={languages.includes(lang)}
                onChange={() => toggleLanguage(lang)}
                className="rounded border-white/20 bg-[#0a0a08] text-[#c8f060] focus:ring-[#c8f060]"
              />
              {lang}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">City</h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1.5 text-white/40" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Bengaluru"
            className="w-full bg-[#0a0a08] border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={openToWork}
            onChange={(e) => setOpenToWork(e.target.checked)}
             className="rounded border-white/20 bg-[#0a0a08] text-[#c8f060] focus:ring-[#c8f060]"
          />
          Open to work only
        </label>
      </div>
    </div>
  );
}
