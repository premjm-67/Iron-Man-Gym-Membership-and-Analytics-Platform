import "./members.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Members() {
  const { user } = useAuth();
  const [showCompare, setShowCompare] = useState(false);
  const [compareNotes, setCompareNotes] = useState([]);
  const navigate = useNavigate();

  const membership = user?.subscription;
  const memberName = user?.firstName || "Member";
  const initials = memberName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const isActive = !!membership && membership.status === 'active';

  const plans = [
    {
      id: "3m",
      title: "Starter",
      price: "₹3,999",
      desc: "Perfect for getting started",
      features: ["Gym Access", "Basic Support", "Community Access"],
    },
    {
      id: "6m",
      title: "Pro",
      price: "₹6,999",
      desc: "Maximum performance plan",
      features: ["Unlimited Access", "Personal Trainer", "Nutrition Plan", "Progress Tracking"],
      popular: false, // REMOVED POPULAR STATUS TO UNLOCK VISUALS
    },
    {
      id: "9m",
      title: "Elite",
      price: "₹9,499",
      desc: "Advanced transformation",
      features: ["VIP Access", "Premium Trainer", "Custom Nutrition", "Weekly Coaching"],
    },
    {
      id: "12m",
      title: "Ultimate",
      price: "₹11,999",
      desc: "Complete transformation",
      features: ["24/7 Access", "Dedicated Coach", "Full Nutrition", "Priority Support"],
    },
  ];

  const handleChoosePlan = (plan) => {
    navigate("/payments", { state: { plan } });
  };

  return (
    <div className="page-wrapper">
      <header className="site-header">
        <div className="brand">IRON MAN FITNESS</div>
        <div className="nav">
          <button className="btn ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="btn ghost" onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </header>

      <main className="membership-page">
        <section className="membership-hero">
          <div className="hero-left">
            <h1>Membership <span style={{color: 'var(--accent-red)'}}>Plans</span></h1>
            <p className="lead">All plans are now unlocked and available for selection.</p>
          </div>

          <div className="hero-right">
            <div className="status-panel">
              <div className="avatar">{initials}</div>
              <div className="user-info">
                <div className="name">{memberName}</div>
                <div className={`sub-status ${isActive ? 'active' : 'inactive'}`}>
                  {isActive ? '✓ Active Member' : '○ No Subscription'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="plans-container">
          {plans.map((plan) => {
            const isOwned = membership && membership.id === plan.id;
            
            return (
              <article 
                key={plan.id} 
                className={`plan-card ${isOwned ? "owned" : ""}`}
                style={{ 
                  filter: 'none', 
                  opacity: 1, 
                  pointerEvents: 'auto' 
                }}
              >
                {/* Visual Red Accent Bar */}
                <div className="plan-accent"></div>
                
                {isOwned && <span className="owned-badge">CURRENT PLAN</span>}

                <div className="plan-body">
                  <h2>{plan.title}</h2>
                  <p className="desc">{plan.desc}</p>
                  
                  <div className="price">
                    {plan.price}
                    <span className="per">/ total</span>
                  </div>

                  <ul className="features">
                    {plan.features.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>

                  <div className="plan-actions">
                    <button 
                      className="btn primary" 
                      onClick={() => handleChoosePlan(plan)}
                      disabled={isOwned}
                      style={{ 
                        background: 'linear-gradient(90deg, #ef4444, #b91c1c)',
                        cursor: isOwned ? 'default' : 'pointer',
                        opacity: isOwned ? 0.5 : 1
                      }}
                    >
                      {isOwned ? "Active" : "Select Plan"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <footer className="site-footer">
        <div>© 2026 IRON MAN FITNESS STUDIO</div>
      </footer>
    </div>
  );
}