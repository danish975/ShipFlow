import React from 'react';
import { Network, MapPin, Route, AlertTriangle, Clock, Zap } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Network className="w-6 h-6 text-blue-400" />,
      title: "Smart Shipment Automation",
      description: "Automate shipment workflows and reduce repetitive operational tasks from creation to delivery."
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-400" />,
      title: "Real-Time Tracking",
      description: "Track shipment progress and receive live status updates without refreshing via WebSockets."
    },
    {
      icon: <Route className="w-6 h-6 text-blue-400" />,
      title: "Intelligent Assignment",
      description: "Assign delivery partners using availability, service zones, workload, and shipment priority."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-blue-400" />,
      title: "Exception Management",
      description: "Identify failed deliveries, delayed shipments, and operational issues with actionable recovery workflows."
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      title: "Event-Driven Architecture",
      description: "Process shipment events asynchronously with reliable messaging and background workflows."
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-400" />,
      title: "SLA Monitoring",
      description: "Monitor delivery deadlines and surface shipments that need immediate operational attention."
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything You Need to Keep Logistics Moving</h2>
          <p className="text-lg text-slate-400">
            From shipment creation to final delivery, ShipFlow connects every operational step into a single seamless platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group relative bg-slate-800 border border-white/5 p-6 rounded-2xl hover:bg-slate-700 transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] hover:-translate-y-1">
              {/* Top gradient border on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-slate-200 mb-3 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
