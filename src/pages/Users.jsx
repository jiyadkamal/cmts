import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

import {
    Search,
    Users as UsersIcon,
    Mail,
    Phone,
    Shield,
    UserCheck,
    Calendar,
    MoreVertical,
    Edit2,
    Trash2,
    X,
    Check
} from 'lucide-react'
import { formatDate } from '../utils/helpers'

function Users() {
    const { users, updateUser, deleteUser } = useData()
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [activeMenu, setActiveMenu] = useState(null)
    const [editingUser, setEditingUser] = useState(null)
    const [isSaving, setIsSaving] = useState(false)


    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
            try {
                await deleteUser(userId)
                setActiveMenu(null)
            } catch (err) {
                alert('Failed to delete user: ' + err.message)
            }
        }
    }

    const handleUpdateUser = async (e) => {
        e.preventDefault()
        try {
            setIsSaving(true)
            await updateUser(editingUser)
            setEditingUser(null)
        } catch (err) {
            alert('Failed to update user: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const roleStats = {
        Admin: users.filter(u => u.role === 'Admin').length,
        Engineer: users.filter(u => u.role === 'Engineer').length,
        Contractor: users.filter(u => u.role === 'Contractor').length,
        Client: users.filter(u => u.role === 'Client').length
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return 'primary'
            case 'Engineer': return 'info'
            case 'Contractor': return 'success'
            case 'Client': return 'warning'
            default: return 'neutral'
        }
    }

    const getRoleBgColor = (role) => {
        switch (role) {
            case 'Admin': return 'var(--primary-gradient)'
            case 'Engineer': return 'var(--accent-gradient)'
            case 'Contractor': return 'linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%)'
            case 'Client': return 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)'
            default: return 'var(--neutral-700)'
        }
    }

    return (
        <div className="users-page">
            <style>{`
        .users-page {
          animation: fadeInUp var(--transition-slow) ease-out;
        }
        
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
          gap: var(--space-4);
        }
        
        .page-title-section h1 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }
        
        .page-title-section p {
          color: var(--neutral-400);
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }
        
        @media (max-width: 1200px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .role-stat-card {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          display: flex;
          align-items: center;
          gap: var(--space-4);
          transition: all var(--transition-base);
        }
        
        .role-stat-card:hover {
          border-color: var(--neutral-700);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        
        .role-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: var(--font-size-xs);
          font-weight: 700;
        }
        
        .role-info {
          flex: 1;
        }
        
        .role-count {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--neutral-50);
        }
        
        .role-name {
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
        }
        
        .filters-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }
        
        .search-box {
          flex: 1;
          max-width: 300px;
        }
        
        .filter-select {
          padding: var(--space-3) var(--space-4);
          padding-right: 40px;
          background: var(--neutral-850);
          border: 1px solid var(--neutral-700);
          border-radius: var(--radius-lg);
          color: var(--neutral-100);
          font-size: var(--font-size-sm);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }

        /* Action Menu */
        .actions-dropdown {
          position: absolute;
          top: var(--space-6);
          right: var(--space-6);
          z-index: 10;
        }
        
        .menu-trigger {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--neutral-400);
          cursor: pointer;
          transition: all var(--transition-base);
          background: transparent;
          border: none;
        }
        
        .menu-trigger:hover, .menu-trigger.active {
          background: var(--neutral-800);
          color: var(--neutral-100);
        }
        
        .menu-content {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: var(--space-2);
          background: var(--neutral-900);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-lg);
          padding: var(--space-1);
          min-width: 140px;
          box-shadow: var(--shadow-xl);
          animation: scaleIn 0.2s ease-out;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--neutral-300);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          width: 100%;
          border: none;
          background: transparent;
          text-align: left;
        }
        
        .menu-item:hover {
          background: var(--neutral-800);
          color: var(--neutral-100);
        }
        
        .menu-item.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error-400);
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-4);
        }
        
        .edit-modal {
          background: var(--neutral-900);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-2xl);
          width: 100%;
          max-width: 500px;
          box-shadow: var(--shadow-2xl);
          animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        
        .modal-header {
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--neutral-800);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .modal-header h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          margin: 0;
        }
        
        .close-btn {
          background: transparent;
          border: none;
          color: var(--neutral-500);
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .close-btn:hover {
          color: var(--neutral-100);
        }
        
        .modal-body {
          padding: var(--space-6);
        }
        
        .form-group {
          margin-bottom: var(--space-4);
        }
        
        .form-group label {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--neutral-400);
          margin-bottom: var(--space-2);
        }
        
        .form-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: var(--neutral-850);
          border: 1px solid var(--neutral-700);
          border-radius: var(--radius-lg);
          color: var(--neutral-100);
          font-size: var(--font-size-sm);
          transition: all 0.2s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        
        .modal-footer {
          padding: var(--space-5) var(--space-6);
          border-top: 1px solid var(--neutral-800);
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
        }
        
        .btn {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .btn-ghost {
          background: transparent;
          border: 1px solid var(--neutral-700);
          color: var(--neutral-300);
        }
        
        .btn-ghost:hover {
          background: var(--neutral-800);
          color: var(--neutral-100);
        }
        
        .btn-primary {
          background: var(--primary-gradient);
          border: none;
          color: white;
        }
        
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: var(--space-5);
        }
        
        .user-card {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          transition: all var(--transition-base);
          position: relative;
        }
        
        .user-card:hover {
          border-color: var(--neutral-700);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        
        .user-header {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }
        
        .user-avatar {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: white;
          flex-shrink: 0;
        }
        
        .user-info {
          flex: 1;
          min-width: 0;
        }
        
        .user-name {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--neutral-100);
          margin-bottom: var(--space-1);
        }
        
        .user-department {
          font-size: var(--font-size-sm);
          color: var(--neutral-500);
          margin-bottom: var(--space-2);
        }
        
        .user-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        
        .detail-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--neutral-300);
        }
        
        .detail-row svg {
          color: var(--neutral-500);
          flex-shrink: 0;
        }
        
        .user-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-4);
          border-top: 1px solid var(--neutral-800);
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
        }
        
        .status-dot.active {
          background: var(--success-400);
          animation: pulse 2s infinite;
        }
        
        .status-dot.inactive {
          background: var(--neutral-500);
        }
        
        .joined-date {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
      `}</style>

            {/* Header */}
            <div className="page-header">
                <div className="page-title-section">
                    <h1>User Management</h1>
                    <p>Manage system users and their roles</p>
                </div>

            </div>

            {/* Role Stats */}
            <div className="stats-row">
                <div className="role-stat-card">
                    <div className="role-icon" style={{ background: 'var(--primary-gradient)' }}>
                        <Shield size={24} />
                    </div>
                    <div className="role-info">
                        <div className="role-count">{roleStats.Admin}</div>
                        <div className="role-name">Administrators</div>
                    </div>
                </div>

                <div className="role-stat-card">
                    <div className="role-icon" style={{ background: 'var(--accent-gradient)' }}>
                        <UsersIcon size={24} />
                    </div>
                    <div className="role-info">
                        <div className="role-count">{roleStats.Engineer}</div>
                        <div className="role-name">Engineers</div>
                    </div>
                </div>

                <div className="role-stat-card">
                    <div className="role-icon" style={{ background: 'linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%)' }}>
                        <UserCheck size={24} />
                    </div>
                    <div className="role-info">
                        <div className="role-count">{roleStats.Contractor}</div>
                        <div className="role-name">Contractors</div>
                    </div>
                </div>

                <div className="role-stat-card">
                    <div className="role-icon" style={{ background: 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)' }}>
                        <UsersIcon size={24} />
                    </div>
                    <div className="role-info">
                        <div className="role-count">{roleStats.Client}</div>
                        <div className="role-name">Clients</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Client">Client</option>
                </select>
            </div>

            {/* Users Grid */}
            <div className="users-grid">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="user-card">
                        <div className="user-header">
                            <div className="user-avatar" style={{ background: getRoleBgColor(user.role) }}>
                                {user.avatar}
                            </div>
                            <div className="user-info">
                                <h3 className="user-name">{user.name}</h3>
                                <p className="user-department">{user.department}</p>
                                <span className={`badge badge-${getRoleColor(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>

                            <div className="actions-dropdown">
                                <button
                                    className={`menu-trigger ${activeMenu === user.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveMenu(activeMenu === user.id ? null : user.id)
                                    }}
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {activeMenu === user.id && (
                                    <div className="menu-content" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="menu-item"
                                            onClick={() => {
                                                setEditingUser({ ...user })
                                                setActiveMenu(null)
                                            }}
                                        >
                                            <Edit2 size={16} /> Edit User
                                        </button>
                                        <button
                                            className="menu-item danger"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            <Trash2 size={16} /> Remove User
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="user-details" onClick={() => setActiveMenu(null)}>
                            <div className="detail-row">
                                <Mail size={16} />
                                <span>{user.email}</span>
                            </div>
                            <div className="detail-row">
                                <Phone size={16} />
                                <span>{user.phone}</span>
                            </div>
                        </div>

                        <div className="user-footer" onClick={() => setActiveMenu(null)}>
                            <div className="status-indicator">
                                <div className={`status-dot ${user.status?.toLowerCase() || 'active'}`}></div>
                                <span style={{ color: user.status === 'Active' ? 'var(--success-400)' : 'var(--neutral-400)' }}>
                                    {user.status || 'Active'}
                                </span>
                            </div>
                            <span className="joined-date">
                                <Calendar size={12} />
                                Joined {formatDate(user.joinedAt)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <UsersIcon size={40} />
                    </div>
                    <h3 className="empty-state-title">No users found</h3>
                    <p className="empty-state-description">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit User</h2>
                            <button className="close-btn" onClick={() => setEditingUser(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select
                                            className="form-input"
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Engineer">Engineer</option>
                                            <option value="Contractor">Contractor</option>
                                            <option value="Client">Client</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editingUser.department}
                                            onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        className="form-input"
                                        value={editingUser.status || 'Active'}
                                        onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setEditingUser(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : (
                                        <>
                                            <Check size={16} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users
