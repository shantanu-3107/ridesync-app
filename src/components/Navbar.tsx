import React from 'react';
import { ArrowUpRight, MessageSquareText } from 'lucide-react';
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
    <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 lg:px-16 pointer-events-none">
      {/* Left button: Opens User Profile, Settings, Past Rides & Income */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
          onClick={onOpenProfile}
          title="Account, Profile, Themes & Income"
          className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 hover:border-white/30 transition-all group shadow-xl"
        >
          <span className="font-heading italic text-2xl text-white group-hover:scale-110 transition-transform">r</span>
        </button>

        {/* Live Clock Widget */}
        <LiveClock />
      </div>

      {/* Center Pill Navbar */}
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
          className="liquid-glass-strong rounded-full px-4 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-all cursor-pointer group"
        >
          <span>Offer a Lift</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </nav>
  );
};
