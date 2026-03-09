import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowDownCircle, Wallet, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import { formatPKR, cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('EasyPaisa');
  const [accountDetails, setAccountDetails] = useState('');
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meRes, dashRes] = await Promise.all([
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const meData = await meRes.json();
      const dashData = await dashRes.json();
      setBalance(meData.balance);
      setHistory(dashData.withdrawalHistory || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount);
    if (numAmount < 500) return toast.error('Minimum withdrawal is 500 PKR');
    if (numAmount > balance) return toast.error('Insufficient balance');

    setLoading(true);
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: numAmount, method, accountDetails }),
      });
      if (res.ok) {
        toast.success('Withdrawal request submitted!');
        setAmount('');
        setAccountDetails('');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Withdraw Earnings</h1>
        <p className="text-slate-500">Transfer your rewards to your mobile wallet</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-lg shadow-emerald-200">
            <p className="text-emerald-100 text-sm font-medium mb-1">Available Balance</p>
            <p className="text-4xl font-bold">{formatPKR(balance)}</p>
            <div className="mt-6 flex items-center gap-2 text-sm bg-white/10 p-3 rounded-2xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready for withdrawal</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4">Withdrawal Rules</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-400 text-xs font-bold">1</div>
                <p>Minimum withdrawal amount is 500 PKR.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-400 text-xs font-bold">2</div>
                <p>Withdrawals are processed within 24-48 hours.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-400 text-xs font-bold">3</div>
                <p>Ensure your account details are correct.</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-6">Request Withdrawal</h2>
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Method</label>
              <div className="grid grid-cols-2 gap-4">
                {['EasyPaisa', 'JazzCash'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={cn(
                      "py-3 px-4 rounded-2xl border-2 font-bold transition-all",
                      method === m 
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700" 
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (PKR)</label>
              <input
                type="number"
                min="500"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-lg"
                placeholder="Min 500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Account Details</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Account Number & Name"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">Example: 03001234567 - John Doe</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-200"
            >
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Withdrawal History</h2>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="text-sm">
                    <td className="px-6 py-4 text-slate-500">{new Date(h.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatPKR(h.amount)}</td>
                    <td className="px-6 py-4 text-slate-600">{h.method}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        h.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                        h.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'
                      )}>
                        {h.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No withdrawal requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


