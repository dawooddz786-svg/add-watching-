import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PlayCircle, ShieldCheck, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

import TutorialVideo from '../components/TutorialVideo';

export default function Home() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-50 rounded-full">
                The Most Trusted Earning Platform
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8">
                Watch Ads, <span className="text-emerald-600">Earn PKR 300</span> Per Video
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Watch 10 videos daily and earn <span className="font-bold text-emerald-600">PKR 3000</span> easily. 
                Fast withdrawals, secure deposits, and massive referral bonuses.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  Start Earning Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Sign In
                </Link>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <img 
                    src="https://picsum.photos/seed/adwatching1/800/600" 
                    alt="Earning Dashboard" 
                    referrerPolicy="no-referrer"
                    className="relative rounded-3xl shadow-2xl border border-white/20 object-cover w-full h-64"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl flex items-end p-6">
                    <p className="text-white font-bold">Real-time Earning Dashboard</p>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <img 
                    src="https://picsum.photos/seed/adwatching2/800/600" 
                    alt="Video Tasks" 
                    referrerPolicy="no-referrer"
                    className="relative rounded-3xl shadow-2xl border border-white/20 object-cover w-full h-64"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl flex items-end p-6">
                    <p className="text-white font-bold">High-Reward Video Tasks</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Tutorial Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-4">How to Use Ad Watching Website</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Follow our simple step-by-step guide to start your journey on the platform.
            </p>
          </div>
          
          <TutorialVideo />
        </div>
      </section>

      {/* Video Tasks Promo Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm mb-6">
                  <PlayCircle className="w-4 h-4" /> New Earning Opportunity
                </div>
                <h2 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
                  Watch Videos & <br />
                  <span className="text-emerald-500">Earn PKR 3000</span> Daily
                </h2>
                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 font-bold">1</div>
                    <div>
                      <p className="font-bold text-lg">Watch 1 Video = PKR 300</p>
                      <p className="text-slate-400">Simple video watch tasks, no extra ads needed.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 font-bold">2</div>
                    <div>
                      <p className="font-bold text-lg">10 Tasks Daily = PKR 3000</p>
                      <p className="text-slate-400">Maximize your earnings by completing all daily tasks.</p>
                    </div>
                  </div>
                </div>
                <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-500 text-slate-900 font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                  Start Watching Now <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-slate-800 p-8 rounded-[3rem] border border-slate-700 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6">How it works:</h3>
                  <div className="space-y-4">
                    {[
                      'Log in to your account.',
                      'Go to the Tasks / Videos section.',
                      'Watch the videos fully to get your reward.',
                      'Do all daily video tasks to maximize your earnings.'
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">{i + 1}</div>
                        <p className="font-medium text-slate-200">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500 rounded-3xl -rotate-12 -z-10" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500 rounded-3xl rotate-12 -z-10" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Promo Section */}
      <section className="py-24 bg-emerald-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-[3rem] p-8 lg:p-16 border border-emerald-100 shadow-xl shadow-emerald-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm mb-6">
                  <Users className="w-4 h-4" /> Limited Time Offer
                </div>
                <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                  Invite Friends & <br />
                  <span className="text-emerald-600">Earn PKR 200</span> Each
                </h2>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Add your friends and earn PKR 200 per member. When you add 5 members, you will reach Level 1 and get an extra <span className="font-bold text-emerald-600">PKR 1000 bonus!</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
                    Get Started Now
                  </Link>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    No limit on earnings
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center">
                  <p className="text-4xl font-black text-emerald-600 mb-2">200</p>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Per Member</p>
                </div>
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
                  <p className="text-4xl font-black text-blue-600 mb-2">1000</p>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Level 1 Bonus</p>
                </div>
                <div className="col-span-2 bg-slate-900 p-8 rounded-3xl text-white text-center">
                  <p className="text-lg font-bold">The more members you add, the higher your rewards. 💰</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Why Choose Ad Watching?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We provide a secure and transparent way to earn money from the comfort of your home.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Instant Tasks',
                desc: 'Watch short YouTube videos and get paid 300 PKR for each task instantly.',
                icon: Zap,
                color: 'bg-amber-100 text-amber-600'
              },
              {
                title: 'Secure Payments',
                desc: 'Easy deposits and withdrawals via EasyPaisa and JazzCash with full transparency.',
                icon: ShieldCheck,
                color: 'bg-emerald-100 text-emerald-600'
              },
              {
                title: 'Referral Bonus',
                desc: 'Earn 200 PKR per member + 1000 PKR Level 1 bonus for every 5 members.',
                icon: Users,
                color: 'bg-blue-100 text-blue-600'
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", f.color)}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Users', value: '10K+' },
              { label: 'Total Paid Out', value: '5M+ PKR' },
              { label: 'Daily Tasks', value: '50+' },
              { label: 'Support Rate', value: '99.9%' }
            ].map((s, i) => (
              <div key={i}>
                <p className="text-4xl lg:text-5xl font-bold mb-2">{s.value}</p>
                <p className="text-emerald-100 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <PlayCircle className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-slate-900">Ad Watching</span>
            </div>
            <p className="text-slate-500 text-sm">© 2026 Ad Watching. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-medium text-slate-600">
              <Link to="/support" className="hover:text-emerald-600">Support</Link>
              <a href="mailto:dawooddz786@gmail.com" className="hover:text-emerald-600">Email Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


