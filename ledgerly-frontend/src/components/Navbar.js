import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkClass = (path) =>
    `text-sm font-medium px-3 py-2 rounded-lg transition ${
      location.pathname === path ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="bg-ink border-b border-gray-800 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-semibold text-white">Ledgerly</span>
          </Link>
          <div className="hidden sm:flex gap-1">
            <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
            <Link to="/history" className={linkClass('/history')}>History</Link>
            <Link to="/goals" className={linkClass('/goals')}>Goals</Link>
            <Link to="/trends" className={linkClass('/trends')}>Trends</Link>
            <Link to="/members" className={linkClass('/members')}>Members</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/add-transaction" className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-500 transition">
            + Add
          </Link>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;