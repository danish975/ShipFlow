import React, { useState, useEffect } from 'react';
import { Truck, AlertTriangle, CheckCircle2, UserCheck, Clock } from 'lucide-react';

const mockEvents = [
  { id: 1, type: 'assignment', text: 'Shipment SHP-1024 assigned to Driver A.', time: 'Just now', icon: <UserCheck className="w-4 h-4 text-blue-400" />, color: 'border-blue-500/20 bg-blue-500/5' },
  { id: 2, type: 'transit', text: 'Shipment SHP-1025 picked up.', time: '2m ago', icon: <Truck className="w-4 h-4 text-cyan-400" />, color: 'border-cyan-500/20 bg-cyan-500/5' },
  { id: 3, type: 'delivered', text: 'Shipment SHP-1026 delivered successfully.', time: '5m ago', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, color: 'border-emerald-500/20 bg-emerald-500/5' },
  { id: 4, type: 'sla', text: 'Shipment SHP-1027 flagged for SLA risk.', time: '12m ago', icon: <Clock className="w-4 h-4 text-amber-400" />, color: 'border-amber-500/20 bg-amber-500/5' },
  { id: 5, type: 'exception', text: 'Delivery reattempt scheduled for SHP-1028.', time: '18m ago', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, color: 'border-rose-500/20 bg-rose-500/5' },
];

const LiveActivityFeed: React.FC = () => {
  const [events, setEvents] = useState(mockEvents);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      const newEvent = { ...mockEvents[Math.floor(Math.random() * mockEvents.length)], id: Date.now(), time: 'Just now' };
      setEvents(prev => [newEvent, ...prev.slice(0, 4)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Stay Ahead of Every Shipment</h2>
            <p className="text-slate-400 text-sm">Simulated real-time logistics activity stream</p>
          </div>
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="text-xs px-3 py-1.5 bg-slate-800 border border-white/10 rounded hover:bg-white/5 transition-colors text-slate-300"
          >
            {isPaused ? 'Resume Feed' : 'Pause Feed'}
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden h-[400px]">
          {/* Gradient mask for fading out bottom items */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D1424] to-transparent z-10 pointer-events-none" />
          
          <div className="space-y-4">
            {events.map((event) => (
              <div 
                key={event.id} 
                className={`flex gap-4 p-4 rounded-xl border ${event.color} animate-slide-up bg-opacity-50 backdrop-blur-sm`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/5">
                  {event.icon}
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 text-sm font-medium">{event.text}</p>
                  <span className="text-xs text-slate-500 mt-1 block">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveActivityFeed;
