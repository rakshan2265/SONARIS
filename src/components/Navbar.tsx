import React from 'react';
import { User } from 'lucide-react';
import { SonarisLogo } from './Icons';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'Home', onTabChange }) => {
  const navItems = ['Home', 'Detect', 'Geo Map', 'Gallery', 'About', 'Contact'];

  return (
    <header className="w-full bg-[#04162e] border-b border-[#0f2d54] text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-md relative z-30">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3.5">
        <SonarisLogo className="w-10 h-10 shadow-lg shadow-sky-500/30" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white font-sans">SONARIS</span>
          </div>
          <p className="text-[11px] text-sky-200/80 tracking-wide font-normal">
            Cleaner Oceans &nbsp;&bull;&nbsp; Safer Marine Life &nbsp;&bull;&nbsp; A Sustainable Future
          </p>
        </div>
      </div>

      {/* Navigation Links & User Avatar */}
      <div className="flex items-center gap-1 sm:gap-4">
        <nav className="flex items-center gap-1 sm:gap-2 mr-2">
          {navItems.map((item) => {
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                onClick={() => onTabChange && onTabChange(item)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1a73e8] text-white shadow-md shadow-blue-500/25 hover:bg-[#1557b0]'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* User profile avatar */}
        <button 
          aria-label="User profile"
          className="w-9 h-9 rounded-full bg-[#1a73e8] flex items-center justify-center text-white ring-2 ring-sky-400/40 hover:ring-sky-300 transition-all shadow-inner"
        >
          <User className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
};
