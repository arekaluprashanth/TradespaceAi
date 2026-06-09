import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, LogOut, Settings, User, Sun, Moon, Hexagon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { useMarketStore } from '../../stores/marketStore';
import AssetModal from '../trading/AssetModal';
import ChatBot from '../ui/ChatBot';

const NAV_LINKS = [
  { path: '/', label: 'Explore' },
  { path: '/portfolio', label: 'Investments' },
  { path: '/watchlist', label: 'Watchlist' },
  { path: '/analytics', label: 'Analytics' },
];

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, theme, toggleTheme } = useUiStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const assets = useMarketStore((state) => state.assets);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, assets]);

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TR';

  return (
    <header className="sticky top-0 z-40 bg-dark-900 border-b border-white/5 flex flex-col">
      {/* Top Row: Logo, Search, User Icons */}
      <div className="flex items-center justify-between h-16 px-4 lg:px-8 max-w-7xl mx-auto w-full gap-4 lg:gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <motion.img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="Logo" 
            className="w-9 h-9 rounded-full object-cover drop-shadow-lg ring-1 ring-white/10" 
            onError={(e) => { e.currentTarget.style.display='none' }}
            animate={{ 
              y: [0, -3, 0],
              scale: [1, 1.03, 1],
              filter: [
                'drop-shadow(0px 0px 0px rgba(0,208,156,0))',
                'drop-shadow(0px 4px 8px rgba(0,208,156,0.3))',
                'drop-shadow(0px 0px 0px rgba(0,208,156,0))'
              ]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <span className="text-lg font-bold text-white hidden sm:block tracking-tight">TradeOxx Ai</span>
        </Link>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-xl relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredAssets.length > 0) {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
                setSelectedAsset(filteredAssets[0]);
                setShowSearchResults(false);
              }
            }}
            placeholder="Search stocks, crypto, mutual funds..."
            className="w-full pl-11 pr-4 py-2.5 bg-dark-800 rounded-full border border-white/5 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent-cyan/50 focus:bg-dark-700 transition-all shadow-inner"
          />
          
          {/* Search Dropdown */}
          <AnimatePresence>
            {showSearchResults && searchQuery.trim() && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                      <div
                        key={asset.symbol}
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between border-b border-white/5 last:border-none transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-dark-700 border border-white/5 flex items-center justify-center text-xs font-bold text-accent-cyan">
                            {asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                            <p className="text-xs text-dark-400">{asset.name}</p>
                          </div>
                        </div>
                        <p className="text-sm font-mono text-white font-medium">${asset.price.toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-dark-400">
                      No matching assets found for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <ChatBot />

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-dark-800 text-dark-200 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-full hover:bg-dark-800 text-dark-200 hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      <span className="text-xs text-accent-cyan cursor-pointer hover:underline">Mark all read</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications?.length > 0 ? (
                        notifications.map((n: any, i: number) => (
                          <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <p className="text-sm text-white font-medium">{n.title || 'Alert'}</p>
                            <p className="text-xs text-dark-300 mt-1">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-dark-400 text-sm">No new notifications</div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pr-2 rounded-full border border-transparent hover:border-white/10 hover:bg-dark-800 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan text-sm font-bold">
                {initials}
              </div>
              <ChevronDown size={16} className="text-dark-300 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-dark-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 p-2"
                  >
                    <div className="px-3 py-3 border-b border-white/5 mb-2">
                      <p className="text-sm font-bold text-white">{user?.name || 'Trader'}</p>
                      <p className="text-xs text-dark-400 mt-0.5">{user?.email || 'trader@tradeoxx.ai'}</p>
                    </div>
                    <button 
                      onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors"
                    >
                      <User size={16} /> Profile
                    </button>
                    <button 
                      onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </button>
                    <div className="h-px bg-white/5 my-2" />
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-accent-red hover:bg-accent-red/10 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Tabs */}
      <div className="px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <nav className="flex gap-6 overflow-x-auto no-scrollbar py-2">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <motion.div
                key={link.path}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.path}
                  className={`relative py-2 px-2 text-sm font-medium transition-colors whitespace-nowrap outline-none ${
                    isActive ? 'text-accent-cyan font-bold' : 'text-dark-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <AssetModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
      />
    </header>
  );
}
