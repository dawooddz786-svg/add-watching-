import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Copy, Gift, Trophy, ArrowRight } from 'lucide-react';
import { formatPKR, cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Referrals() {
  const [user, setUser] = useState<any>(null);
  const [referralCount, setReferralCount] = useState(0);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, dashRes] = await Promise.all([
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const userData = await userRes.json();
      const dashData = await dashRes.json();
      setUser(userData);
      setReferralCount(dashData.referralCount);
    } catch (err) {
      console.error(err);
    }
  };

  const referralLink = `${window.location.origin}/signup?ref=${user?.referral_code}`;

  const bonuses = [
    { count: 1, reward: '200 PKR', desc: 'For your first referral', status: referralCount >= 1 },
    { count: 5, reward: '1000 PKR Bonus', desc: 'Reach Level 1 (5 members)', status: referralCount >= 5 },
    { count: 10, reward: 'Mega Bonus', desc: 'Reach 10 active members', status: referralCount >= 10 },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Referral Program</h1>
          <p className="text-slate-500">Invite friends and earn massive bonuses</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <Gift className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-amber-800">
            Level 1: Add 5 members for <span className="text-emerald-600">PKR 1000</span> extra!
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Referral Link Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Referral Link</h2>
                <p className="text-slate-500">Share this link to invite others</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm break-all">
                {referralLink}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  toast.success('Link copied!');
                }}
                className="px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Copy className="w-5 h-5" /> Copy Link
              </button>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Referral Milestones</h2>
            <div className="space-y-6">
              {bonuses.map((b, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    b.status ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {b.status ? <Trophy className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900">{b.count} Member{b.count > 1 ? 's' : ''} Joined</h3>
                      <span className={cn(
                        "text-sm font-bold",
                        b.status ? "text-emerald-600" : "text-slate-400"
                      )}>{b.reward}</span>
                    </div>
                    <p className="text-sm text-slate-500">{b.desc}</p>
                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-500", b.status ? "bg-emerald-500" : "bg-slate-300")}
                        style={{ width: `${Math.min(100, (referralCount / b.count) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg shadow-blue-200">
            <h3 className="text-xl font-bold mb-4">How it works?</h3>
            <ul className="space-y-4">
              {[
                'Share your unique link with friends',
                'They sign up using your link',
                'They make their first deposit',
                'You get 200 PKR bonus instantly',
                'Reach milestones for extra rewards'
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 font-bold">{i + 1}</div>
                  <p className="opacity-90">{step}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <p className="text-sm text-slate-500 mb-1">Total Referrals</p>
            <p className="text-4xl font-bold text-slate-900">{referralCount}</p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Keep sharing to earn more!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


