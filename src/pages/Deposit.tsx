import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, Copy, CheckCircle2, AlertCircle, Upload, PlayCircle } from 'lucide-react';
import { formatPKR, cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Deposit() {
  const [amount, setAmount] = useState('1500');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const packages = [
    { label: 'Starter', amount: 1200 },
    { label: 'Basic', amount: 1500 },
    { label: 'Standard', amount: 1800 },
    { label: 'Premium', amount: 2000 },
    { label: 'Elite', amount: 2500 },
  ];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload a payment screenshot');
    if (parseInt(amount) < 1200) return toast.error('Minimum deposit is 1200 PKR');

    setLoading(true);
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('screenshot', file);

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        toast.success('Deposit submitted! Waiting for admin approval.');
        setFile(null);
      } else {
        toast.error('Failed to submit deposit');
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
        <h1 className="text-2xl font-bold text-slate-900">Deposit Funds</h1>
        <p className="text-slate-500">Add money to your account to start tasks</p>
      </div>

      {/* Video Task Promo Box */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 bg-emerald-600 rounded-3xl text-white shadow-lg shadow-emerald-100 flex items-center gap-4 border-2 border-emerald-400"
      >
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <PlayCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-black text-lg leading-tight">💡 Don’t forget: Watch daily videos under Tasks to earn PKR 300 each!</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4">Payment Details</h2>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">EasyPaisa Number</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-emerald-900">03237697233</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('03237697233');
                      toast.success('Number copied!');
                    }}
                    className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Account Name</p>
                <p className="text-lg font-bold text-slate-900">Shahda Menzoor</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Important Instructions:</p>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li>Minimum deposit is 1500 PKR.</li>
                <li>Send payment to the EasyPaisa number above.</li>
                <li>Take a screenshot of the successful transaction.</li>
                <li>Upload the screenshot and enter the amount below.</li>
                <li>Admin will verify and approve within 1-12 hours.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-6">Submit Deposit</h2>
          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">Select Deposit Package</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {packages.map((pkg) => (
                  <button
                    key={pkg.amount}
                    type="button"
                    onClick={() => setAmount(pkg.amount.toString())}
                    className={cn(
                      "p-3 rounded-2xl border-2 transition-all text-center",
                      amount === pkg.amount.toString()
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
                        : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    <p className="text-xs uppercase tracking-wider opacity-60 mb-1">{pkg.label}</p>
                    <p className="text-sm">PKR {pkg.amount}</p>
                  </button>
                ))}
              </div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">Custom Amount (PKR)</label>
              <input
                type="number"
                min="1200"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Screenshot</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                  "border-2 border-dashed rounded-2xl p-8 text-center transition-all",
                  file ? "border-emerald-500 bg-emerald-50" : "border-slate-200 group-hover:border-emerald-400 group-hover:bg-slate-50"
                )}>
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      <p className="text-sm font-bold text-emerald-700">{file.name}</p>
                      <p className="text-xs text-emerald-600">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-slate-400" />
                      <p className="text-sm font-bold text-slate-600">Upload Screenshot</p>
                      <p className="text-xs text-slate-400">JPG, PNG or WEBP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-200"
            >
              {loading ? 'Submitting...' : 'Submit Deposit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
