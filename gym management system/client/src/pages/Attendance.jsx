import "./attendance.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [todayAttended, setTodayAttended] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [showMonthChart, setShowMonthChart] = useState(false);

  // Modern SaaS CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }
        50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.4); }
      }
      .saas-container {
        animation: fadeInUp 0.6s ease-out;
      }
      .saas-card {
        animation: fadeInUp 0.6s ease-out;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
      }
      .saas-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
      }
      .streak-glow {
        animation: glow 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Check if user has active subscription (status active AND not expired)
  const hasActiveSubscription = user?.subscription &&
    user.subscription.status === 'active' &&
    new Date(user.subscription.endDate) > new Date();

  // Load attendance data only once when component mounts
  useEffect(() => {
    if (user?.id && hasActiveSubscription) {
      const stored = localStorage.getItem(`attendance_${user.id}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setAttendanceData(data.dates || []);
          setCurrentStreak(data.currentStreak || 0);
          setMaxStreak(data.maxStreak || 0);
          setTodayAttended(data.todayAttended || false);
        } catch (e) {
          console.error('Error loading attendance data:', e);
        }
      }
    }
  }, [user?.id, hasActiveSubscription]);

  const saveAttendanceData = (dates, currStreak, maxStrk, todayAtt) => {
    if (!user?.id) return;
    const data = {
      dates: dates,
      currentStreak: currStreak,
      maxStreak: maxStrk,
      todayAttended: todayAtt,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`attendance_${user.id}`, JSON.stringify(data));
  };

  const markAttendance = () => {
    if (todayAttended) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Only add if not already included
    if (attendanceData.includes(today)) {
      return;
    }

    const newDates = [...attendanceData, today].sort();
    
    // Calculate new streak
    let newStreak = 1;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (attendanceData.includes(yesterdayStr)) {
      newStreak = currentStreak + 1;
    }
    
    const newMaxStreak = Math.max(maxStreak, newStreak);
    
    // Update state
    setAttendanceData(newDates);
    setCurrentStreak(newStreak);
    setMaxStreak(newMaxStreak);
    setTodayAttended(true);
    
    // Save to localStorage
    saveAttendanceData(newDates, newStreak, newMaxStreak, true);
  };

  const getSubscriptionData = () => {
    if (!user?.subscription) return [];

    const subscriptionData = [];
    const startDate = new Date(user.subscription.startDate);
    const endDate = new Date(user.subscription.endDate);
    const today = new Date().toISOString().split('T')[0];

    // Get all days of the subscription period
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const attended = attendanceData.includes(dateStr);
      const isToday = dateStr === today;

      subscriptionData.push({
        date: dateStr,
        attended,
        isToday,
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
        day: date.getDate()
      });
    }

    return subscriptionData;
  };

  const getIntensityColor = (attended, isToday = false) => {
    if (isToday) return '#e36209'; // LeetCode orange for today
    if (attended) return '#196c2e'; // LeetCode green for attended
    return '#ebedf0'; // LeetCode light gray for missed
  };

  if (!hasActiveSubscription) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <nav style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate("/dashboard")}>← Dashboard</div>
          <div style={{ color: '#cbd5e1', fontSize: '14px' }}>IRON MAN FITNESS STUDIO</div>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate("/dashboard")}>Menu</button>
        </nav>
        
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📅</div>
            <h1 style={{ color: '#e2e8f0', fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>Subscription Required</h1>
            <p style={{ color: '#cbd5e1', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>You need an active subscription to track your attendance. Activate a plan to get started with your fitness journey.</p>
            <button onClick={() => navigate("/members")} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
              Activate Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subscriptionData = getSubscriptionData();

  // Group data by weeks for the heatmap
  const weeks = [];
  let currentWeek = [];
  let weekStartDay = subscriptionData[0]?.dayOfWeek || 0;

  for (let i = 0; i < weekStartDay; i++) {
    currentWeek.push(null);
  }

  subscriptionData.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  while (currentWeek.length < 7) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }} className="saas-container">
      {/* NAVIGATION */}
      <nav style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate("/dashboard")}>← Dashboard</div>
        <h1 style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '600', letterSpacing: '2px' }}>IRON MAN FITNESS</h1>
        <button onClick={() => navigate("/profile")} style={{ background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)', color: '#cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(148, 163, 184, 0.2)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(148, 163, 184, 0.1)'; }}>Profile</button>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* HERO SECTION */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '42px', fontWeight: '700', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>
                Attendance Tracker
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '16px', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.6' }}>
                Monitor your gym consistency and build unstoppable fitness habits. Every visit brings you closer to your goals.
              </p>
              
              {/* Achievement Badges */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {currentStreak >= 7 && (
                  <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fbbf24', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔥 Week Warrior ({currentStreak} days)
                  </div>
                )}
                {currentStreak >= 30 && (
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#d8b4fe', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💪 Month Master ({currentStreak} days)
                  </div>
                )}
                {maxStreak >= 50 && (
                  <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#f472b6', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏆 Legend ({maxStreak} days)
                  </div>
                )}
              </div>
            </div>

            {/* STREAK CARD */}
            <div className="saas-card streak-glow" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '32px', borderRadius: '16px', maxWidth: '300px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</div>
              <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Streak</p>
              <h2 style={{ fontSize: '48px', fontWeight: '700', color: '#e0e7ff', marginBottom: '16px' }}>{currentStreak}</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>You're crushing it! Keep it up.</p>
              <div style={{ width: '100%', height: '6px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((currentStreak / 7) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
              </div>
              <p style={{ color: '#64748b', fontSize: '12px', marginTop: '12px' }}>
                {7 - (currentStreak % 7)} days to next milestone
              </p>
            </div>
          </div>
        </div>

        {/* MOTIVATION BANNER */}
        <div className="saas-card" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '24px 32px', borderRadius: '12px', marginBottom: '40px', color: '#e0e7ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '28px' }}>
              {currentStreak === 0 ? '💪' :
               currentStreak < 7 ? '🚀' :
               currentStreak < 30 ? '⚡' :
               '🏆'}
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
                {currentStreak === 0 ? "Start Your Journey Today!" :
                 currentStreak < 7 ? "You're Just Getting Started!" :
                 currentStreak < 30 ? "You're On Fire! 🔥" :
                 "You're Unstoppable!"}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                {currentStreak === 0 ? "Every champion began with their first step. Mark your attendance now." :
                 currentStreak < 7 ? "Consistency is the key to success. Stay focused." :
                 currentStreak < 30 ? "Your dedication shows. Keep pushing harder every day." :
                 "Incredible dedication. You're setting the standard for excellence."}
              </p>
            </div>
          </div>
        </div>

        {/* HEATMAP SECTION */}
        <div className="saas-card" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', padding: '40px', borderRadius: '16px', marginBottom: '40px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>Activity Heatmap</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
              {subscriptionData.length} days • {new Date(user.subscription.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(user.subscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>

          {/* HEATMAP GRID - improved: weekday labels + larger squares + smoother hover */}
          <div style={{ overflowX: 'auto', marginBottom: '32px', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content', paddingRight: '20px', alignItems: 'flex-start' }}>
              {/* Weekday labels column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px', marginRight: '6px' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                  <div key={d} style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#94a3b8', fontSize: '12px', width: '36px' }}>{d}</div>
                ))}
              </div>

              {/* Weeks */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        title={day ? `${day.date}: ${day.attended ? '✓ Attended' : '○ Missed'}` : ''}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: !day ? '#1f2a44' : day.isToday ? '#fb923c' : day.attended ? '#10b981' : '#2b3a57',
                          border: day?.isToday ? '2px solid rgba(249,115,22,0.9)' : '1px solid rgba(148, 163, 184, 0.06)',
                          cursor: day ? 'pointer' : 'default',
                          transition: 'transform 0.18s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.18s',
                          boxShadow: day ? (day.isToday ? '0 0 18px rgba(249, 115, 22, 0.5)' : day.attended ? '0 0 14px rgba(16, 185, 129, 0.28)' : 'none') : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#e2e8f0'
                        }}
                        onMouseEnter={(e) => {
                          if (day) {
                            e.currentTarget.style.transform = 'translateY(-6px) scale(1.08)';
                            e.currentTarget.style.boxShadow = day.isToday ? '0 8px 30px rgba(249, 115, 22, 0.6)' : day.attended ? '0 8px 28px rgba(16, 185, 129, 0.35)' : '0 6px 20px rgba(99, 102, 241, 0.12)';
                            e.currentTarget.style.background = day.isToday ? '#fb923c' : day.attended ? '#34d399' : '#475569';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (day) {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = day.isToday ? '0 0 18px rgba(249, 115, 22, 0.5)' : day.attended ? '0 0 14px rgba(16, 185, 129, 0.28)' : 'none';
                            e.currentTarget.style.background = day.isToday ? '#f97316' : day.attended ? '#10b981' : '#2b3a57';
                          }
                        }}
                      >
                        {day?.isToday ? '▶' : day?.attended ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LEGEND */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Less Active</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#27324d', border: '1px solid rgba(148, 163, 184, 0.1)' }}></div>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#475569' }}></div>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#059669' }}></div>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#10b981', boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)' }}></div>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#f97316', border: '1px solid #fb923c', boxShadow: '0 0 12px rgba(249, 115, 22, 0.5)' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>More Active / Today</span>
          </div>
        </div>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Max Streak Card */}
          <div className="saas-card" style={{ background: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏅</div>
            <p style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Max Streak</p>
            <h3 style={{ fontSize: '36px', fontWeight: '700', color: '#d8b4fe', margin: 0 }}>{maxStreak}</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>Your best performance</p>
          </div>

          {/* Total Visits Card */}
          <div className="saas-card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <p style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Total Visits</p>
            <h3 style={{ fontSize: '36px', fontWeight: '700', color: '#93c5fd', margin: 0 }}>{attendanceData.length}</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>During subscription</p>
          </div>

          {/* Monthly Progress Card */}
          <div className="saas-card" onClick={() => setShowMonthChart(true)} style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(52, 211, 153, 0.15)', padding: '24px', borderRadius: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📈</div>
            <p style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>This Month</p>
            <h3 style={{ fontSize: '36px', fontWeight: '700', color: '#6ee7b7', margin: 0 }}>
              {Math.round((attendanceData.filter(date => {
                const d = new Date(date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%
            </h3>
            <div style={{ width: '100%', height: '4px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.round((attendanceData.filter(date => {
                const d = new Date(date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '2px', transition: 'width 0.5s ease' }}></div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '8px', fontStyle: 'italic' }}>Click to view chart</p>
          </div>
        </div>

        {/* MARK ATTENDANCE BUTTON */}
        <button
          onClick={markAttendance}
          disabled={todayAttended}
          style={{
            width: '100%',
            background: todayAttended ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: todayAttended ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.5)',
            color: todayAttended ? '#10b981' : '#fff',
            padding: '20px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: todayAttended ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: todayAttended ? 'none' : '0 12px 24px rgba(99, 102, 241, 0.3)',
            opacity: todayAttended ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!todayAttended) {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!todayAttended) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.3)';
            }
          }}
        >
          <span style={{ fontSize: '24px' }}>{todayAttended ? '✓' : '📍'}</span>
          <span>{todayAttended ? 'Attended Today' : 'Mark Attendance'}</span>
        </button>
      </main>

      {/* MONTH CHART MODAL */}
      {showMonthChart && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '16px', padding: '40px', maxWidth: '900px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ color: '#e2e8f0', fontSize: '28px', fontWeight: '700', margin: 0 }}>Monthly Activity Chart</h2>
              <button onClick={() => setShowMonthChart(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '28px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Stock-style chart */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ height: '300px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '2px', paddingBottom: '20px' }}>
                {(() => {
                  const now = new Date();
                  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  const monthAttendance = attendanceData.filter(date => {
                    const d = new Date(date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  });

                  return Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(now.getFullYear(), now.getMonth(), day).toISOString().split('T')[0];
                    const attended = monthAttendance.includes(dateStr);
                    const height = attended ? 80 : 20;

                    return (
                      <div
                        key={day}
                        style={{
                          flex: 1,
                          height: height + '%',
                          background: attended ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : 'rgba(99, 102, 241, 0.1)',
                          borderRadius: '4px 4px 0 0',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: attended ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none'
                        }}
                        title={`Day ${day}: ${attended ? 'Attended ✓' : 'Not attended'}`}
                        onMouseEnter={(e) => {
                          e.target.style.opacity = '0.8';
                          e.target.style.transform = 'scaleY(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '1';
                          e.target.style.transform = 'scaleY(1)';
                        }}
                      />
                    );
                  });
                })()}
              </div>

              {/* X-axis labels */}
              <div style={{ display: 'flex', gap: '2px', fontSize: '10px', color: '#64748b', textAlign: 'center' }}>
                {(() => {
                  const now = new Date();
                  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  return Array.from({ length: daysInMonth }, (_, i) => (
                    (i + 1) % 5 === 0 ? <div key={i} style={{ flex: 1 }}>{i + 1}</div> : <div key={i} style={{ flex: 1 }}></div>
                  ));
                })()}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '16px', borderRadius: '8px' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0' }}>Days Attended</p>
                <h3 style={{ color: '#10b981', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                  {attendanceData.filter(date => {
                    const d = new Date(date);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length}
                </h3>
              </div>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(129, 140, 248, 0.3)', padding: '16px', borderRadius: '8px' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0' }}>Days Missed</p>
                <h3 style={{ color: '#6366f1', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                  {(() => {
                    const now = new Date();
                    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                    const attended = attendanceData.filter(date => {
                      const d = new Date(date);
                      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length;
                    return daysInMonth - attended;
                  })()}
                </h3>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', padding: '16px', borderRadius: '8px' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0' }}>Consistency</p>
                <h3 style={{ color: '#3b82f6', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                  {Math.round((attendanceData.filter(date => {
                    const d = new Date(date);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
