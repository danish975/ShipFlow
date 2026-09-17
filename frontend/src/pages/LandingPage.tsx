import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TrustStrip from '../components/landing/TrustStrip';
import FeaturesSection from '../components/landing/FeaturesSection';
import PlatformShowcase from '../components/landing/PlatformShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import EventFlowVisual from '../components/landing/EventFlowVisual';
import LiveActivityFeed from '../components/landing/LiveActivityFeed';
import MetricsSection from '../components/landing/MetricsSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <FeaturesSection />
        <PlatformShowcase />
        <HowItWorks />
        <EventFlowVisual />
        <LiveActivityFeed />
        <MetricsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
