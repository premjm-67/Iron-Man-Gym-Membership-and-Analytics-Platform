import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const hasMembership = !!(user?.subscription && user.subscription.status === 'active');

  return (
    <div className="dashboard-view">
      {/* NAVIGATION - Using your structure with premium red accents */}
      <nav className="dash-nav">
        <div className="nav-left">
          Welcome, <span className="user-name">{user?.firstName || "Member"}</span>
        </div>
        <div className="nav-center">IRON MAN FITNESS STUDIO</div>
        <div className="nav-right">
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* HERO STATUS */}
      <header className="dash-hero">
        <h1>Member <span className="text-gradient">Dashboard</span></h1>
        <div className="status-container">
          {hasMembership ? (
            <span className="status-badge active">✓ Active Premium Member</span>
          ) : (
            <div className="status-inactive">
              <span className="status-badge inactive">○ Inactive Account</span>
              <button className="activate-cta" onClick={() => navigate("/members")}>Activate Plan</button>
            </div>
          )}
        </div>
      </header>

      {/* GRID SECTION */}
      <main className="dash-grid">
        <Card 
          title="Membership" 
          desc="Plans & validity" 
          icon="🎫"
          color="#ef4444" /* Red */
          onClick={() => navigate("/members")} 
        />
        <Card 
          title="Trainers" 
          desc="Personal coaches" 
          icon="💪"
          color="#0f172a" /* Dark Slate */
          onClick={() => navigate("/trainers")} 
        />
        <Card 
          title="Attendance" 
          desc="Visit history" 
          icon="📅"
          color="#b91c1c" /* Deep Red */
          locked={!hasMembership} 
          onClick={() => navigate("/attendance")} 
        />
        <Card 
          title="Payments" 
          desc="Invoices & bills" 
          icon="💳"
          color="#334155" /* Muted Slate */
          onClick={() => navigate("/payments")} 
        />
        <Card 
          title="Profile" 
          desc="Account settings" 
          icon="⚙️"
          color="#ef4444" /* Red */
          onClick={() => navigate("/profile")} 
        />
      </main>

      {/* FOOTER */}
      <footer className="dash-footer-branded">
        <p>IRON MAN FITNESS STUDIO • GLOBAL PERFORMANCE LABS</p>
      </footer>
    </div>
  );
}

function Card({ title, desc, icon, color, locked, onClick }) {
  return (
    <div 
      className={`dash-card ${locked ? "locked-card" : ""}`}
      onClick={!locked ? onClick : undefined}
      style={{ "--accent": color }}
    >
      <div className="card-top">
        <span className="card-icon-box">{icon}</span>
        {locked ? <span className="lock-tag">🔒 Locked</span> : <span className="active-dot">●</span>}
      </div>
      <div className="card-body">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <div className="card-footer-action">
        <span>{locked ? "Upgrade to View" : "Enter Section"}</span>
        <span className="arrow">→</span>
      </div>
    </div>
  );
}