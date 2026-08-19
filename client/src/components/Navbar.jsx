import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Sparkles, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { currentUser, logout, profileData } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userEmail = currentUser?.email || 'student@careerai.app';
  const initial = (currentUser?.displayName || userEmail).charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#e6eeff] sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-xl text-[#121c2a] tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-[#4648d4] text-white flex items-center justify-center font-black text-base shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span>Career<span className="text-[#4648d4]">AI</span></span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg text-[#767586] hover:text-[#121c2a] hover:bg-[#e6eeff] transition"
          title="Settings"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-6 w-[1px] bg-[#e6eeff]" />

        {/* Profile Avatar Button & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-1 rounded-full hover:ring-2 hover:ring-[#4648d4]/40 transition focus:outline-none"
            title="Account Profile"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-[#c7c4d7]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#e6eeff] text-[#4648d4] flex items-center justify-center font-bold text-sm shadow-sm">
                {initial}
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e6eeff] rounded-xl shadow-card p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-[#e6eeff]">
                <div className="text-xs text-[#767586] font-medium">Signed in as</div>
                <div className="text-xs font-bold text-[#121c2a] truncate mt-0.5">{userEmail}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#121c2a] hover:bg-[#f8f9ff] hover:text-[#4648d4] rounded-lg flex items-center gap-2 transition"
                >
                  <Settings className="w-4 h-4 text-[#767586]" /> Account Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg flex items-center gap-2 transition mt-1"
                >
                  <LogOut className="w-4 h-4 text-[#ba1a1a]" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
