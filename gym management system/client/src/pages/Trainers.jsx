import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./trainers.css";

const trainersData = [
  {
    id: 1,
    name: "Alex Mitchell",
    specialization: "Strength & Power",
    phone: "+1 (555) 234-5678",
    email: "alex.mitchell@gympro.com",
    experience: "8 years",
    image: "💪",
    rating: 4.9,
    certifications: ["NASM", "ISSA", "ACE"]
  },
  {
    id: 2,
    name: "Sarah Johnson",
    specialization: "HIIT & Cardio",
    phone: "+1 (555) 345-6789",
    email: "sarah.johnson@gympro.com",
    experience: "6 years",
    image: "🏃",
    rating: 4.8,
    certifications: ["NASM", "ACE"]
  },
  {
    id: 3,
    name: "Marcus Rodriguez",
    specialization: "Bodybuilding & Mass",
    phone: "+1 (555) 456-7890",
    email: "marcus.rodriguez@gympro.com",
    experience: "10 years",
    image: "🏆",
    rating: 5.0,
    certifications: ["IFBB", "ISSA", "NASM"]
  },
  {
    id: 4,
    name: "Emily Chen",
    specialization: "Yoga & Flexibility",
    phone: "+1 (555) 567-8901",
    email: "emily.chen@gympro.com",
    experience: "7 years",
    image: "🧘",
    rating: 4.7,
    certifications: ["RYT-200", "NASM"]
  }
];

export default function Trainers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrainer(null);
  };

  return (
    <div className="trainers-container">
      {/* HEADER */}
      <header className="trainers-header">
        <div>
          <h1>Iron Man Gym Trainers</h1>
          <p>Select your dedicated fitness coach</p>
        </div>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
      </header>

      {/* STATS SECTION */}
      <section className="trainers-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>4</h3>
            <p>Expert Trainers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>4.85</h3>
            <p>Avg. Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>31+</h3>
            <p>Years Combined</p>
          </div>
        </div>
      </section>

      {/* TRAINERS GRID */}
      <section className="trainers-grid">
        {trainersData.map((trainer) => (
          <div key={trainer.id} className="trainer-card">
            <div className="trainer-header">
              <div className="trainer-avatar">{trainer.image}</div>
              <div className="trainer-rating">
                <span className="stars">★</span>
                <span className="rating-number">{trainer.rating}</span>
              </div>
            </div>

            <div className="trainer-content">
              <h3 className="trainer-name">{trainer.name}</h3>
              <p className="trainer-specialization">{trainer.specialization}</p>

              <div className="trainer-meta">
                <div className="meta-item">
                  <span className="meta-label">Experience</span>
                  <span className="meta-value">{trainer.experience}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Certifications</span>
                  <span className="meta-value">{trainer.certifications.length} Pro</span>
                </div>
              </div>

              <div className="trainer-contact">
                <a href={`tel:${trainer.phone}`} className="contact-link">
                  📞 {trainer.phone}
                </a>
              </div>
            </div>

            <button 
              className="select-btn"
              onClick={() => handleSelectTrainer(trainer)}
            >
              View Details
            </button>
          </div>
        ))}
      </section>

      {/* MODAL */}
      {showModal && selectedTrainer && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>

            <div className="modal-header">
              <div className="modal-avatar">{selectedTrainer.image}</div>
              <div className="modal-header-info">
                <h2>{selectedTrainer.name}</h2>
                <p className="modal-specialty">{selectedTrainer.specialization}</p>
                <div className="modal-rating">
                  <span className="rating-stars">{'★'.repeat(Math.floor(selectedTrainer.rating))} ☆</span>
                  <span className="rating-value">{selectedTrainer.rating}/5.0</span>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Contact Information</h4>
                <div className="contact-info">
                  <div className="info-row">
                    <span className="info-icon">📞</span>
                    <div>
                      <p className="info-label">Phone</p>
                      <p className="info-value">{selectedTrainer.phone}</p>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">📧</span>
                    <div>
                      <p className="info-label">Email</p>
                      <p className="info-value">{selectedTrainer.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Professional Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <p className="detail-label">Experience</p>
                    <p className="detail-value">{selectedTrainer.experience}</p>
                  </div>
                  <div className="detail-item">
                    <p className="detail-label">Rating</p>
                    <p className="detail-value">{selectedTrainer.rating}/5</p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Certifications</h4>
                <div className="certifications-list">
                  {selectedTrainer.certifications.map((cert, idx) => (
                    <span key={idx} className="cert-badge">{cert}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="action-btn secondary"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button 
                className="action-btn primary"
                onClick={() => {
                  alert(`Schedule session with ${selectedTrainer.name}\nPhone: ${selectedTrainer.phone}`);
                  handleCloseModal();
                }}
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="trainers-footer">
        <p>Contact a trainer directly or book a session through your account</p>
      </footer>
    </div>
  );
}
