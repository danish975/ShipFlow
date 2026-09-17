import React, { useState } from 'react';
import { Map, Users, AlertCircle, BarChart3, ChevronRight, Clock } from 'lucide-react';

const PlatformShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tracking');

  const tabs = [
    { id: 'tracking', label: 'Shipment Tracking', icon: <Map className="w-4 h-4" /> },
    { id: 'assignment', label: 'Smart Assignment', icon: <Users className="w-4 h-4" /> },
    { id: 'exceptions', label: 'Exception Center', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <section id="platform" className="py-24 bg-slate-900 border-y border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">One Platform. Complete Operational Visibility.</h2>
          <p className="text-lg text-slate-400">
            A unified interface to monitor, manage, and optimize your entire logistics network.
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
          
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-64 bg-slate-800/50 border-r border-white/5 flex flex-row lg:flex-col p-4 gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 lg:p-10 relative">
            <div className="absolute top-4 right-4 px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-slate-400 uppercase tracking-widest border border-slate-700">Demo Data</div>
            
            {activeTab === 'tracking' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Map className="w-5 h-5 text-blue-400" /> Active Shipments Tracking</h3>
                <div className="bg-slate-800 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-mono text-blue-400 mb-1">SHP-1025</div>
                    <div className="font-medium text-slate-200">Express Delivery to Downtown</div>
                  </div>
                  <div className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium">
                    Out for Delivery
                  </div>
                </div>
                
                <div className="ml-4 pl-4 border-l border-slate-700 space-y-6 relative py-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <p className="text-sm text-slate-200">Driver reached sorting facility</p>
                    <p className="text-xs text-slate-500">10 mins ago</p>
                  </div>
                  <div className="relative opacity-60">
                    <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <p className="text-sm text-slate-200">Shipment picked up</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignment' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> Smart Assignment Queue</h3>
                
                <div className="space-y-3">
                  {[
                    { name: 'Alex M.', zone: 'North District', load: '3/10', score: 98 },
                    { name: 'Sarah J.', zone: 'Downtown', load: '8/10', score: 75 },
                    { name: 'David K.', zone: 'Westside', load: '1/10', score: 92 },
                  ].map((driver, i) => (
                    <div key={i} className="bg-slate-800 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-slate-300">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200 text-sm">{driver.name}</div>
                          <div className="text-xs text-slate-500">Zone: {driver.zone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center hidden sm:block">
                          <div className="text-slate-400 text-xs mb-0.5">Workload</div>
                          <div className="text-slate-200 font-medium">{driver.load}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-xs mb-0.5">Match Score</div>
                          <div className="text-green-400 font-medium">{driver.score}%</div>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-colors text-xs font-medium">
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'exceptions' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-rose-400" /> Active Exceptions</h3>
                
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-rose-200">Failed Delivery Attempt</div>
                      <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-medium">High Severity</span>
                    </div>
                    <p className="text-sm text-rose-200/70 mb-3">Customer unavailable. Action required to schedule re-attempt for SHP-1028.</p>
                    <button className="text-xs px-3 py-1.5 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors">
                      Resolve Issue
                    </button>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex items-start gap-4 opacity-80">
                  <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-amber-200">SLA At Risk</div>
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-medium">Medium</span>
                    </div>
                    <p className="text-sm text-amber-200/70">SHP-1040 is nearing its 48h delivery SLA target.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-400" /> Operational Overview</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800 border border-white/5 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">On-Time Delivery Rate</div>
                    <div className="text-2xl font-bold text-white mb-1">98.4%</div>
                    <div className="text-xs text-green-400 flex items-center gap-1">+1.2% this week</div>
                  </div>
                  <div className="bg-slate-800 border border-white/5 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">Active Shipments</div>
                    <div className="text-2xl font-bold text-white mb-1">1,248</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">Across 12 zones</div>
                  </div>
                </div>

                <div className="h-32 bg-slate-800/50 rounded-xl border border-white/5 flex items-end px-4 gap-2 pt-8 pb-2">
                  {/* Fake bar chart */}
                  {[40, 65, 45, 80, 55, 90, 75, 100, 85, 60].map((height, i) => (
                    <div key={i} className="flex-1 bg-blue-500/40 hover:bg-blue-500 transition-colors rounded-t-sm" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default PlatformShowcase;
