import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PlayCircle, Clock, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { formatPKR } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Task {
  id: number;
  title: string;
  youtube_url: string;
  duration: number;
  reward: number;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [lastApprovedDeposit, setLastApprovedDeposit] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, dashRes] = await Promise.all([
        fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const tasksData = await tasksRes.json();
      const dashData = await dashRes.json();
      setTasks(tasksData);
      setLastApprovedDeposit(dashData.lastApprovedDeposit);
      setIsActive(dashData.isActive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startTask = (task: Task) => {
    setActiveTask(task);
    setTimer(task.duration);
    setIsWatching(true);
    
    // Open YouTube in new tab
    window.open(task.youtube_url, '_blank');

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          completeTask(task.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeTask = async (taskId: number) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Task completed! Reward added to balance.');
        setTasks(tasks.filter(t => t.id !== taskId));
      } else {
        toast.error('Failed to complete task');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsWatching(false);
      setActiveTask(null);
    }
  };

  const isLocked = !isActive || !lastApprovedDeposit || (new Date().getTime() - new Date(lastApprovedDeposit).getTime() < 24 * 60 * 60 * 1000);

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  if (isLocked) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto text-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            {!isActive ? 'Account Inactive' : 'Tasks Locked'}
          </h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {!isActive 
              ? 'Your account is currently inactive. You must make a deposit to activate your account and start earning.'
              : 'Tasks are locked for 24 hours after your first deposit is approved. This is to ensure platform stability and security.'}
          </p>
          {!isActive ? (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 font-medium">
              Please make a deposit of at least 1200 PKR to activate your account.
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 font-medium">
              Your tasks will unlock soon. Please check back later.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Tasks</h1>
          <p className="text-slate-500">Watch videos and earn 300 PKR per video</p>
        </div>
        <div className="bg-emerald-100 px-4 py-2 rounded-xl text-emerald-700 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {tasks.length} Tasks Available
        </div>
      </div>

      {/* Video Tasks Promo Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <PlayCircle className="w-3 h-3" /> Special Offer
            </div>
            <h2 className="text-3xl lg:text-4xl font-black mb-2">🔥 Watch Videos & Earn PKR 300 Per Video!</h2>
            <p className="text-slate-400 text-lg">
              Complete 10 videos daily = <span className="text-emerald-400 font-bold">PKR 3000</span>. Click each video to start earning now!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center min-w-[120px]">
              <p className="text-2xl font-black text-emerald-400">300</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Per Task</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center min-w-[120px]">
              <p className="text-2xl font-black text-blue-400">3000</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Daily Max</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative h-48 rounded-3xl overflow-hidden group">
          <img 
            src="https://picsum.photos/seed/task1/800/400" 
            alt="Task Banner" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-transparent flex flex-col justify-center p-8">
            <h3 className="text-white font-bold text-xl mb-2">Daily Rewards</h3>
            <p className="text-emerald-100 text-sm">Watch videos for 30 seconds and earn 300 PKR instantly.</p>
          </div>
        </div>
        <div className="relative h-48 rounded-3xl overflow-hidden group">
          <img 
            src="https://picsum.photos/seed/task2/800/400" 
            alt="Task Banner" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex flex-col justify-center p-8">
            <h3 className="text-white font-bold text-xl mb-2">Secure Payouts</h3>
            <p className="text-blue-100 text-sm">All earnings are verified and paid out within 24 hours.</p>
          </div>
        </div>
      </div>

      {isWatching && activeTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-600 p-8 rounded-3xl text-white mb-8 text-center shadow-lg shadow-emerald-200"
        >
          <h2 className="text-xl font-bold mb-2">Watching: {activeTask.title}</h2>
          <p className="text-emerald-100 mb-6">Please keep the YouTube tab open until the timer finishes.</p>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-white/30 relative">
            <div className="text-3xl font-bold">{timer}s</div>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="48" cy="48" r="44"
                fill="none" stroke="white" strokeWidth="4"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * (activeTask.duration - timer)) / activeTask.duration}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{task.title}</h3>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {task.duration}s</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600">{formatPKR(task.reward)}</span>
            </div>
            <button
              onClick={() => startTask(task)}
              disabled={isWatching}
              className="mt-auto w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Start Task
            </button>
          </motion.div>
        ))}
      </div>

      {tasks.length === 0 && !isWatching && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">All Tasks Completed!</h2>
          <p className="text-slate-500">Come back tomorrow for new tasks.</p>
        </div>
      )}
    </div>
  );
}
