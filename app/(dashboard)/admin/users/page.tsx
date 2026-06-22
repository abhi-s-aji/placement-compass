'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, UserRole } from '@/lib/types';
import { formatDate } from '@/lib/score';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data as Profile[]);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    setUpdatingId(`${userId}:status`);
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', userId);

    if (error) {
      console.error('Failed to toggle status:', error);
      setUpdatingId(null);
      return;
    }

    startTransition(() => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: newStatus } : u))
      );
      setUpdatingId(null);
    });
  }

  async function handleChangeRole(userId: string, newRole: UserRole) {
    setUpdatingId(`${userId}:role`);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Failed to change role:', error);
      setUpdatingId(null);
      return;
    }

    startTransition(() => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setUpdatingId(null);
    });
  }

  const filteredUsers = users.filter((u) => {
    const fullName = (u.full_name || '').toLowerCase();
    const email = u.email.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.is_active) ||
      (statusFilter === 'inactive' && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">User Management</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="card mb-6 flex gap-4 items-center flex-wrap">
          {/* Search bar */}
          <div className="form-group" style={{ flex: 2, minWidth: 240 }}>
            <input
              type="text"
              className="input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Role filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
            <select
              className="input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="mentor">Mentors</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Directory List */}
        {filteredUsers.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No users found</div>
            <div className="empty-state-description">Try adjusting your filters or query.</div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>USER</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ROLE</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>REGISTERED</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const initials = (u.full_name || u.email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const isUpdatingStatus = updatingId === `${u.id}:status`;
                  const isUpdatingRole = updatingId === `${u.id}:role`;

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }} className="table-row-hover">
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div className="flex items-center gap-3">
                          <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: 'var(--font-size-xs)' }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{u.full_name || 'N/A'}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <select
                          className="input"
                          value={u.role}
                          disabled={isUpdatingRole}
                          onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                          style={{ cursor: 'pointer', padding: '4px var(--space-2)', fontSize: 'var(--font-size-xs)', width: 'auto' }}
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-muted'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>{formatDate(u.created_at)}</td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.is_active)}
                          disabled={isUpdatingStatus}
                          className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                        >
                          {isUpdatingStatus ? (
                            <span className="spinner spinner-sm" style={{ border: '2px solid var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
                          ) : u.is_active ? (
                            'Deactivate'
                          ) : (
                            'Activate'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
