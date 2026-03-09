import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, XCircle, Users, Wallet, ArrowDownCircle, PlusCircle, Search, Download, Filter, Settings, TrendingUp } from 'lucide-react';
import { formatPKR, cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'users' | 'tasks' | 'settings'>('deposits');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const token = useAuthStore((state) => state.token);

  // Task form state
  const [taskForm, setTaskForm] = useState({ id: null, title: '', youtube_url: '', duration: '30', reward: '300', is_active: 1, target_user_email: '' });
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [freeActivationId, setFreeActivationId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [depRes, withRes, userRes, setRes, taskRes, statsRes] = await Promise.all([
        fetch('/api/admin/deposits', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/tasks', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDeposits(await depRes.json());
      setWithdrawals(await withRes.json());
      setUsers(await userRes.json());
      setTasks(await taskRes.json());
      setStats(await statsRes.json());
      const settingsData = await setRes.json();
      setSettings(settingsData);
      const settingsObj = settingsData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
      setSettingsForm(settingsObj);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeposit = async (id: number) => {
    try {
      await fetch(`/api/admin/deposits/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Deposit approved');
      fetchData();
    } catch (err) { toast.error('Action failed'); }
  };

  const handleRejectDeposit = async (id: number) => {
    try {
      await fetch(`/api/admin/deposits/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Deposit rejected');
      fetchData();
    } catch (err) { toast.error('Action failed'); }
  };

  const handleApproveWithdrawal = async (id: number) => {
    try {
      await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Withdrawal approved');
      fetchData();
    } catch (err) { toast.error('Action failed'); }
  };

  const handleRejectWithdrawal = async (id: number) => {
    try {
      await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Withdrawal rejected');
      fetchData();
    } catch (err) { toast.error('Action failed'); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = taskForm.id ? `/api/admin/tasks/${taskForm.id}` : '/api/admin/tasks';
      const method = taskForm.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(taskForm),
      });
      if (res.ok) {
        toast.success(taskForm.id ? 'Task updated' : 'Task added');
        setTaskForm({ id: null, title: '', youtube_url: '', duration: '30', reward: '300', is_active: 1, target_user_email: '' });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save task');
      }
    } catch (err) { toast.error('Failed to save task'); }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Task deleted');
      fetchData();
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleFreeActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/free-activate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ identifier: freeActivationId }),
      });
      if (res.ok) {
        toast.success('User activated for free!');
        setFreeActivationId('');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Activation failed');
      }
    } catch (err) { toast.error('Activation failed'); }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        toast.success('Settings updated');
        fetchData();
      }
    } catch (err) { toast.error('Failed to update settings'); }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Balance', 'Total Deposits', 'Referrals', 'Referral Earnings', 'Joined'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [
        u.name,
        u.email,
        u.phone,
        u.balance,
        u.total_deposits,
        u.referral_count,
        u.total_referral_earnings,
        new Date(u.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
          <p className="text-slate-500">Manage platform operations</p>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Deposited', value: stats.depositedUsers, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Non-Deposited', value: stats.nonDepositedUsers, icon: XCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Total Deposits', value: formatPKR(stats.totalDeposits), icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Active Tasks', value: stats.activeTasks, icon: PlusCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Today Earnings', value: formatPKR(stats.todayEarnings), icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", s.bg, s.color)}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{s.label}</p>
              <p className="text-lg font-black text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'deposits', label: 'Deposits', icon: Wallet },
          { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownCircle },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'tasks', label: 'Add Tasks', icon: PlusCircle },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'deposits' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Screenshot</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deposits.map((d) => (
                  <tr key={d.id} className="text-sm">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{d.user_name}</p>
                      <p className="text-xs text-slate-500">{d.user_email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold">{formatPKR(d.amount)}</td>
                    <td className="px-6 py-4">
                      {d.screenshot_url && (
                        <a href={d.screenshot_url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">View</a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>{d.status.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {d.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveDeposit(d.id)} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => handleRejectDeposit(d.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="text-sm">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{w.user_name}</p>
                      <p className="text-xs text-slate-500">{w.user_email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold">{formatPKR(w.amount)}</td>
                    <td className="px-6 py-4">{w.method}</td>
                    <td className="px-6 py-4 text-xs">{w.account_details}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>{w.status.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveWithdrawal(w.id)} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => handleRejectWithdrawal(w.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Deposit Status</th>
                    <th className="px-6 py-4">Financials</th>
                    <th className="px-6 py-4">Referrals</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold",
                          u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold",
                          u.deposit_status === 'Deposited' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {u.deposit_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-500">Balance:</span>
                            <span className="font-bold text-emerald-600">{formatPKR(u.balance)}</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-500">Deposits:</span>
                            <span className="font-bold text-slate-900">{formatPKR(u.total_deposits)}</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-500">Members:</span>
                            <span className="font-bold text-indigo-600">{u.referral_count}</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-500">Earnings:</span>
                            <span className="font-bold text-slate-900">{formatPKR(u.total_referral_earnings)}</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No users found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div>
              <h2 className="text-xl font-bold mb-6">{taskForm.id ? 'Edit Video Task' : 'Add New Video Task'}</h2>
              <form onSubmit={handleAddTask} className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div>
                  <label className="block text-sm font-semibold mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl"
                    placeholder="Watch & Earn Task"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">YouTube URL</label>
                  <input
                    type="url"
                    required
                    value={taskForm.youtube_url}
                    onChange={(e) => setTaskForm({ ...taskForm, youtube_url: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl"
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Duration (seconds)</label>
                    <select
                      value={taskForm.duration}
                      onChange={(e) => setTaskForm({ ...taskForm, duration: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="30">30 Seconds</option>
                      <option value="60">60 Seconds</option>
                      <option value="120">120 Seconds</option>
                      <option value="180">180 Seconds</option>
                      <option value="300">5 Minutes</option>
                      <option value="600">10 Minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Reward (PKR)</label>
                    <input
                      type="number"
                      required
                      value={taskForm.reward}
                      onChange={(e) => setTaskForm({ ...taskForm, reward: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Target User Email (Optional)</label>
                  <input
                    type="text"
                    value={taskForm.target_user_email || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, target_user_email: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl"
                    placeholder="Leave empty for all users"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">If set, only this user will see this task.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={taskForm.is_active === 1}
                    onChange={(e) => setTaskForm({ ...taskForm, is_active: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold">Active Task</label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all">
                    {taskForm.id ? 'Update Task' : 'Add Task'}
                  </button>
                  {taskForm.id && (
                    <button 
                      type="button" 
                      onClick={() => setTaskForm({ id: null, title: '', youtube_url: '', duration: '30', reward: '300', is_active: 1 })}
                      className="px-6 py-4 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-6">Manage Tasks ({tasks.length}/20)</h2>
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div key={t.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500">
                        {t.duration}s • {formatPKR(t.reward)} • {t.is_active ? 'Active' : 'Inactive'}
                        {t.target_user_email && <span className="ml-2 text-indigo-600 font-bold">Target: {t.target_user_email}</span>}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => setTaskForm({ ...t, duration: t.duration.toString(), reward: t.reward.toString(), target_user_email: t.target_user_email || '' })}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-slate-400 text-center py-8">No tasks added yet.</p>}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="p-8 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Platform Settings</h2>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Minimum Deposit (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.min_deposit || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, min_deposit: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Minimum Withdrawal (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.min_withdrawal || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, min_withdrawal: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Video Task Reward (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.video_reward || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, video_reward: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Referral Bonus (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.referral_bonus || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, referral_bonus: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Save Platform Settings
              </button>
            </form>

            <div className="mt-12 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Free Account Activation
              </h3>
              <p className="text-sm text-indigo-700 mb-6">Activate one user per day without a deposit fee. Enter their Email or User ID below.</p>
              <form onSubmit={handleFreeActivation} className="flex gap-3">
                <input
                  type="text"
                  required
                  value={freeActivationId}
                  onChange={(e) => setFreeActivationId(e.target.value)}
                  placeholder="User Email or ID"
                  className="flex-1 p-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
                  Activate User
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


