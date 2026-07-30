import { useEffect, useState } from 'react';
import { Receipt, AlertTriangle, Trash2, Download } from 'lucide-react';
import { exportStatement } from '../utils/exportPdf';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function History() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch {
      setError('Failed to load transactions');
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const markReviewed = async (id) => {
    await api.patch(`/transactions/${id}/review`);
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    fetchTransactions();
  };

  const riskColor = (score) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const fmt = (n) => new Intl.NumberFormat('en-PK').format(n);

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Receipt size={22} className="text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          </div>
          <button
            onClick={() => exportStatement(transactions, 'Umaima')}
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10"
          >
            <Download size={14} /> Export PDF
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-6">{transactions.length} transactions total</p>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {transactions.length === 0 && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-gray-800">
            <Receipt size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No transactions yet</p>
          </div>
        )}

        <div className="space-y-3">
          {transactions.map((t) => (
            <div
              key={t._id}
              className={`bg-surface rounded-2xl p-4 border transition ${
                t.flagged && !t.reviewed ? 'border-red-500/40 bg-red-500/5' : 'border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    t.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white capitalize">{t.category}</span>
                      {t.flagged && (
                        <span className={`flex items-center gap-1 text-[11px] text-white px-2 py-0.5 rounded-full ${riskColor(t.riskScore)}`}>
                          <AlertTriangle size={10} /> {t.riskScore}{t.reviewed ? ' ✓' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{t.note || 'No note'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'} Rs. {fmt(t.amount)}
                  </p>
                  <button onClick={() => handleDelete(t._id)} className="text-gray-600 hover:text-red-400 mt-1 inline-block">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {t.flagged && t.flagReasons?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-500/20 space-y-1">
                  {t.flagReasons.map((reason, i) => (
                    <p key={i} className="text-xs text-red-300">• {reason}</p>
                  ))}
                  {!t.reviewed && (
                    <button
                      onClick={() => markReviewed(t._id)}
                      className="mt-2 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-indigo-500"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;