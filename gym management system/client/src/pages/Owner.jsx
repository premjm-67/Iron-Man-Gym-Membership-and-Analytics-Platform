import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; 
import './owner.css';

const OwnerDashboard = () => {
    const { user, token } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, revenue: 0 });

    // --- START: FETCHING LOGIC ---
    const fetchMemberData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/owner/members', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMembers(data.members);
                
                // Calculate stats
                const activeMembers = data.members.filter(m => m.subscription?.status === 'active').length;
                const expiredMembers = data.members.filter(m => m.subscription?.status === 'expired').length;

                // Prices may come as strings with currency symbol (e.g. "₹3,999").
                // Normalize to numeric values before summing to avoid string concatenation
                const totalRevenue = data.members.reduce((sum, m) => {
                    const raw = m.subscription?.price ?? 0;
                    if (typeof raw === 'string') {
                        const n = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
                        return sum + n;
                    }
                    return sum + Number(raw || 0);
                }, 0);

                setStats({
                    total: data.members.length,
                    active: activeMembers,
                    expired: expiredMembers,
                    revenue: totalRevenue
                });
            }
        } catch (error) {
            console.error("Error loading gym data:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (user && user.role === 'owner' && token) {
            fetchMemberData();
            const interval = setInterval(fetchMemberData, 30000);
            return () => clearInterval(interval);
        }
    }, [user, token, fetchMemberData]);

    // Security Check
    if (!user || user.role !== 'owner') {
        return (
            <div className="unauthorized-container">
                <h2>Access Denied</h2>
                <p>You do not have the required permissions to view the Owner Dashboard.</p>
            </div>
        );
    }

    if (loading) return <div className="loading-spinner">Loading Gym Records...</div>;

    return (
        <div className="owner-container">
            <header className="owner-header">
                <div className="owner-welcome">
                    <h1>Gym Admin Panel</h1>
                    <p>Logged in as: <strong>{user.name}</strong></p>
                </div>
                
                {/* STATS DISPLAY */}
                <div className="stats-container">
                    <div className="stat-box">
                        <span className="stat-icon">👥</span>
                        <div className="stat-content">
                            <span className="stat-label">Total Members</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>
                    <div className="stat-box">
                        <span className="stat-icon">✓</span>
                        <div className="stat-content">
                            <span className="stat-label">Active</span>
                            <span className="stat-value">{stats.active}</span>
                        </div>
                    </div>
                    <div className="stat-box">
                        <span className="stat-icon">⚠️</span>
                        <div className="stat-content">
                            <span className="stat-label">Expired</span>
                            <span className="stat-value">{stats.expired}</span>
                        </div>
                    </div>
                    <div className="stat-box revenue">
                        <span className="stat-icon">💰</span>
                        <div className="stat-content">
                                <span className="stat-label">Revenue</span>
                                <span className="stat-value">₹{new Intl.NumberFormat('en-IN').format(stats.revenue)}</span>
                            </div>
                    </div>
                </div>
                
                <button className="refresh-btn" onClick={fetchMemberData} disabled={loading}>
                    {loading ? 'Loading...' : '🔄 Refresh'}
                </button>
            </header>

            <main className="owner-main">
                <div className="data-card">
                    <div className="card-header">
                        <h2>Member Directory</h2>
                    </div>

                    {members.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏋️</div>
                            <h3>No Active Members Yet</h3>
                            <p>Your dashboard is ready! Once members register, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="member-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Plan</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member, i) => (
                                        <tr key={i}>
                                            <td>{member.firstName} {member.lastName}</td>
                                            <td>{member.phone}</td>
                                            <td>{member.subscription?.title || 'N/A'}</td>
                                            <td>{member.subscription?.startDate ? new Date(member.subscription.startDate).toLocaleDateString() : 'N/A'}</td>
                                            <td>{member.subscription?.endDate ? new Date(member.subscription.endDate).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge ${member.subscription?.status || 'inactive'}`}>
                                                    {member.subscription?.status || 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="amount-text">{typeof member.subscription?.price === 'string' ? member.subscription.price : `₹${member.subscription?.price || 0}`}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OwnerDashboard;