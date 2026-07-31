"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { UserButtonWrapper } from "@/components/auth/user-button-wrapper";
import { Search, Settings } from "lucide-react";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";

interface DashboardLayoutProps {
  children: ReactNode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateProjectClick: () => void;
}

export function DashboardLayout({ 
  children, 
  searchQuery, 
  onSearchChange,
  onCreateProjectClick 
}: DashboardLayoutProps) {
  const { openSettings } = useCanvasPreferences();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-accent-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-1/2 h-48 bg-accent-ai/3 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-state-success/3 blur-[80px] rounded-full pointer-events-none" />
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-ai flex items-center justify-center shadow-lg shadow-accent-primary/15 group-hover:shadow-accent-primary/25 transition-shadow duration-300">
              <span className="text-bg-base font-bold text-sm leading-none" style={{ fontFamily: "var(--font-geist-sans)" }}>N</span>
            </div>
            <span className="hidden sm:inline-block text-base font-semibold text-foreground tracking-tight">NullVoid<span className="text-accent-primary">.AI</span></span>
          </Link>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md w-full relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent-primary transition-colors duration-300" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 bg-card/40 border border-border/40 rounded-full pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all text-[10px]"
              >
                &times;
              </button>
            )}
          </div>
          
          {/* Actions & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={onCreateProjectClick}
              className="hidden sm:flex items-center gap-1.5 justify-center px-4 h-9 bg-gradient-to-b from-accent-primary to-accent-primary/85 text-primary-foreground text-sm font-medium rounded-lg shadow-[0_3px_0_0_rgba(0,0,0,0.25),0_0_15px_rgba(0,200,212,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:brightness-110 hover:shadow-[0_3px_0_0_rgba(0,0,0,0.25),0_0_25px_rgba(0,200,212,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] active:shadow-none active:translate-y-[2px] transition-all duration-150"
            >
              New Project
            </button>
            <div className="w-px h-6 bg-border/60 mx-1 hidden sm:block" />
            <button 
              onClick={openSettings}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-card/60 transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105"
            >
              <Settings className="w-5 h-5" />
            </button>
            <UserButtonWrapper />
          </div>
          
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* Mobile New Project Button (visible only on small screens) */}
        <div className="sm:hidden mb-6">
          <button 
            onClick={onCreateProjectClick}
            className="w-full flex items-center gap-1.5 justify-center px-4 h-10 bg-gradient-to-b from-accent-primary to-accent-primary/85 text-primary-foreground text-sm font-medium rounded-lg shadow-[0_3px_0_0_rgba(0,0,0,0.25),0_0_15px_rgba(0,200,212,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:brightness-110 active:shadow-none active:translate-y-[2px] transition-all duration-150"
          >
            New Project
          </button>
        </div>
        
        {children}
      </main>
    </div>
  );
}
