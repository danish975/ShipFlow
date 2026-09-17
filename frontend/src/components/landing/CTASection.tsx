import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-slate-950">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-t-full blur-[100px] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
          Ready to Move Logistics Forward?
        </h2>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Bring shipment automation, real-time visibility, and smarter operations into one platform.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 text-lg">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#platform" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-[#1A263D] text-white border border-white/10 rounded-xl font-semibold transition-all flex items-center justify-center text-lg">
            Explore Platform
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
