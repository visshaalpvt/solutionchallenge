import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  Users, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  Activity,
  Heart,
  MessageSquare,
  Globe
} from 'lucide-react';
import Button from '../components/ui/Button';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SmartAlloc</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#impact" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Impact</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors">Log in</Link>
            <Link to="/login">
              <Button variant="primary" className="rounded-full px-6 shadow-md shadow-indigo-100">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="flex-1 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">AI-Powered Platform</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6"
            >
              Smarter Volunteer Coordination for <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Real-World Impact
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Connect community needs with the right volunteers instantly using our Gemini AI-driven prioritization system. Built for NGOs and modern communities.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/login">
                <Button variant="primary" size="lg" className="rounded-full px-8 py-6 text-lg group shadow-xl shadow-indigo-100">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="rounded-full px-8 py-6 text-lg border-slate-200">
                View Demo
              </Button>
            </motion.div>
          </motion.div>

          <div className="flex-1 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative z-10"
            >
              {/* Floating Cards Mockup */}
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-50 rounded-full blur-3xl opacity-60" />
                
                {/* Card 1: Critical Need */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-0 w-64 p-4 rounded-2xl bg-white shadow-2xl border border-slate-100 z-30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Critical Need</p>
                      <p className="text-[10px] text-slate-500">2 minutes ago</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Emergency medical supplies needed in Zone B.</p>
                </motion.div>

                {/* Card 2: Volunteer Assigned */}
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-1/3 -left-8 w-60 p-4 rounded-2xl bg-white shadow-2xl border border-slate-100 z-20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Volunteer Matched</p>
                      <p className="text-[10px] text-slate-500">Skill: Medical Assist</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, delay: 1.5 }}
                      className="h-full bg-emerald-500" 
                    />
                  </div>
                </motion.div>

                {/* Card 3: Task Map */}
                <motion.div 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-4 right-4 w-72 h-48 rounded-2xl bg-slate-100 shadow-2xl border-4 border-white overflow-hidden z-10"
                >
                  <div className="absolute inset-0 bg-indigo-50 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-indigo-200 animate-bounce" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-white/90 backdrop-blur rounded-lg flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-800 tracking-tight">Active Coverage</p>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      <div className="w-1 h-1 rounded-full bg-indigo-500" />
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TrustSection = () => {
  return (
    <section className="py-12 border-y border-slate-50 bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by NGOs and Communities Worldwide</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2"><Globe className="w-6 h-6" /><span className="font-bold text-xl">GlobalAid</span></div>
           <div className="flex items-center gap-2"><Heart className="w-6 h-6" /><span className="font-bold text-xl">HopeCare</span></div>
           <div className="flex items-center gap-2"><Users className="w-6 h-6" /><span className="font-bold text-xl">UnityHub</span></div>
           <div className="flex items-center gap-2"><Shield className="w-6 h-6" /><span className="font-bold text-xl">GuardPath</span></div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
  >
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
      <Icon className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors duration-300" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </motion.div>
);

const Features = () => {
  const features = [
    { 
      icon: Zap, 
      title: 'AI Prioritization', 
      desc: 'Gemini AI analyzes reported needs in real-time, assigning urgency scores so critical issues are handled first.' 
    },
    { 
      icon: Users, 
      title: 'Smart Matching', 
      desc: 'Our intelligent matching algorithm connects volunteers based on skills, location, and real-time availability.' 
    },
    { 
      icon: Activity, 
      title: 'Real-Time Dashboard', 
      desc: 'Get a 360-degree view of your operations with live stats and activity feeds for complete transparency.' 
    },
    { 
      icon: MapPin, 
      title: 'Live Map Tracking', 
      desc: 'Visualize needs and volunteer distribution on an interactive map using color-coded urgency indicators.' 
    }
  ];

  return (
    <section id="features" className="py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-xs mb-4">Core Capabilities</h2>
          <p className="text-4xl font-bold text-slate-900 leading-tight">Everything you need to coordinate impact at scale.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Step = ({ num, title, desc }) => (
  <div className="flex-1 relative">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200 mb-6 relative z-10">
        {num}
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 max-w-[200px]">{desc}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-slate-900">How It Works</h2>
        </div>
        
        <div className="relative">
          {/* Horizontal Line */}
          <div className="hidden lg:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-indigo-100" />
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-0">
            <Step num="1" title="Report a Need" desc="Submit details and location of the community requirement." />
            <Step num="2" title="AI Analysis" desc="Gemini AI analyzes text to determine priority and impact." />
            <Step num="3" title="System Match" desc="Automated task creation and volunteer recommendation." />
            <Step num="4" title="Impact Made" desc="Volunteers accept and complete tasks on the ground." />
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-32 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto rounded-[3rem] bg-indigo-600 p-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Start Making Impact Today</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of communities using SmartAlloc to optimize their volunteer resources.
          </p>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="rounded-full px-10 py-6 text-indigo-600 bg-white hover:bg-indigo-50 border-none shadow-2xl">
              Get Started Free
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-20 border-t border-slate-100">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-12">
      <div className="max-w-xs">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">SmartAlloc</span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          The intelligent platform for modern volunteer coordination. Powering local impact with global intelligence.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
        <div>
          <h5 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Product</h5>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Integrations</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Resources</h5>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Community</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Legal</h5>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
      <p>© 2026 SmartAlloc. All rights reserved.</p>
      <div className="flex gap-6">
        <Globe className="w-4 h-4 hover:text-indigo-600 cursor-pointer" />
        <MessageSquare className="w-4 h-4 hover:text-indigo-600 cursor-pointer" />
      </div>
    </div>
  </footer>
);

// Lucide AlertTriangle missing from imports above, adding it here
const AlertTriangle = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <TrustSection />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
