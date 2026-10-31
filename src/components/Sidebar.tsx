import React from 'react';
import { Home, Search, MapPin, Image as ImageIcon, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  activeItem?: string;
  onSelectItem?: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'Home', onSelectItem }) => {
  const menuItems = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Detect Debris', label: 'Detect Debris', icon: Search },
    { id: 'Geo Map', label: 'Geo Map', icon: MapPin },
    { id: 'Gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 bg-[#04162e] border-r border-[#0e2a4f] flex flex-col justify-between min-h-[calc(100vh-61px)] relative overflow-hidden select-none">
      {/* Full Vertical Background Artwork */}
      <div 
        className="absolute inset-0 bg-cover bg-bottom opacity-90 pointer-events-none"
        style={{ backgroundImage: `url('/assets/sidebar-ocean-clean.jpg?v=2')` }}
      />
      
      {/* Vertical Gradient: Darker at top for navigation readability, vibrant ocean depths below */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#04162e] via-[#04162e]/55 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04162e]/40 via-transparent to-transparent pointer-events-none" />

      {/* Ambient Rising Air Bubbles */}
      <div className="absolute bottom-16 left-6 w-1.5 h-1.5 rounded-full bg-white/50 animate-float-slow pointer-events-none" />
      <div className="absolute bottom-28 right-8 w-2 h-2 rounded-full bg-white/40 animate-float-fast pointer-events-none" />
      <div className="absolute bottom-44 left-12 w-1 h-1 rounded-full bg-white/60 animate-float-slow pointer-events-none" />
      <div className="absolute top-1/2 right-12 w-1.5 h-1.5 rounded-full bg-white/40 animate-float-slow pointer-events-none" />

      {/* Top Menu Links */}
      <div className="p-3 space-y-1 z-10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectItem && onSelectItem(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 backdrop-blur-xs ${
                isActive
                  ? 'bg-[#1a73e8] text-white shadow-md shadow-blue-600/40'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sky-300'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom spacer to keep balanced layout */}
      <div className="relative z-10 w-full h-12" />
    </aside>
  );
};
