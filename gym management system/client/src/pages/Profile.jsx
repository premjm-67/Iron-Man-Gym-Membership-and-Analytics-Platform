import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [membership, setMembership] = useState(null);
  const [createdAt, setCreatedAt] = useState("");

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName
    ? user.firstName[0].toUpperCase()
    : "U";

  useEffect(() => {
    // Fetch user membership data
    const fetchMembership = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/members/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.member.subscription) {
            setMembership(data.member.subscription);
          }
          setCreatedAt(new Date(data.member.createdAt).toLocaleDateString());
        }
      } catch (error) {
        console.error("Error fetching membership:", error);
      }
    };

    if (user?.id) {
      fetchMembership();
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const formData = new FormData(e.target);
    const updatedData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/members/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setErrorMessage("Failed to update profile. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-view">
      {/* NAVIGATION */}
      <nav className="profile-nav">
        <div className="nav-left">
          <button className="back-link" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </div>
        <div className="nav-center">IRON MAN FITNESS STUDIO</div>
        <div className="nav-right">
          <div className="mini-avatar-nav">{initials}</div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="profile-hero">
        <div className="profile-avatar-large">{initials}</div>
        <h1>{user?.firstName}'s <span className="text-gradient">Profile</span></h1>
        <p>Manage your account settings and membership plan</p>
      </header>

      <main className="profile-grid">
        {/* PERSONAL INFO CARD */}
        <div className="profile-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Personal Details</h2>
              <p className="card-subtitle">Update your contact information</p>
            </div>
            {!isEditing && (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                ✎ Edit Profile
              </button>
            )}
          </div>

          {(successMessage || errorMessage) && (
            <div className={`alert-box ${successMessage ? "success" : "error"}`}>
              {successMessage || errorMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-grid">
              <div>
                <label className="label">First Name</label>
                <div className={`input-wrapper ${isEditing ? "active" : ""}`}>
                  <span className="input-icon">👤</span>
                  <input
                    name="firstName"
                    defaultValue={user?.firstName}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">Last Name</label>
                <div className={`input-wrapper ${isEditing ? "active" : ""}`}>
                  <span className="input-icon">👤</span>
                  <input
                    name="lastName"
                    defaultValue={user?.lastName}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="full-width">
                <label className="label">Email Address</label>
                <div className="input-wrapper locked">
                  <span className="input-icon">✉</span>
                  <input
                    value={user?.email || ""}
                    disabled
                    className="input-field"
                  />
                  <span className="locked-badge">LOCKED</span>
                </div>
              </div>

              <div className="full-width">
                <label className="label">Phone Number</label>
                <div className={`input-wrapper ${isEditing ? "active" : ""}`}>
                  <span className="input-icon">📞</span>
                  <input
                    name="phone"
                    defaultValue={user?.phone}
                    disabled={!isEditing}
                    placeholder="Add phone number"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="action-buttons">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* SUBSCRIPTION CARD */}
        <div className="subscription-card">
          <h2 className="subscription-header">Subscription</h2>
          <div className={`subscription-plan ${membership && membership.status === 'active' ? '' : 'inactive'}`}>
            <h3 className="plan-title">
              {membership && membership.status === 'active' ? membership.title : "No Active Plan"}
            </h3>
            <p className="plan-validity">
              {membership && membership.status === 'active'
                ? `Valid until ${new Date(membership.endDate).toLocaleDateString()}`
                : "Join to start your fitness journey"}
            </p>
          </div>

          {membership && membership.status === 'active' && (
            <div className="plan-details">
              <div className="detail-row">
                <span className="detail-label">Plan Price</span>
                <span className="detail-value">{membership.price}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{new Date(membership.startDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">End Date</span>
                <span className="detail-value">{new Date(membership.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <button className="btn-plan" onClick={() => navigate("/members")}>
            {membership && membership.status === 'active' ? "Change Plan" : "Choose Plan"}
          </button>

          <div className="account-info">
            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-value">{createdAt}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className="info-value status-verified">✓ Verified</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="profile-footer-branded">
        <p>IRON MAN FITNESS STUDIO • ACCOUNT SECURITY PORTAL</p>
      </footer>
    </div>
  );
}