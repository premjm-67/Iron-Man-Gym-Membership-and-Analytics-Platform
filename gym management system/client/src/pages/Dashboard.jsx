import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./dashboard.saas.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const hasMembership = !!(user?.subscription && user.subscription.status === 'active');

  return (
    <div className="dashboard-view">
      <nav className="trainer-nav">
        <div className="nav-left">
          Welcome, <span className="user-name">{user?.firstName || "Member"}</span>
        </div>
        <div className="nav-center">IRON MAN FITNESS STUDIO</div>
        <div className="nav-right">
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <header className="hero-compact">
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

      <main className="trainers-grid-small">
        <Card
          title="Membership"
          desc="Plans & validity"
          icon="🎫"
          color="#4f46e5"
          onClick={() => navigate("/members")}
        />
        <Card
          title="Trainers"
          desc="Personal coaches"
          icon="💪"
          color="#06b6d4"
          onClick={() => navigate("/trainers")}
        />
        <Card
          title="Attendance"
          desc="Visit history"
          icon="📅"
          color="#10b981"
          locked={!hasMembership}
          onClick={() => navigate("/attendance")}
        />
        <Card
          title="Payments"
          desc="Invoices & bills"
          icon="💳"
          color="#f59e0b"
          onClick={() => navigate("/payments")}
        />
        <Card
          title="Profile"
          desc="Account settings"
          icon="⚙️"
          color="#ef4444"
          onClick={() => navigate("/profile")}
        />
      </main>

      <footer className="mini-footer-branded">
        <p>IRON MAN FITNESS STUDIO • GLOBAL PERFORMANCE LABS</p>
      </footer>
    </div>
  );
}

function Card({ title, desc, icon, color, locked, onClick }) {
  return (
    <div
      className={`trainer-mini-card ${locked ? "locked-card" : ""}`}
      onClick={!locked ? onClick : undefined}
      style={{ "--accent": color }}
    >
      <div className="mini-card-top">
        <span className="mini-spec" style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}>
          {locked ? "LOCKED" : "ACTIVE"}
        </span>
        <h3>{title}</h3>
      </div>

      <div className="mini-card-meta">
        <div className="meta-row">
          <span className="label">Feature:</span>
          <span className="value">{desc}</span>
        </div>
        <div className="meta-row">
          <span className="label">Status:</span>
          <span className="value">{locked ? "Upgrade Required" : "Available"}</span>
        </div>
      </div>
      <div className="mini-footer">
        {locked ? "Upgrade to Access →" : "Enter Section →"}
      </div>
    </div>
  );
}   