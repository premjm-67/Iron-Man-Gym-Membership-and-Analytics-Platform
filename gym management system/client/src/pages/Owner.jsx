import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios'; // Uncomment this when you are ready to fetch data
import { useAuth } from '../context/AuthContext'; 
import './owner.css';

const OwnerDashboard = () => {
    const { user, token } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- START: FETCHING LOGIC ---
    const fetchMemberData = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Fetching member data with token:', token);
            const response = await fetch('http://localhost:5000/api/owner/members', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('API Response:', data);
            if (data.success) {
                setMembers(data.members);
            } else {
                console.error('API Error:', data.message);
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
            
            // Auto-refresh every 30 seconds
            const interval = setInterval(fetchMemberData, 30000);
            return () => clearInterval(interval);
        }
    }, [user, token, fetchMemberData]);
    // --- END: FETCHING LOGIC ---

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
                <div className="stats-badge">
                    <span className="stats-count">{members.length}</span>
                    <span className="stats-label">Total Members</span>
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
                            <div className="empty-icon-wrapper">
                                <span className="empty-icon">🏋️‍♂️</span>
                            </div>
                            <h3>No Active Members Yet</h3>
                            <p>
                                Your dashboard is ready! Once you uncomment the fetching logic 
                                and connect your backend, member data will appear here.
                            </p>
                            <button className="refresh-btn">
                                Refresh Data
                            </button>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member, i) => (
                                        <tr key={i}>
                                            <td>{member.firstName} {member.lastName}</td>
                                            <td>{member.phone}</td>
                                            <td>{member.subscription.title}</td>
                                            <td>{new Date(member.subscription.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(member.subscription.endDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${member.subscription.status}`}>
                                                    {member.subscription.status}
                                                </span>
                                            </td>
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