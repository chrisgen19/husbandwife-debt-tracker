'use client';

import { useState, useEffect } from 'react';

interface ConnectionRequest {
  id: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  status: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  partnerId?: string | null;
  partner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  receivedRequests?: ConnectionRequest[];
}

interface DebtItem {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  owedBy: string;
  isPaid: boolean;
  createdAt: string;
  paidAt?: string | null;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'register'>('login');
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('');

  // Partner connection form
  const [partnerEmail, setPartnerEmail] = useState('');

  // Edit profile form
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // New debt form
  const [newDebt, setNewDebt] = useState({
    description: '',
    amount: '',
    whoPaid: '',
  });

  const formatPeso = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('user');
      }
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchDebts();
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const fetchDebts = async () => {
    try {
      const res = await fetch('/api/debts');
      const data = await res.json();
      setDebts(data.debts);
    } catch (err) {
      setError('Failed to fetch debts');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          password: regPassword,
          role: regRole,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setRegFirstName('');
        setRegLastName('');
        setRegEmail('');
        setRegPassword('');
        setRegRole('');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          partnerEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Request sent successfully
        setPartnerEmail('');
        alert(data.message || 'Connection request sent!');
      } else {
        setError(data.error || 'Failed to send connection request');
      }
    } catch (err) {
      setError('Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'reject') => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/partner/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === 'accept' && data.user) {
          setUser(data.user);
        } else {
          // Remove the rejected request from the user's receivedRequests
          if (user && user.receivedRequests) {
            setUser({
              ...user,
              receivedRequests: user.receivedRequests.filter(r => r.id !== requestId),
            });
          }
        }
      } else {
        setError(data.error || `Failed to ${action} request`);
      }
    } catch (err) {
      setError(`Failed to ${action} request`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setShowEditProfile(false);
        setEditFirstName('');
        setEditLastName('');
        setEditEmail('');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.partner) return;

    setLoading(true);
    setError('');

    const paidBy = newDebt.whoPaid;
    const owedBy = paidBy === user.id ? user.partner.id : user.id;

    try {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newDebt.description,
          amount: parseFloat(newDebt.amount),
          paidBy,
          owedBy,
        }),
      });

      if (res.ok) {
        setNewDebt({ description: '', amount: '', whoPaid: '' });
        setShowAddForm(false);
        await fetchDebts();
      } else {
        setError('Failed to add debt');
      }
    } catch (err) {
      setError('Failed to add debt');
    } finally {
      setLoading(false);
    }
  };

  const togglePaid = async (debtId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/debts/${debtId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !currentStatus }),
      });

      if (res.ok) {
        await fetchDebts();
      }
    } catch (err) {
      setError('Failed to update debt');
    }
  };

  const calculateBalance = () => {
    if (!user) return 0;

    return debts.reduce((balance, debt) => {
      if (debt.isPaid) return balance;

      if (debt.paidBy === user.id) {
        return balance + debt.amount;
      } else if (debt.owedBy === user.id) {
        return balance - debt.amount;
      }
      return balance;
    }, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setDebts([]);
  };

  const handleRefreshUser = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      } else {
        setError(data.error || 'Failed to refresh user data');
      }
    } catch (err) {
      setError('Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking for saved session
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Login/Register View
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Debt Tracker
          </h1>

          {/* Toggle between Login and Register */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('login')}
              className={`flex-1 py-2 rounded-md transition-colors ${
                view === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setView('register')}
              className={`flex-1 py-2 rounded-md transition-colors ${
                view === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Register
            </button>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select role...</option>
                  <option value="husband">Husband</option>
                  <option value="wife">Wife</option>
                </select>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // If user has no partner, show partner connection
  if (!user.partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {user.firstName}!
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditProfile(!showEditProfile);
                    if (!showEditProfile) {
                      setEditFirstName(user.firstName);
                      setEditLastName(user.lastName);
                      setEditEmail(user.email);
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showEditProfile ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={() => setUser(null)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Edit Profile Form */}
            {showEditProfile && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* Show pending requests if any */}
            {user.receivedRequests && user.receivedRequests.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Connection Requests</h2>
                {user.receivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-green-50 border-l-4 border-green-500 p-4 mb-4"
                  >
                    <p className="text-green-800 font-medium">
                      {request.sender.firstName} {request.sender.lastName} wants to connect with you
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Email: {request.sender.email} • Role: {request.sender.role}
                    </p>
                    {error && (
                      <div className="text-red-500 text-sm mt-2">{error}</div>
                    )}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleRespondToRequest(request.id, 'accept')}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {loading ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRespondToRequest(request.id, 'reject')}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                      >
                        {loading ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Refresh Button */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={handleRefreshUser}
                disabled={loading}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <svg
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? 'Refreshing...' : 'Check for Connection Requests'}
              </button>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-blue-800 font-medium">
                Connect with your {user.role === 'husband' ? 'wife' : 'husband'}
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Send a connection request to your partner by entering their email address.
              </p>
            </div>

            <form onSubmit={handleConnectPartner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner&apos;s Email Address
                </label>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="partner@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Your partner must have the same last name &quot;{user.lastName}&quot; to connect.
                </p>
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Sending Request...' : 'Send Connection Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard with partner connected
  const balance = calculateBalance();
  const unpaidDebts = debts.filter(d => !d.isPaid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {user.firstName}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Connected with {user.partner.firstName} {user.partner.lastName}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditProfile(!showEditProfile);
                  if (!showEditProfile) {
                    setEditFirstName(user.firstName);
                    setEditLastName(user.lastName);
                    setEditEmail(user.email);
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showEditProfile ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Edit Profile Form */}
          {showEditProfile && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                    placeholder="Last Name"
                    disabled
                    title="Cannot change last name while connected to partner"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Last name cannot be changed while connected to a partner
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-2">Current Balance</h2>
            <div className="text-4xl font-bold">
              {formatPeso(Math.abs(balance))}
            </div>
            <div className="text-lg mt-2">
              {balance > 0 && `${user.partner.firstName} owes you`}
              {balance < 0 && `You owe ${user.partner.firstName}`}
              {balance === 0 && 'All settled up!'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Unpaid Items</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {showAddForm ? 'Cancel' : 'Add New'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddDebt} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newDebt.description}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Groceries, Dinner, Gas"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newDebt.amount}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who paid?
                  </label>
                  <select
                    value={newDebt.whoPaid}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, whoPaid: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select...</option>
                    <option value={user.id}>{user.firstName} (You)</option>
                    <option value={user.partner.id}>{user.partner.firstName}</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Adding...' : 'Add Debt'}
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="space-y-3">
            {unpaidDebts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No unpaid items. All settled up!
              </p>
            ) : (
              unpaidDebts.map((debt) => {
                const paidByUser = debt.paidBy === user.id ? user : user.partner!;
                const owedByUser = debt.owedBy === user.id ? user : user.partner!;

                return (
                  <div
                    key={debt.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {debt.description}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {paidByUser.firstName} paid • {owedByUser.firstName} owes
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(debt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-gray-800">
                          {formatPeso(debt.amount)}
                        </div>
                        <button
                          onClick={() => togglePaid(debt.id, debt.isPaid)}
                          className="mt-2 text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Payment History
          </h2>
          <div className="space-y-3">
            {debts.filter(d => d.isPaid).length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No payment history yet
              </p>
            ) : (
              debts
                .filter(d => d.isPaid)
                .map((debt) => {
                  const paidByUser = debt.paidBy === user.id ? user : user.partner!;
                  const owedByUser = debt.owedBy === user.id ? user : user.partner!;

                  return (
                    <div
                      key={debt.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-600">
                            {debt.description}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {paidByUser.firstName} paid • {owedByUser.firstName} owed
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Paid on: {debt.paidAt ? new Date(debt.paidAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-gray-600">
                            {formatPeso(debt.amount)}
                          </div>
                          <span className="text-xs text-green-600 font-semibold">
                            ✓ PAID
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
