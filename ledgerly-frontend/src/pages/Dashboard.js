import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Target, PieChart as PieIcon } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#A855F7', '#EC4899'];

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard'));
  }, []);

  if (error) return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <p className="text-center text-red-400 mt-10">{error}</p>
    </div>
  );

  if (!summary) return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  const chartData = Object.entries(summary.spendingByCategory).map(([category, amount]) => ({
    name: category, value: amount,
  }));

  const fmt = (n) => new Intl.NumberFormat('en-PK').format(n);

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's your financial overview</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-7 mb-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -right-4 -bottom-12 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-100 text-sm mb-2">
              <Wallet size={16} />
              <span>Total Balance</span>
            </div>
            <p className="text-4xl font-extrabold tracking-tight">
              {summary.balance < 0 ? '-' : ''}Rs. {fmt(Math.abs(summary.balance))}
            </p>
            <div className="flex gap-6 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp size={14} />
                </div>
                <div>
                  <p className="text-xs text-indigo-100">Income</p>
                  <p className="text-sm font-semibold">Rs. {fmt(summary.income)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingDown size={14} />
                </div>
                <div>
                  <p className="text-xs text-indigo-100">Expenses</p>
                  <p className="text-sm font-semibold">Rs. {fmt(summary.expense)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-surface border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <PieIcon size={16} className="text-indigo-400" />
              </div>
              <h2 className="font-semibold text-white">Spending by Category</h2>
            </div>
            {chartData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No expenses recorded yet</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `Rs. ${fmt(v)}`} contentStyle={{ background: '#12172A', border: '1px solid #1F2937', borderRadius: 8, color: 'white' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {chartData.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="capitalize text-gray-300">{c.name}</span>
                      </div>
                      <span className="font-medium text-white">Rs. {fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Target size={16} className="text-amber-400" />
              </div>
              <h2 className="font-semibold text-white">Savings Goals</h2>
            </div>
            {summary.goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No goals set yet</p>
              </div>
            ) : (
              <div className="space-y-5">
                {summary.goals.map((goal) => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  return (
                    <div key={goal._id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-200">{goal.title}</span>
                        <span className="text-gray-500 text-xs">{Math.round(progress)}%</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Rs. {fmt(goal.currentAmount)} of Rs. {fmt(goal.targetAmount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;