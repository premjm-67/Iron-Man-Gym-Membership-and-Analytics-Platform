import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./dashboard.css"; 

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const membership = user?.subscription;
  const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—";
  const initials = (user?.firstName || "M")[0]?.toUpperCase();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName").trim();
    const lastName = formData.get("lastName").trim();
    const phone = formData.get("phone").trim();

    if (!firstName) return setErrorMessage("First name is required");

    setIsSaving(true);
    try {
      const ok = await updateProfile({ firstName, lastName, phone });
      if (ok) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage("Failed to update profile.");
      }
    } catch (error) {
      setErrorMessage("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- REUSABLE STYLE OBJECTS ---
  const inputWrapperStyle = (active, locked) => ({
    display: "flex",
    alignItems: "center",
    background: locked ? "#f1f5f9" : active ? "#fff" : "#f8fafc",
    border: `2px solid ${active ? "#6366f1" : "#edf2f7"}`,
    borderRadius: "14px",
    padding: "0 16px",
    transition: "all 0.3s ease",
    boxShadow: active ? "0 10px 15px -3px rgba(99, 102, 241, 0.1)" : "none",
  });

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "8px",
    display: "block",
  };

  return (
    <div className="dashboard-view">
      {/* NAVIGATION */}
      <nav className="dash-nav">
        <div className="nav-left" onClick={() => navigate("/dashboard")} style={{cursor: 'pointer'}}>
          ← <span className="user-name">Back to Dashboard</span>
        </div>
        <div className="nav-center">IRON MAN FITNESS STUDIO</div>
        <div className="nav-right">
          <div className="mini-avatar-nav">{initials}</div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="dash-hero">
        <div className="profile-avatar-large">{initials}</div>
        <h1>{user?.firstName}'s <span className="text-gradient">Profile</span></h1>
        <p>Manage your account settings and membership plan</p>
      </header>

      <main className="dash-grid profile-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "25px", padding: "0 5% 60px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* PERSONAL INFO CARD */}
        <div className="dash-card" style={{ background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Personal Details</h2>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>Update your contact information</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                style={{ background: "#f1f5f9", border: "none", padding: "10px 20px", borderRadius: "99px", color: "#6366f1", fontWeight: 700, cursor: "pointer" }}
              >
                ✎ Edit Profile
              </button>
            )}
          </div>

          {(successMessage || errorMessage) && (
            <div className={`alert-box ${successMessage ? "success" : "error"}`} style={{ marginBottom: "20px", padding: "12px", borderRadius: "10px", textAlign: "center", fontWeight: "700", background: successMessage ? "#dcfce7" : "#fee2e2", color: successMessage ? "#15803d" : "#b91c1c" }}>
              {successMessage || errorMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={labelStyle}>First Name</label>
                <div style={inputWrapperStyle(isEditing, false)}>
                  <span style={{ marginRight: "12px", opacity: 0.5 }}>👤</span>
                  <input name="firstName" defaultValue={user?.firstName} disabled={!isEditing} style={{ width: "100%", padding: "14px 0", border: "none", background: "transparent", outline: "none", fontWeight: 600 }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={labelStyle}>Last Name</label>
                <div style={inputWrapperStyle(isEditing, false)}>
                  <span style={{ marginRight: "12px", opacity: 0.5 }}>👤</span>
                  <input name="lastName" defaultValue={user?.lastName} disabled={!isEditing} style={{ width: "100%", padding: "14px 0", border: "none", background: "transparent", outline: "none", fontWeight: 600 }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Email Address</label>
                <div style={inputWrapperStyle(false, true)}>
                  <span style={{ marginRight: "12px", opacity: 0.5 }}>✉</span>
                  <input value={user?.email || ""} disabled style={{ width: "100%", padding: "14px 0", border: "none", background: "transparent", outline: "none", fontWeight: 600, color: "#94a3b8" }} />
                  <span style={{ fontSize: "9px", fontWeight: 900, background: "#e2e8f0", padding: "3px 8px", borderRadius: "6px", color: "#64748b" }}>LOCKED</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Phone Number</label>
                <div style={inputWrapperStyle(isEditing, false)}>
                  <span style={{ marginRight: "12px", opacity: 0.5 }}>📞</span>
                  <input name="phone" defaultValue={user?.phone} disabled={!isEditing} placeholder="Add phone number" style={{ width: "100%", padding: "14px 0", border: "none", background: "transparent", outline: "none", fontWeight: 600 }} />
                </div>
              </div>

            </div>

            {isEditing && (
              <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, background: "#f1f5f9", border: "none", padding: "14px", borderRadius: "14px", fontWeight: 700, color: "#64748b", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={{ flex: 2, background: "linear-gradient(90deg, #6366f1, #06b6d4)", color: "white", border: "none", padding: "14px", borderRadius: "14px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)" }}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* SUBSCRIPTION CARD */}
        <div className="dash-card" style={{ background: "white", padding: "30px", borderRadius: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>Subscription</h2>
          <div style={{ background: membership && membership.status === 'active' ? "linear-gradient(135deg, #6366f1, #06b6d4)" : "#f1f5f9", padding: "20px", borderRadius: "16px", color: membership && membership.status === 'active' ? "white" : "#64748b" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>{membership && membership.status === 'active' ? membership.title : "No Active Plan"}</h3>
            <p style={{ fontSize: "13px", opacity: 0.8 }}>{membership && membership.status === 'active' ? `Valid until ${new Date(membership.endDate).toLocaleDateString()}` : "Join to start your fitness journey"}</p>
          </div>
          
          {membership && membership.status === 'active' && (
            <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                <span style={{ color: "#64748b" }}>Plan Price</span>
                <span style={{ fontWeight: 700 }}>{membership.price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                <span style={{ color: "#64748b" }}>Start Date</span>
                <span style={{ fontWeight: 700 }}>{new Date(membership.startDate).toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>End Date</span>
                <span style={{ fontWeight: 700 }}>{new Date(membership.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}
          
          <button onClick={() => navigate("/members")} style={{ width: "100%", marginTop: "20px", background: "none", border: "2px solid #6366f1", color: "#6366f1", padding: "10px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
            {membership && membership.status === 'active' ? "Change Plan" : "Choose Plan"}
          </button>
          
          <div style={{ marginTop: "25px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px" }}>
                <span style={{ color: "#94a3b8" }}>Member Since</span>
                <span style={{ fontWeight: 700 }}>{createdAt}</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#94a3b8" }}>Status</span>
                <span style={{ fontWeight: 700, color: "#10b981" }}>✓ Verified</span>
             </div>
          </div>
        </div>

      </main>

      <footer className="dash-footer-branded">
        <p>IRON MAN FITNESS STUDIO • ACCOUNT SECURITY PORTAL</p>
      </footer>
    </div>
  );
}