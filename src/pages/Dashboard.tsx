import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, TrendingUp, CheckCircle2, Users, ArrowUpRight, ArrowDownRight, Clock, PlayCircle } from 'lucide-react';
import { formatPKR, cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

interface DashboardData {
  balance: number;
  totalEarnings: number;
  completedTasks: number;
  referralCount: number;
  isActive: boolean;
  depositHistory: any[];
  withdrawalHistory: any[];
  lastApprovedDeposit: string | null;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  const stats = [
    { label: 'Current Balance', value: formatPKR(data?.balance || 0), icon: Wallet, color: 'bg-emerald-500' },
    { label: 'Total Earnings', value: formatPKR(data?.totalEarnings || 0), icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Tasks Completed', value: data?.completedTasks || 0, icon: CheckCircle2, color: 'bg-amber-500' },
    { label: 'Total Referrals', value: data?.referralCount || 0, icon: Users, color: 'bg-indigo-500' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Track your earnings and activities</p>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl font-bold flex items-center gap-2",
          data?.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        )}>
          {data?.isActive ? (
            <><CheckCircle2 className="w-5 h-5" /> Account Active</>
          ) : (
            <><Clock className="w-5 h-5" /> Account Inactive</>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-slate-200`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Deposit History</h2>
              <Link to="/deposit" className="text-sm text-emerald-600 font-semibold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.depositHistory.slice(0, 5).map((d, i) => (
                    <tr key={i} className="text-sm">
                      <td className="px-6 py-4 font-bold text-slate-900">{formatPKR(d.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          d.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(d.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {data?.depositHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No deposits yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Withdrawal History</h2>
              <Link to="/withdraw" className="text-sm text-emerald-600 font-semibold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.withdrawalHistory.slice(0, 5).map((w, i) => (
                    <tr key={i} className="text-sm">
                      <td className="px-6 py-4 font-bold text-slate-900">{formatPKR(w.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(w.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {data?.withdrawalHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No withdrawals yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/tasks" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                <PlayCircle className="w-6 h-6" />
                <span className="text-xs font-bold">Watch Ads</span>
              </Link>
              <Link to="/deposit" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                <ArrowUpRight className="w-6 h-6" />
                <span className="text-xs font-bold">Deposit</span>
              </Link>
              <Link to="/withdraw" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                <ArrowDownRight className="w-6 h-6" />
                <span className="text-xs font-bold">Withdraw</span>
              </Link>
              <Link to="/referrals" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                <Users className="w-6 h-6" />
                <span className="text-xs font-bold">Invite</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Task Status</h3>
            </div>
            {data?.lastApprovedDeposit ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Your deposit was approved on {new Date(data.lastApprovedDeposit).toLocaleString()}.
                </p>
                {new Date().getTime() - new Date(data.lastApprovedDeposit).getTime() < 24 * 60 * 60 * 1000 ? (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 font-medium">
                    Tasks will unlock 24 hours after approval. Please wait.
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700 font-medium">
                    Tasks are unlocked! Start watching now.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Deposit at least 1200 PKR to activate your account and start earning.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
