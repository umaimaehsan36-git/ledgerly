import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Users, ArrowRight, Zap } from 'lucide-react';
import Logo from '../components/Logo';

function Landing() {
  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-semibold text-lg">Ledgerly</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition">Log in</Link>
          <Link to="/signup" className="text-sm font-medium bg-primary px-4 py-2 rounded-lg hover:bg-indigo-500 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-6">
          <Zap size={12} /> Explainable risk scoring, not a black box
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Know where your money goes.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Before something goes wrong.
          </span>
        </h1>
        <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto">
          Ledgerly tracks your income and expenses, then flags anything unusual —
          with a plain-language reason, not just a red dot.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link to="/signup" className="flex items-center gap-2 bg-primary px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition">
            Create Free Account <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="px-6 py-3 rounded-xl font-medium border border-gray-700 hover:border-gray-500 transition">
            Log In
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-6">No credit card. No setup. Just open an account and start tracking.</p>
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface border border-gray-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
              <Shield size={18} className="text-indigo-400" />
            </div>
            <h3 className="font-semibold mb-2">Risk-Scored Transactions</h3>
            <p className="text-gray-400 text-sm">
              Every expense is checked against your own spending pattern — unusual amounts, rapid activity, and odd hours all get flagged, with a score and a reason.
            </p>
          </div>
          <div className="bg-surface border border-gray-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <TrendingUp size={18} className="text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Trends & Predictions</h3>
            <p className="text-gray-400 text-sm">
              See where your money actually goes, month over month, and get a live projection of where you'll land by month-end.
            </p>
          </div>
          <div className="bg-surface border border-gray-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
              <Users size={18} className="text-emerald-400" />
            </div>
            <h3 className="font-semibold mb-2">Shared Accounts</h3>
            <p className="text-gray-400 text-sm">
              Invite a partner or family member into your account — like a real joint account, with role-based access.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <p className="text-xs uppercase tracking-wider text-indigo-400 font-medium mb-3">How it works</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { n: '01', t: 'Add a transaction', d: 'Log income or expenses in seconds.' },
            { n: '02', t: 'It gets scored', d: 'Checked against your history in real time.' },
            { n: '03', t: 'Anything odd is flagged', d: 'With a clear, specific reason — never a mystery.' },
            { n: '04', t: 'You stay in control', d: 'Review, clear, or investigate — your call.' },
          ].map((step) => (
            <div key={step.n} className="border-l-2 border-indigo-500/30 pl-4">
              <p className="text-indigo-400 font-mono text-sm mb-2">{step.n}</p>
              <h4 className="font-semibold mb-1">{step.t}</h4>
              <p className="text-gray-400 text-sm">{step.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Start seeing your finances clearly.</h2>
        <Link to="/signup" className="inline-flex items-center gap-2 bg-primary px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition">
          Create Free Account <ArrowRight size={16} />
        </Link>
      </div>

      <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        Ledgerly — built as a full-stack learning project
      </footer>
    </div>
  );
}

export default Landing;