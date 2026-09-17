import React from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ShipFlow</span>
            </Link>
            <p className="text-slate-400 mb-6 max-w-xs">
              Move Smarter. Deliver Faster. The event-driven logistics platform for modern operations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase mb-4 text-xs">Product</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#platform" className="text-slate-400 hover:text-white transition-colors">Platform</a></li>
              <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase mb-4 text-xs">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors cursor-default">About</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors cursor-default">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase mb-4 text-xs">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors cursor-default">Privacy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors cursor-default">Terms</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} ShipFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <span>Systems Normal</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
