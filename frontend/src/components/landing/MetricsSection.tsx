import React from 'react';

const MetricsSection: React.FC = () => {
  return (
    <section className="py-16 bg-slate-800 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">Automated</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Shipment Workflows</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">Real-Time</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Status Updates</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">Role-Based</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Operations</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">Event-Driven</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Processing</div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
