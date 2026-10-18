import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/fetch-users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u.username || '';
    const email = u.email || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Users</h1>
          <p className="page-subtitle">Directory of all registered customers and administrators</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h4 className="h5 fw-bold mb-0">Total Accounts: {users.length}</h4>
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: '280px' }}
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-5 text-center text-muted">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-5 text-center text-muted">No users found.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table mb-0">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Wallet Balance</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="fw-semibold text-dark">{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.usertype === 'admin'
                            ? 'bg-danger text-white'
                            : 'bg-primary-subtle text-primary'
                        }`}
                      >
                        {u.usertype}
                      </span>
                    </td>
                    <td className="fw-bold">${Number(u.balance || 0).toLocaleString()}</td>
                    <td className="font-monospace text-muted small">{u._id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
