import React from 'react';
import { PackagePlus, UserCheck, Activity, AlertOctagon, CheckSquare } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    { num: "01", title: "Create Shipment", desc: "Create and validate shipment details.", icon: <PackagePlus className="w-5 h-5" /> },
    { num: "02", title: "Smart Assignment", desc: "Automatically assign a suitable delivery partner.", icon: <UserCheck className="w-5 h-5" /> },
    { num: "03", title: "Track in Real Time", desc: "Monitor shipment progress through live updates.", icon: <Activity className="w-5 h-5" /> },
    { num: "04", title: "Resolve Exceptions", desc: "Identify and manage delivery issues.", icon: <AlertOctagon className="w-5 h-5" /> },
    { num: "05", title: "Complete Delivery", desc: "Confirm delivery and record proof of delivery.", icon: <CheckSquare className="w-5 h-5" /> },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">From Creation to Successful Delivery</h2>
          <p className="text-lg text-slate-400">
            A standardized, automated workflow ensuring reliability at every step.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-slate-800">
            <div className="h-full bg-blue-500 w-full opacity-50" style={{ background: 'linear-gradient(90deg, #3B82F6 0%, transparent 100%)', animation: 'pulse 3s infinite' }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center lg:items-start group">
                
                {/* Connecting line (mobile) */}
                {index !== steps.length - 1 && (
                  <div className="lg:hidden absolute top-12 bottom-[-2rem] left-6 w-0.5 bg-slate-800 -z-10" />
                )}

                <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-slate-700 group-hover:border-blue-500 text-slate-400 group-hover:text-blue-400 flex items-center justify-center font-bold text-lg mb-6 transition-colors relative z-10">
                  {step.icon}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 text-center lg:text-left">{step.num} — {step.title}</h3>
                <p className="text-sm text-slate-400 text-center lg:text-left">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
