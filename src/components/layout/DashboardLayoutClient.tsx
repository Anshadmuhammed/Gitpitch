"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] w-14 h-14 bg-[#c8f060] text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Backdrop on Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-[#0a0a08] border-r border-white/10
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onNavClick={() => setIsSidebarOpen(false)} />
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#0a0a08] w-full">
        {children}
      </main>
    </div>
  );
}
