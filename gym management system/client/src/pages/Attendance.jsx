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

  // Add some CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .dash-card {
        animation: fadeInUp 0.6s ease-out;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .dash-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Check if user has active subscription (status active AND not expired)
  const hasActiveSubscription = user?.subscription &&
    user.subscription.status === 'active' &&
    new Date(user.subscription.endDate) > new Date();

  useEffect(() => {
    if (hasActiveSubscription) {
      loadAttendanceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveSubscription]);

  const loadAttendanceData = () => {
    // Load from localStorage
    const stored = localStorage.getItem(`attendance_${user.id}`);
    if (stored) {
      const data = JSON.parse(stored);
      setAttendanceData(data.dates || []);
      setCurrentStreak(data.currentStreak || 0);
      setMaxStreak(data.maxStreak || 0);
      setTodayAttended(data.todayAttended || false);
    } else {
      // Initialize empty
      setAttendanceData([]);
      setCurrentStreak(0);
      setMaxStreak(0);
      setTodayAttended(false);
    }
  };

  const saveAttendanceData = (dates, currStreak, maxStrk, todayAtt) => {
    const data = {
      dates,
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
    
    setAttendanceData(newDates);
    setCurrentStreak(newStreak);
    setMaxStreak(newMaxStreak);
    setTodayAttended(true);
    
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
      <div className="dashboard-view">
        <nav className="dash-nav">
          <div className="nav-left" onClick={() => navigate("/dashboard")} style={{cursor: 'pointer'}}>
            ← <span className="user-name">Back to Dashboard</span>
          </div>
          <div className="nav-center">IRON MAN FITNESS STUDIO</div>
          <div className="nav-right">
            <button className="logout-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
          </div>
        </nav>
        
        <header className="dash-hero">
          <h1>Attendance <span className="text-gradient">Tracker</span></h1>
          <div className="status-container">
            <div className="status-inactive">
              <span className="status-badge inactive">○ Subscription Required</span>
              <button className="activate-cta" onClick={() => navigate("/members")}>Activate Plan</button>
            </div>
          </div>
        </header>

        <footer className="dash-footer-branded">
          <p>IRON MAN FITNESS STUDIO • GLOBAL PERFORMANCE LABS</p>
        </footer>
      </div>
    );
  }

  const subscriptionData = getSubscriptionData();

  // Group data by weeks for the heatmap
  const weeks = [];
  let currentWeek = [];
  let weekStartDay = subscriptionData[0]?.dayOfWeek || 0; // Start with the first day of subscription

  // Add empty cells for days before the subscription starts
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

  // Fill the last week with nulls if needed
  while (currentWeek.length < 7) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="dashboard-view">
      {/* NAVIGATION */}
      <nav className="dash-nav">
        <div className="nav-left" onClick={() => navigate("/dashboard")} style={{cursor: 'pointer'}}>
          ← <span className="user-name">Back to Dashboard</span>
        </div>
        <div className="nav-center">IRON MAN FITNESS STUDIO</div>
        <div className="nav-right">
          <button className="logout-btn" onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </nav>

      {/* HERO SECTION WITH STREAK */}
      <header className="dash-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#24292f' }}>
              Attendance <span style={{ color: '#0366d6' }}>Tracker</span>
            </h1>
            <p style={{ fontSize: '16px', color: '#586069', margin: 0 }}>
              Track your gym visits and maintain your fitness streak
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {currentStreak >= 7 && (
                <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                  🔥 Week Warrior
                </span>
              )}
              {currentStreak >= 30 && (
                <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                  💪 Month Master
                </span>
              )}
              {maxStreak >= 50 && (
                <span style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                  🏆 Legend
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '16px', minWidth: '200px', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔥</div>
            <h2 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 'bold' }}>{currentStreak}</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '12px' }}>Current Streak</p>
            <div style={{ marginTop: '12px', width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
              <div style={{ width: `${Math.min((currentStreak / 7) * 100, 100)}%`, height: '100%', background: 'white', borderRadius: '2px', transition: 'width 0.5s ease' }}></div>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '10px', opacity: 0.8 }}>{7 - (currentStreak % 7)} days to next badge</p>
          </div>
        </div>
      </header>

      {/* MOTIVATIONAL MESSAGE */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5% 20px' }}>
        <div className="dash-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center', padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
            {currentStreak === 0 ? "Start Your Journey Today! 💪" :
             currentStreak < 7 ? "Keep the Momentum Going! 🔥" :
             currentStreak < 30 ? "You're on Fire! 🚀" :
             "Unstoppable! 🏆"}
          </h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
            {currentStreak === 0 ? "Every great journey begins with a single step. Mark your first attendance!" :
             currentStreak < 7 ? "You're building great habits. Stay consistent!" :
             currentStreak < 30 ? "Consistency is paying off. You're becoming stronger every day!" :
             "Your dedication is inspiring. Keep pushing your limits!"}
          </p>
        </div>
      </div>

      {/* HEATMAP SECTION - MAIN FEATURE */}
      <div style={{ maxWidth: '1200px', margin: '40px auto 40px', padding: '0 5%' }}>
        <div className="dash-card" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#24292f' }}>
              Subscription Activity
            </h2>
            <p style={{ fontSize: '14px', color: '#586069', margin: '0 0 12px 0' }}>
              {subscriptionData.length} days • {new Date(user.subscription.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(user.subscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Heatmap Grid - LARGER SQUARES */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    title={day ? `${day.date}: ${day.attended ? 'Attended' : 'Missed'}` : ''}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '3px',
                      background: day ? getIntensityColor(day.attended, day.isToday) : '#f0f0f0',
                      border: day?.isToday ? '2px solid #e36209' : 'none',
                      cursor: day ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      boxShadow: day ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (day) {
                        e.target.style.transform = 'scale(1.3)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (day) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #ebedf0', display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#586069', fontWeight: '500' }}>Less</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: '#ebedf0', border: '1px solid #d1d9e0' }} title="No activity"></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: '#c6e48b' }} title="Low activity"></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: '#7bc96f' }} title="Medium activity"></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: '#196c2e' }} title="High activity"></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: '#e36209', border: '1px solid #d97706' }} title="Today"></div>
            </div>
            <span style={{ fontSize: '11px', color: '#586069', fontWeight: '500' }}>More</span>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <main className="dash-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5% 40px' }}>
        <div className="dash-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
          <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>{maxStreak}</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '12px' }}>Max Streak</p>
        </div>

        <div className="dash-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
          <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>{attendanceData.length}</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '12px' }}>Total Visits</p>
        </div>

        {/* MONTHLY PROGRESS */}
        <div className="dash-card" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#1f2937', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
            {Math.round((attendanceData.filter(date => {
              const d = new Date(date);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%
          </h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '12px' }}>This Month</p>
          <div style={{ marginTop: '12px', width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px' }}>
            <div style={{ 
              width: `${Math.round((attendanceData.filter(date => {
                const d = new Date(date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%`, 
              height: '100%', 
              background: '#10b981', 
              borderRadius: '3px', 
              transition: 'width 0.5s ease' 
            }}></div>
          </div>
        </div>

        {/* MARK ATTENDANCE BUTTON */}
        <div className="dash-card" style={{ background: todayAttended ? '#059669' : '#ef4444', color: 'white', textAlign: 'center', cursor: todayAttended ? 'default' : 'pointer', opacity: todayAttended ? 0.7 : 1, gridColumn: 'span 2' }}>
          <button 
            onClick={markAttendance}
            disabled={todayAttended}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: todayAttended ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '28px' }}>{todayAttended ? '✓' : '📍'}</div>
            {todayAttended ? 'Attended Today' : 'Mark Attendance'}
          </button>
        </div>
      </main>



      {/* FOOTER */}
      <footer className="dash-footer-branded">
        <p>IRON MAN FITNESS STUDIO • GLOBAL PERFORMANCE LABS</p>
      </footer>
    </div>
  );
}
