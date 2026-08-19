import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  Video,
  FileText,
  FileCheck2,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Chatbot', path: '/chat', icon: MessageSquareText },
  { name: 'Interview Simulator', path: '/interviews', icon: Video },
  { name: 'PDF RAG Learning', path: '/pdf-study', icon: FileText },
  { name: 'AI Resume Builder', path: '/resume-builder', icon: Sparkles },
  { name: 'ATS Checker', path: '/ats-checker', icon: FileCheck2 },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-[#e6eeff] flex flex-col justify-between py-6 px-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 pb-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[#767586]">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#4648d4] text-white shadow-sm font-semibold'
                    : 'text-[#464554] hover:bg-[#e6eeff] hover:text-[#121c2a]'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[#e6eeff]/60 border border-[#c7c4d7]/40 text-xs text-[#464554] space-y-2">
        <div className="font-semibold text-[#121c2a] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#4648d4]" /> AI Assistant Ready
        </div>
        <p className="leading-relaxed">
          Need help preparing for campus placements? Talk to AI Chatbot anytime.
        </p>
      </div>
    </aside>
  );
};
