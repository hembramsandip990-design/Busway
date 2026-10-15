import React from 'react';
import { Home, Calendar, CreditCard, HelpCircle, User } from 'lucide-react';

export type TabKey = 'home' | 'bookings' | 'passes' | 'support' | 'profile';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'home' as TabKey, label: 'Home', icon: Home },
    { key: 'bookings' as TabKey, label: 'Bookings', icon: Calendar },
    { key: 'passes' as TabKey, label: 'Passes', icon: CreditCard },
    { key: 'support' as TabKey, label: 'Support', icon: HelpCircle },
    { key: 'profile' as TabKey, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1c2d]/98 backdrop-blur-lg border-t border-[#1b344e] pb-safe select-none">
      <div className="max-w-xl mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? 'text-[#F28C28]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'group-hover:scale-105 stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'font-bold text-[#F28C28]' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
