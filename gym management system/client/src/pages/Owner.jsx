import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './owner.css';

const OwnerDashboard = () => {
    const { user, token, logout } = useAuth();
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
        <div className="owner-view">
            <nav className="trainer-nav">
                <div className="nav-left">
                    <span className="user-name">Owner Panel</span>
                </div>
                <div className="nav-center">IRON MAN FITNESS STUDIO</div>
                <div className="nav-right">
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </nav>

            <header className="hero-compact">
                <h1>Gym <span className="text-gradient">Admin Panel</span></h1>
                <p>Monitor your gym's performance and member activity</p>
            </header>

            <main className="trainers-grid-small">
                <StatCard
                    title="Total Members"
                    value={stats.total}
                    icon="👥"
                    color="#4f46e5"
                />
                <StatCard
                    title="Active Members"
                    value={stats.active}
                    icon="✓"
                    color="#10b981"
                />
                <StatCard
                    title="Expired Members"
                    value={stats.expired}
                    icon="⚠️"
                    color="#f59e0b"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${new Intl.NumberFormat('en-IN').format(stats.revenue)}`}
                    icon="💰"
                    color="#ef4444"
                />
            </main>

            <div className="owner-main">
                <div className="data-card">
                    <div className="card-header">
                        <h2>Member Directory</h2>
                        <button className="refresh-btn" onClick={fetchMemberData} disabled={loading}>
                            {loading ? 'Loading...' : '🔄 Refresh'}
                        </button>
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
            </div>

            <footer className="mini-footer-branded">
                <p>IRON MAN FITNESS STUDIO • ADMIN PANEL</p>
            </footer>
        </div>
    );
};

function StatCard({ title, value, icon, color }) {
    return (
        <div className="trainer-mini-card">
            <div className="mini-card-top">
                <span className="mini-spec" style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}>
                    {title.toUpperCase()}
                </span>
                <div style={{ fontSize: '32px', margin: '10px 0' }}>{icon}</div>
            </div>

            <div className="mini-card-meta">
                <div className="meta-row">
                    <span className="label">Current:</span>
                    <span className="value">{value}</span>
                </div>
            </div>
        </div>
    );
}

export default OwnerDashboard;