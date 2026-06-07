import React from 'react';
import Link from 'next/link';
import { Home, PieChart, Activity, Settings, Bell, Search, User } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0b0e14] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#11151c] border-r border-white/5 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
              Tradespace<span className="text-white">AI</span>
            </h1>
          </div>
          <nav className="p-4 space-y-2">
            <NavItem href="/dashboard" icon={<Home className="w-5 h-5" />} label="Dashboard" active />
            <NavItem href="/dashboard/portfolio" icon={<PieChart className="w-5 h-5" />} label="Portfolio" />
            <NavItem href="/dashboard/markets" icon={<Activity className="w-5 h-5" />} label="Markets" />
          </nav>
        </div>
        <div className="p-4 border-t border-white/5">
          <NavItem href="/dashboard/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-[#11151c]/80 backdrop-blur-md border-b border-white/5 z-10">
          <div className="flex items-center bg-[#1a202c] rounded-full px-4 py-2 border border-white/5 focus-within:border-emerald-500/50 transition-colors w-96">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search stocks, options..." 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-white placeholder-gray-500"
            />
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#11151c]"></span>
            </button>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">Prashanth</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto z-10 p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}>
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
    </Link>
  );
}
