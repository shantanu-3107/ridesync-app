import React from 'react';
import { ArrowUpRight, MessageSquareText, Compass, Plus, User, Info } from 'lucide-react';
import { LiveClock } from './LiveClock';

interface NavbarProps {
  activeTab: 'browse' | 'negotiations';
  setActiveTab: (tab: 'browse' | 'negotiations') => void;
  onOpenPostRide: () => void;
  onOpenProfile: () => void;
  pendingOffersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPostRide,
  onOpenProfile,
  pendingOffersCount,
}) => {
  return (
    <>
      {/* Top Floating Navbar (Desktop & Mobile) */}
      <nav className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-8 lg:px-16 pointer-events-none">
        {/* Left button: Opens User Profile, Settings, Past Rides & Income */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <button 
            onClick={onOpenProfile}
            title="Account, Profile, Themes & Income"
            className="liquid-glass h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 hover:border-white/30 transition-all group shadow-xl"
          >
            <span className="font-heading italic text-xl sm:text-2xl text-white group-hover:scale-110 transition-transform">r</span>
          </button>

          {/* Live Clock Widget */}
          <LiveClock />
        </div>

        {/* Center Pill Navbar (Desktop) */}
        <div className="liquid-glass rounded-full px-2 py-1.5 hidden md:flex items-center gap-1 pointer-events-auto shadow-2xl">
          <button
            onClick={() => {
              setActiveTab('browse');
              const el = document.getElementById('rides-feed');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full font-body transition-colors ${
              activeTab === 'browse'
                ? 'bg-white/15 text-white font-semibold'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Explore Rides
          </button>

          <button
            onClick={() => {
              setActiveTab('browse');
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full text-white/80 hover:text-white font-body transition-colors"
          >
            How it Works
          </button>

          <button
            onClick={() => setActiveTab('negotiations')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full font-body transition-colors flex items-center gap-1.5 ${
              activeTab === 'negotiations'
                ? 'bg-white/15 text-white font-semibold'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Offers & Chats</span>
            {pendingOffersCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-400 text-black animate-pulse">
                {pendingOffersCount}
              </span>
            )}
          </button>
        </div>

        {/* Right CTA Button: Offer a Lift */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onOpenPostRide}
            className="liquid-glass-strong rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-all cursor-pointer group shadow-lg"
          >
            <span>Offer a Lift</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Dock (Visible only on < md screens) */}
      <div className="fixed bottom-3 left-3 right-3 z-50 md:hidden pointer-events-auto">
        <div className="liquid-glass-strong rounded-2xl px-2 py-2 flex items-center justify-around border border-white/20 shadow-2xl backdrop-blur-2xl">
          <button
            onClick={() => {
              setActiveTab('browse');
              const el = document.getElementById('rides-feed');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium transition-all ${
              activeTab === 'browse' ? 'text-white font-bold bg-white/15' : 'text-white/60 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('browse');
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium text-white/60 hover:text-white transition-all"
          >
            <Info className="w-4 h-4" />
            <span>Guide</span>
          </button>

          <button
            onClick={onOpenPostRide}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium text-white bg-white/10 hover:bg-white/20 transition-all"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Post</span>
          </button>

          <button
            onClick={() => setActiveTab('negotiations')}
            className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium transition-all ${
              activeTab === 'negotiations' ? 'text-white font-bold bg-white/15' : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageSquareText className="w-4 h-4 text-indigo-300" />
            <span>Chats</span>
            {pendingOffersCount > 0 && (
              <span className="absolute -top-1 right-2 px-1 text-[9px] font-bold rounded-full bg-emerald-400 text-black animate-pulse">
                {pendingOffersCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProfile}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium text-white/60 hover:text-white transition-all"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};
