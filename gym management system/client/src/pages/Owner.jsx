import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Uncomment this when you are ready to fetch data
import { useAuth } from '../context/AuthContext'; 
import './owner.css';

const OwnerDashboard = () => {
    const { user, token } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false); // Set to false for now

    /* // --- START: FETCHING LOGIC (UNCOMMENT AFTER BACKEND IS READY) ---
    useEffect(() => {
        if (user && user.role === 'owner') {
            fetchMemberData();
        }
    }, [user]);

    const fetchMemberData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/owner/members', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(response.data);
        } catch (error) {
            console.error("Error loading gym data:", error);
        } finally {
            setLoading(false);
        }
    };
    // --- END: FETCHING LOGIC ---
    */

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
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m, i) => (
                                        <tr key={i}>
                                            <td>{m.name}</td>
                                            <td>{m.phone}</td>
                                            <td>{m.plan}</td>
                                            <td>{m.status}</td>
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