import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import "./attendance.css";

export default function Attendance() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [showMonthChart, setShowMonthChart] = useState(false);

  const hasMembership = !!(user?.subscription && user.subscription.status === 'active' && new Date(user.subscription.endDate) > new Date());

  // Fetch attendance data
  useEffect(() => {
    if (user?.id && hasMembership && token) {
      fetchAttendanceData();
    }
  }, [user?.id, hasMembership, token]);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/members/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const dates = data.attendance || [];
        setAttendanceData(dates);
        calculateStats(dates);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const calculateStats = (dates) => {
    // Total visits
    setTotalVisits(dates.length);

    // Monthly count
    const now = new Date();
    const monthlyDates = dates.filter(date => {
      const d = new Date(date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    setMonthlyCount(monthlyDates.length);

    // Calculate streaks
    if (dates.length === 0) {
      setCurrentStreak(0);
      setMaxStreak(0);
      return;
    }

    const sortedDates = [...dates].sort();
    let currentStrk = 1;
    let maxStrk = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        currentStrk++;
        maxStrk = Math.max(maxStrk, currentStrk);
      } else {
        currentStrk = 1;
      }
    }

    // Check if today continues current streak
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');

    if (sortedDates.includes(yesterdayStr) || sortedDates.includes(todayStr)) {
      // Streak continues or is today
    } else {
      currentStrk = 0;
    }

    setCurrentStreak(currentStrk);
    setMaxStreak(maxStrk);
  };

  // Mark attendance for today ONLY
  const markAttendance = async () => {
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    if (attendanceData.includes(todayStr)) {
      return; // Already marked for today
    }

    try {
      const response = await fetch('http://localhost:5000/api/members/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: todayStr })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceData(data.attendance || []);
          calculateStats(data.attendance || []);
        }
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  // Generate heatmap weeks
  const getHeatmapWeeks = () => {
    if (!user?.subscription) return [];

    const startDate = new Date(user.subscription.startDate);
    const endDate = new Date(user.subscription.endDate);
    const weeks = [];
    let currentWeek = [];
    let current = new Date(startDate);
    const startDay = current.getDay();

    // Fill initial empty days
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }

    while (current <= endDate) {
      const dateStr = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0');
      const isToday = dateStr === (new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0'));
      const attended = attendanceData.includes(dateStr);

      currentWeek.push({
        date: dateStr,
        day: current.getDate(),
        attended,
        isToday
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = getHeatmapWeeks();

  if (!hasMembership) {
    return (
      <div className="attendance-view">
        <nav className="att-nav">
          <div className="nav-left">Welcome, <span className="user-name">{user?.firstName || "Member"}</span></div>
          <div className="nav-center">IRON MAN FITNESS STUDIO</div>
          <div className="nav-right">
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </nav>

        <main className="att-no-access">
          <div className="lock-icon">🔒</div>
          <h2>Attendance Locked</h2>
          <p>Activate a membership to track your visits</p>
          <button className="cta-btn" onClick={() => navigate("/members")}>View Plans</button>
        </main>
      </div>
    );
  }

  return (
    <div className="attendance-view">
      <nav className="att-nav">
        <div className="nav-left">Welcome, <span className="user-name">{user?.firstName || "Member"}</span></div>
        <div className="nav-center">IRON MAN FITNESS STUDIO</div>
        <div className="nav-right">
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <header className="att-hero">
        <h1>Attendance <span className="text-gradient">Tracker</span></h1>
        <p className="att-subtitle">Your fitness journey at a glance</p>
      </header>

      <main className="att-main">
        {/* Stats Cards */}
        <div className="att-stats-grid">
          <div className="att-stat-card current-streak">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-label">Current Streak</div>
              <div className="stat-value">{currentStreak}</div>
              <div className="stat-unit">days</div>
            </div>
          </div>

          <div className="att-stat-card max-streak">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-label">Max Streak</div>
              <div className="stat-value">{maxStreak}</div>
              <div className="stat-unit">days</div>
            </div>
          </div>

          <div className="att-stat-card total-visits">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Total Visits</div>
              <div className="stat-value">{totalVisits}</div>
              <div className="stat-unit">all time</div>
            </div>
          </div>

          <div className="att-stat-card monthly">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-label">This Month</div>
              <div className="stat-value">{monthlyCount}</div>
              <div className="stat-unit">visits</div>
            </div>
          </div>
        </div>

        {/* Mark Attendance Button */}
        {(() => {
          const today = new Date();
          const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
          const marked = attendanceData.includes(todayStr);
          return (
            <button 
              className={`att-mark-btn ${marked ? 'marked' : ''}`} 
              onClick={markAttendance} 
              disabled={marked}
            >
              <span className="btn-icon">{marked ? '✓' : '📍'}</span>
              <span className="btn-text">{marked ? 'Marked Today' : 'Mark Attendance'}</span>
            </button>
          );
        })()}

        {/* Heatmap Section */}
        <div className="att-heatmap-section">
          <div className="heatmap-header">
            <h2>Activity Heatmap</h2>
            <p>Green = Attended • Orange = Today • Gray = Missed</p>
          </div>

          <div className="heatmap-grid">
            {/* Weekday Labels */}
            <div className="heatmap-labels">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="day-label">{day}</div>
              ))}
            </div>

            {/* Heatmap Weeks */}
            <div className="heatmap-weeks">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="heatmap-week">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className={`heatmap-cell ${!day ? 'empty' : day.attended ? 'attended' : day.isToday ? 'today' : 'missed'}`}
                      title={day ? `${day.date}: ${day.attended ? '✓ Attended' : day.isToday ? 'Today' : 'Missed'}` : ''}
                    >
                      {day && day.attended && <span className="check">✓</span>}
                      {day && !day.attended && day.isToday && <span className="today-marker">●</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="heatmap-legend">
            <div className="legend-item">
              <div className="legend-color missed"></div>
              <span>Missed</span>
            </div>
            <div className="legend-item">
              <div className="legend-color today"></div>
              <span>Today</span>
            </div>
            <div className="legend-item">
              <div className="legend-color attended"></div>
              <span>Attended</span>
            </div>
          </div>
        </div>

        {/* Monthly Chart Section */}
        <div className="att-month-section">
          <div className="month-header">
            <h2>Monthly Performance</h2>
            <button className="view-chart-btn" onClick={() => setShowMonthChart(true)}>View Chart</button>
          </div>

          <div className="month-stats">
            <div className="month-stat">
              <span className="ms-label">This Month</span>
              <span className="ms-value">{monthlyCount}</span>
              <span className="ms-unit">days</span>
            </div>
            <div className="month-stat">
              <span className="ms-label">Consistency</span>
              <span className="ms-value">{Math.round((monthlyCount / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%</span>
              <span className="ms-unit">monthly</span>
            </div>
          </div>
        </div>

        {/* Subscription Info Card */}
        <div className="att-sub-card">
          <h3>Membership Details</h3>
          <div className="sub-row">
            <span className="sub-label">Plan:</span>
            <span className="sub-value">{user?.subscription?.title}</span>
          </div>
          <div className="sub-row">
            <span className="sub-label">Valid Until:</span>
            <span className="sub-value">{new Date(user?.subscription?.endDate).toLocaleDateString()}</span>
          </div>
          <div className="sub-row">
            <span className="sub-label">Duration:</span>
            <span className="sub-value">{user?.subscription?.duration} months</span>
          </div>
        </div>
      </main>

      <footer className="att-footer">
        <button className="footer-link" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
        <p>IRON MAN FITNESS STUDIO • Your Fitness Partner</p>
      </footer>

      {/* Monthly Chart Modal */}
      {showMonthChart && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Monthly Activity Chart</h2>
              <button className="close-btn" onClick={() => setShowMonthChart(false)}>✕</button>
            </div>

            <div className="chart-container">
              <div className="bar-chart">
                {(() => {
                  const now = new Date();
                  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  const monthAttendance = attendanceData.filter(date => {
                    const d = new Date(date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  });

                  return Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = (() => {
                      const d = new Date(now.getFullYear(), now.getMonth(), day);
                      return d.getFullYear() + '-' + 
                             String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(d.getDate()).padStart(2, '0');
                    })();
                    const attended = monthAttendance.includes(dateStr);
                    const height = attended ? 80 : 20;

                    return (
                      <div
                        key={day}
                        className={`chart-bar ${attended ? 'attended' : 'missed'}`}
                        style={{ height: height + '%' }}
                        title={`Day ${day}: ${attended ? 'Attended ✓' : 'Not attended'}`}
                      />
                    );
                  });
                })()}
              </div>

              <div className="chart-labels">
                {(() => {
                  const now = new Date();
                  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  return Array.from({ length: daysInMonth }, (_, i) => (
                    (i + 1) % 5 === 0 ? <div key={i}>{i + 1}</div> : <div key={i}></div>
                  ));
                })()}
              </div>
            </div>

            {/* Chart Stats */}
            <div className="chart-stats">
              <div className="chart-stat">
                <p className="cs-label">Days Attended</p>
                <h3 className="cs-value">{monthlyCount}</h3>
              </div>
              <div className="chart-stat">
                <p className="cs-label">Days Missed</p>
                <h3 className="cs-value">{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - monthlyCount}</h3>
              </div>
              <div className="chart-stat">
                <p className="cs-label">Consistency Rate</p>
                <h3 className="cs-value">{Math.round((monthlyCount / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
