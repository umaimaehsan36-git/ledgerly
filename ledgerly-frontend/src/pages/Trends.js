import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Repeat } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Trends() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/trends')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load trends'));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-PK').format(n);

  if (error) return <div className="min-h-screen bg-ink"><Navbar /><p className="text-center text-red-400 mt-10">{error}</p></div>;
  if (!data) return <div className="min-h-screen bg-ink"><Navbar /><div className="flex justify-center mt-10"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></div>;

  const { monthlyTrend, prediction, recurring } = data;

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={22} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Trends & Insights</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6">Spending patterns over time</p>

        <div className="bg-surface border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">This Month's Projection</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Spent so far</p>
              <p className="text-xl font-bold text-white">Rs. {fmt(prediction.spentSoFar)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Daily average</p>
              <p className="text-xl font-bold text-white">Rs. {fmt(prediction.dailyAverage)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Projected month-end total</p>
              <p className="text-xl font-bold text-amber-400">Rs. {fmt(prediction.projectedTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Based on your average daily spend, with {prediction.daysRemaining} days left in the month.
          </p>
        </div>

        <div className="bg-surface border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Income vs Expense by Month</h2>
          {monthlyTrend.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Not enough data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip formatter={(v) => `Rs. ${fmt(v)}`} contentStyle={{ background: '#12172A', border: '1px solid #1F2937', borderRadius: 8, color: 'white' }} />
                <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-surface border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Repeat size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Detected Recurring Expenses</h2>
          </div>
          {recurring.length === 0 ? (
            <p className="text-gray-500 text-sm">No recurring patterns detected yet</p>
          ) : (
            <div className="space-y-2">
              {recurring.map((r) => (
                <div key={r.category} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                  <span className="capitalize text-sm text-gray-300">{r.category}</span>
                  <span className="text-sm text-gray-500">~Rs. {fmt(r.averageAmount)} · {r.occurrences}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Trends;