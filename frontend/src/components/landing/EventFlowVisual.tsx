import React from 'react';

const EventFlowVisual: React.FC = () => {
  return (
    <section className="py-24 bg-slate-900 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Built to Handle Every Shipment Event</h2>
          <p className="text-lg text-slate-400">
            ShipFlow uses event-driven processing to connect shipment operations, notifications, and analytics through asynchronous workflows.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto h-[400px] flex items-center justify-center">
          {/* Base structure */}
          <div className="absolute inset-0 bg-slate-950 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-center items-center p-8">
            
            <div className="w-full flex justify-between items-center relative z-10 mb-16">
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 font-mono border border-slate-700 shadow-lg">Shipment Created</div>
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 font-mono border border-slate-700 shadow-lg">Status Updated</div>
            </div>

            {/* RabbitMQ Central Hub */}
            <div className="relative z-20 px-8 py-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center group">
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-orange-400 font-bold tracking-widest text-lg flex items-center gap-3">
                <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>
                RabbitMQ Event Bus
              </div>
            </div>

            <div className="w-full flex justify-between items-center relative z-10 mt-16 px-12">
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-blue-400 font-mono border border-blue-500/20 shadow-lg flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Assignment
              </div>
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-rose-400 font-mono border border-rose-500/20 shadow-lg flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Exception
              </div>
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-cyan-400 font-mono border border-cyan-500/20 shadow-lg flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                Analytics
              </div>
            </div>

            {/* Animated SVG Lines (Background) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' }}>
              {/* Down to RabbitMQ */}
              <path d="M 150 100 L 350 180" stroke="#334155" strokeWidth="2" fill="none" />
              <path d="M 150 100 L 350 180" stroke="#F97316" strokeWidth="2" strokeDasharray="5 15" className="animate-dash" fill="none" />
              
              <path d="M 750 100 L 550 180" stroke="#334155" strokeWidth="2" fill="none" />
              <path d="M 750 100 L 550 180" stroke="#F97316" strokeWidth="2" strokeDasharray="5 15" className="animate-dash" fill="none" />

              {/* RabbitMQ down to Consumers */}
              <path d="M 450 240 L 250 320" stroke="#334155" strokeWidth="2" fill="none" />
              <path d="M 450 240 L 250 320" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5 15" className="animate-dash" fill="none" />
              
              <path d="M 450 240 L 450 320" stroke="#334155" strokeWidth="2" fill="none" />
              <path d="M 450 240 L 450 320" stroke="#F43F5E" strokeWidth="2" strokeDasharray="5 15" className="animate-dash" fill="none" />
              
              <path d="M 450 240 L 650 320" stroke="#334155" strokeWidth="2" fill="none" />
              <path d="M 450 240 L 650 320" stroke="#06B6D4" strokeWidth="2" strokeDasharray="5 15" className="animate-dash" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventFlowVisual;
