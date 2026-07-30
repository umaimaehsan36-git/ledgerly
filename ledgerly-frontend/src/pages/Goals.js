import { useEffect, useState } from 'react';
import { Target, Plus } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    const res = await api.get('/goals');
    setGoals(res.data);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/goals', { title, targetAmount: Number(targetAmount), deadline });
      setTitle(''); setTargetAmount(''); setDeadline('');
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-PK').format(n);

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-1">
          <Target size={22} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6">Track progress toward what matters</p>

        <form onSubmit={handleSubmit} className="bg-surface border border-gray-800 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1">Goal title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-3 py-2 bg-ink border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. New Laptop" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Target (Rs.)</label>
            <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required min="1"
              className="w-full px-3 py-2 bg-ink border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-ink border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" className="sm:col-span-4 flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-500 transition">
            <Plus size={16} /> Create Goal
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {goals.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-gray-800">
            <Target size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No goals set yet — create your first one above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal._id} className="bg-surface border border-gray-800 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-white">{goal.title}</h3>
                    <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{Math.round(progress)}%</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500">
                    Rs. {fmt(goal.currentAmount)} of Rs. {fmt(goal.targetAmount)}
                    {goal.deadline && ` · by ${new Date(goal.deadline).toLocaleDateString()}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;