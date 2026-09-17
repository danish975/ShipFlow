import React from 'react';
import { Cpu, Eye, Zap, ShieldCheck } from 'lucide-react';

const TrustStrip: React.FC = () => {
  return (
    <section className="border-y border-white/5 bg-slate-900/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">
          Built for modern logistics operations
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12 text-center opacity-80">
          <div className="flex flex-col items-center gap-2">
            <Cpu className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">Automated Workflows</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <Eye className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">Real-Time Visibility</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <Zap className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">Event-Driven Processing</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">Operational Intelligence</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
