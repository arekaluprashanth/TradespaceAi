import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/charts': 'Charts',
  '/portfolio': 'Portfolio',
  '/strategy': 'Strategy',
  '/analytics': 'Analytics',
  '/watchlist': 'Watchlist',
};

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { notifications } = useUiStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentPage = pageTitles[location.pathname] || 'Dashboard';
  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TS';

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-800/80 backdrop-blur-xl border-b border-white/5 flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-dark-200 hover:text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-2 text-sm">
        <span className="text-dark-400">TradeSphere</span>
        <span className="text-dark-500">/</span>
        <span className="text-white font-medium">{currentPage}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, strategies..."
            className="w-full pl-10 pr-4 py-2 bg-dark-700/50 rounded-xl border border-white/5 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-white/5 text-dark-200 hover:text-white transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-red rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="hidden md:block text-sm text-white font-medium">
              {user?.name || 'Trader'}
            </span>
            <ChevronDown size={14} className="hidden md:block text-dark-300" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-white/10 rounded-xl shadow-glass overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-medium text-white">{user?.name || 'Trader'}</p>
                    <p className="text-xs text-dark-300">{user?.email || 'trader@tradesphere.ai'}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-200 hover:bg-white/5 hover:text-white transition-colors">
                      <User size={14} />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-200 hover:bg-white/5 hover:text-white transition-colors">
                      <Settings size={14} />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-accent-red/10 transition-colors"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
