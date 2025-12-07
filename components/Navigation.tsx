import React from 'react';
import { Tab } from '../types';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> 
    },
    { 
      id: 'itinerary', 
      label: 'Itinerary', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> 
    },
    { 
      id: 'weather', 
      label: 'Weather', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /> 
    },
    { 
      id: 'map', 
      label: 'Map', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /> 
    },
  ];

  return (
    <nav className="bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#D7CCC8] fixed bottom-0 left-0 right-0 z-50 safe-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-full p-2 rounded-lg transition-all duration-300 ${
              currentTab === item.id 
                ? 'text-[#3E2723] bg-[#EFEBE9]' 
                : 'text-[#8D6E63] hover:text-[#5D4037]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-1 transition-transform ${currentTab === item.id ? 'transform scale-105 stroke-2' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {item.icon}
            </svg>
            <span className="text-[10px] font-semibold tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;