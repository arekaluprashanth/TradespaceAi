"use client";

import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Briefcase } from 'lucide-react';

const mockChartData = [
  { time: '09:30', price: 150.20 },
  { time: '10:00', price: 151.50 },
  { time: '10:30', price: 149.80 },
  { time: '11:00', price: 152.10 },
  { time: '11:30', price: 153.40 },
  { time: '12:00', price: 152.90 },
  { time: '12:30', price: 154.20 },
  { time: '13:00', price: 155.80 },
  { time: '13:30', price: 154.50 },
  { time: '14:00', price: 156.30 },
  { time: '14:30', price: 158.10 },
  { time: '15:00', price: 157.40 },
  { time: '15:30', price: 159.20 },
  { time: '16:00', price: 160.50 },
];

const mockWatchlist = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '173.50', change: '+1.2%', up: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: '210.45', change: '-2.4%', up: false },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '850.20', change: '+3.5%', up: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: '415.80', change: '+0.8%', up: true },
  { symbol: 'AMZN', name: 'Amazon.com', price: '175.30', change: '-0.5%', up: false },
  { symbol: 'META', name: 'Meta Platforms', price: '485.10', change: '+1.9%', up: true },
];

export default function DashboardPage() {
  const [activeRange, setActiveRange] = useState('1D');
  
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Main Column */}
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard 
            title="Total Balance" 
            value="$124,500.00" 
            change="+12.5%" 
            isPositive={true} 
            icon={<Wallet className="w-5 h-5 text-cyan-400" />} 
          />
          <SummaryCard 
            title="Today's Return" 
            value="$2,340.50" 
            change="+1.8%" 
            isPositive={true} 
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} 
          />
          <SummaryCard 
            title="Invested Amount" 
            value="$98,200.00" 
            change="Active" 
            isPositive={true} 
            icon={<Briefcase className="w-5 h-5 text-indigo-400" />} 
          />
        </div>

        {/* Chart Section */}
        <div className="bg-[#11151c]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl flex-1 min-h-[400px] flex flex-col relative overflow-hidden group">
          {/* Subtle glow effect behind chart */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Portfolio Performance</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  $12,450.00 (15.2%)
                </span>
                <span className="text-gray-500 text-sm">Past Year</span>
              </div>
            </div>
            
            <div className="flex space-x-1 bg-[#1a202c] p-1 rounded-lg border border-white/5">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeRange === range 
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full relative z-10 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#ffffff40" 
                  tick={{ fill: '#ffffff60', fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                  stroke="#ffffff40" 
                  tick={{ fill: '#ffffff60', fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$` + val}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#11151c', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.2)'
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  activeDot={{ r: 6, fill: '#11151c', stroke: '#10b981', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Watchlist */}
      <div className="w-full lg:w-80 flex flex-col space-y-6">
        <div className="bg-[#11151c]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-xl flex-1 min-h-[400px]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-white">Watchlist</h3>
            <button className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">See all</button>
          </div>
          
          <div className="space-y-4">
            {mockWatchlist.map((stock) => (
              <div key={stock.symbol} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                    {stock.symbol[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{stock.symbol}</div>
                    <div className="text-xs text-gray-500 truncate w-24">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">${stock.price}</div>
                  <div className={`text-xs flex items-center justify-end ${stock.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stock.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stock.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, change, isPositive, icon }: { title: string; value: string; change: string; isPositive: boolean; icon: React.ReactNode }) {
  return (
    <div className="bg-[#11151c]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-[20px] group-hover:bg-white/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
          {icon}
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium px-2.5 py-1 rounded-full ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
