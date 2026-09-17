import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dashboardRoute = user?.role === UserRole.ADMIN ? '/admin' : user?.role === UserRole.AGENT ? '/agent' : '/dashboard';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ShipFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How It Works</a>
            <a href="#platform" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Platform</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link to={dashboardRoute} className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all border border-white/5">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-white/10 py-4 px-4 shadow-xl">
          <div className="flex flex-col gap-4">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white">Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white">How It Works</a>
            <a href="#platform" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white">Platform</a>
            <hr className="border-white/10" />
            {isAuthenticated ? (
              <Link to={dashboardRoute} className="text-sm font-medium text-center text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg">
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="text-sm font-medium text-center text-slate-300 hover:text-white py-2">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-medium text-center bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
