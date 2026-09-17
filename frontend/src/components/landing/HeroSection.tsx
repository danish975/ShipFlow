import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, MapPin, Truck, CheckCircle2 } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left: Content */}
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              THE FUTURE OF LOGISTICS OPERATIONS
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Move Smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Deliver Faster.</span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-2 font-medium">
              Every shipment. One intelligent flow.
            </p>
            
            <p className="text-lg text-slate-500 mb-8 max-w-xl leading-relaxed">
              ShipFlow brings shipment automation, real-time tracking, and operational intelligence together in one powerful logistics platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <a href="#platform" className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Explore Platform
              </a>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
              <button className="flex items-center gap-2 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                  <Play className="w-3.5 h-3.5 ml-0.5 text-blue-400" />
                </div>
                View Live Demo
              </button>
            </div>
          </div>

          {/* Right: Interactive Visualization */}
          <div className="relative animate-slide-up-delay-1 hidden lg:block h-[500px] w-full perspective-1000">
            <div className="absolute inset-0 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-float">
              
              {/* Map background grid */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              {/* Animated Routes (SVG) */}
              <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }}>
                <path d="M 100 350 Q 250 200 400 150" fill="none" stroke="#1E293B" strokeWidth="3" />
                <path d="M 100 350 Q 250 200 400 150" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray="10 10" className="animate-dash" />
                
                <path d="M 200 100 Q 300 300 450 400" fill="none" stroke="#1E293B" strokeWidth="3" />
                <path d="M 200 100 Q 300 300 450 400" fill="none" stroke="#22D3EE" strokeWidth="3" strokeDasharray="10 10" className="animate-dash" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
              </svg>

              {/* Markers & Cards */}
              
              {/* Marker 1 - In Transit */}
              <div className="absolute top-[130px] left-[380px] group cursor-pointer">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse-glow" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 border border-blue-500/30 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-slate-300">SHP-1024</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 rounded">In Transit</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1"><Truck className="w-3 h-3" /> Driver: Alex M.</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> Zone: North District</div>
                </div>
              </div>

              {/* Marker 2 - Delivered */}
              <div className="absolute top-[90px] left-[190px] group cursor-pointer">
                <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 border border-emerald-500/30 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-slate-300">SHP-1026</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded">Delivered</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Signed by: J. Doe</div>
                </div>
              </div>

              {/* Status Feed overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur border border-white/5 rounded-xl p-3 shadow-lg">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Live Activity
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="text-blue-400 font-mono text-xs">SHP-1025</span>
                    <span className="truncate">Out for delivery in Downtown</span>
                  </div>
                  <div className="text-sm text-slate-300 flex items-center gap-2 opacity-60">
                    <span className="text-emerald-400 font-mono text-xs">SHP-1026</span>
                    <span className="truncate">Delivery confirmed successfully</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
