import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const hasMembership = user?.membership || user?.plan;

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="header">
        <div>
          <h1>Welcome, <span style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.firstName || "Member"}</span></h1>
          <p>Premium fitness management system</p>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </header>

      {/* HERO */}
      <section className="hero">
        <h2>Membership Status</h2>

        {hasMembership ? (
          <span className="badge active">✓ Active • Premium</span>
        ) : (
          <>
            <span className="badge inactive">○ Inactive</span>
            <button className="cta" onClick={() => navigate("/members")}>
              Activate Membership
            </button>
          </>
        )}
      </section>

      {/* GRID */}
      <section className="grid">
        <Card 
          title="Membership" 
          desc="Plans & validity" 
          icon="🎫"
          color="#6366f1"
          onClick={() => navigate("/members")} 
        />
        <Card 
          title="Trainers" 
          desc="Personal coaches" 
          icon="👨‍🏫"
          color="#00d4ff"
          onClick={() => navigate("/trainers")} 
        />
        <Card 
          title="Attendance" 
          desc="Visit history" 
          icon="📅"
          color="#f59e0b"
          locked={!hasMembership} 
          onClick={() => navigate("/attendance")} 
        />
        <Card 
          title="Payments" 
          desc="Invoices & bills" 
          icon="💳"
          color="#8b5cf6"
          onClick={() => navigate("/payments")} 
        />
        <Card 
          title="Profile" 
          desc="Account settings" 
          icon="⚙️"
          color="#10b981"
          onClick={() => navigate("/profile")} 
        />
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <span>GymPro © 2026</span>
        <span>Premium Fitness Management</span>
      </footer>
    </div>
  );
}

function Card({ title, desc, icon, color, locked, onClick }) {
  return (
    <div 
      className={`card ${locked ? "locked" : ""}`}
      onClick={!locked ? onClick : undefined}
      style={{
        background: "#ffffff",
        borderColor: color,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!locked) {
          e.currentTarget.style.background = `${color}08`;
          e.currentTarget.style.boxShadow = `0 12px 32px ${color}25`;
        }
      }}
      onMouseLeave={(e) => {
        if (!locked) {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
        }
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: 6, margin: 0, color: "#1f2937" }}>{title}</h3>
      <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>{desc}</p>
      {locked && <span className="lock">🔒 Locked</span>}
    </div>
  );
}
