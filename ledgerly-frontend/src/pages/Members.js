import { useEffect, useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Members() {
  const [accountName, setAccountName] = useState('');
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await api.get('/accounts/members');
      setAccountName(res.data.accountName);
      setMembers(res.data.members);
    } catch (err) {
      setError('Failed to load members');
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/accounts/invite', { email });
      setSuccess(res.data.message);
      setEmail('');
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-1">
          <Users size={22} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Account Members</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6">{accountName}</p>

        <form onSubmit={handleInvite} className="bg-surface border border-gray-800 rounded-2xl p-5 mb-6 flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Invite by email (must already have a Ledgerly account)"
            required
            className="flex-1 px-3 py-2.5 bg-ink border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-indigo-500 transition shrink-0"
          >
            <UserPlus size={16} /> Invite
          </button>
        </form>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-3 py-2 rounded-xl mb-4">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm px-3 py-2 rounded-xl mb-4">{success}</div>}

        <div className="bg-surface border border-gray-800 rounded-2xl divide-y divide-gray-800">
          {members.map((m) => (
            <div key={m.userId._id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold flex items-center justify-center text-sm">
                  {m.userId.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{m.userId.name}</p>
                  <p className="text-xs text-gray-500">{m.userId.email}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                m.role === 'owner' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800 text-gray-400'
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Members;