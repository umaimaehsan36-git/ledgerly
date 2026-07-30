import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function AddTransaction() {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [flagWarning, setFlagWarning] = useState('');
  const navigate = useNavigate();

  const categories = ['food', 'bills', 'transport', 'shopping', 'entertainment', 'health', 'savings', 'salary', 'other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFlagWarning('');
    try {
      const res = await api.post('/transactions', { amount: Number(amount), type, category, note });
      if (res.data.flagged) {
        setFlagWarning(`Risk score ${res.data.riskScore}: ${res.data.flagReasons.join(', ')}`);
        setTimeout(() => navigate('/history'), 2500);
      } else {
        navigate('/history');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="max-w-sm mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">Add Transaction</h1>

        <form onSubmit={handleSubmit} className="bg-surface border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
                type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
              <ArrowDownCircle size={16} /> Expense
            </button>
            <button type="button" onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
                type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
              <ArrowUpCircle size={16} /> Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Amount (Rs.)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1"
              className="w-full px-3 py-2.5 bg-ink border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-ink border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary">
              {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 bg-ink border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-3 py-2 rounded-xl">{error}</div>}
          {flagWarning && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm px-3 py-2 rounded-xl">⚠ {flagWarning}</div>}

          <button type="submit" className="w-full bg-primary text-white font-medium py-2.5 rounded-xl hover:bg-indigo-500 transition">
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTransaction;