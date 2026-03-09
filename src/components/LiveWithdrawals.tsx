import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownCircle, CheckCircle2, TrendingDown } from 'lucide-react';
import { formatPKR } from '../lib/utils';

const NAMES = [
  'Ahmed', 'Sara', 'Zeeshan', 'Fatima', 'Bilal', 'Ayesha', 'Hamza', 'Zainab', 'Usman', 'Hina',
  'Ali', 'Maryam', 'Omer', 'Sana', 'Ibrahim', 'Khadija', 'Mustafa', 'Zoya', 'Hassan', 'Amna'
];

const getWeightedAmount = () => {
  const rand = Math.random();
  if (rand < 0.6) return 500;      // 60% chance
  if (rand < 0.75) return 1000;    // 15% chance
  if (rand < 0.85) return 1500;    // 10% chance
  if (rand < 0.93) return 2000;    // 8% chance
  if (rand < 0.98) return 5000;    // 5% chance
  return 10000;                    // 2% chance
};

export default function LiveWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<{ id: number; name: string; amount: number }[]>([]);

  useEffect(() => {
    // Initial set of withdrawals
    const initial = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() - i * 3000,
      name: NAMES[Math.floor(Math.random() * NAMES.length)],
      amount: getWeightedAmount()
    }));
    setWithdrawals(initial);

    const interval = setInterval(() => {
      const newWithdrawal = {
        id: Date.now(),
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        amount: getWeightedAmount()
      };
      setWithdrawals(prev => [newWithdrawal, ...prev.slice(0, 15)]);
    }, 2500); // Every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-slate-800 h-14 flex items-center overflow-hidden">
      <div className="flex items-center px-6 border-r border-slate-700 bg-slate-900 h-full shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Live Withdrawals</span>
        </div>
      </div>
      
      <div className="flex-1 relative h-full flex items-center overflow-hidden">
        <div className="flex items-center gap-8 px-8 whitespace-nowrap">
          <AnimatePresence mode="popLayout">
            {withdrawals.map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="flex items-center gap-2 text-white"
              >
                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                  <TrendingDown className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold text-slate-300">{w.name}</span>
                <span className="text-xs font-black text-emerald-400">{formatPKR(w.amount)}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Gradient Fades */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-900 to-transparent z-0" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-900 to-transparent z-0" />
      </div>
    </div>
  );
}

