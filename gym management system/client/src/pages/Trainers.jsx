import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./trainers.css";

const trainersData = [
  {
    id: 1,
    name: "Anbu",
    specialization: "Strength & Power",
    phone: "+91 98450 12345",
    experience: "8 Years",
    about: "Specializes in high-intensity strength training and powerlifting techniques."
  },
  {
    id: 2,
    name: "Surya",
    specialization: "HIIT & Cardio",
    phone: "+91 98450 67890",
    experience: "6 Years",
    about: "Expert in functional fitness and rapid fat loss through movements."
  },
  {
    id: 3,
    name: "Karthi",
    specialization: "Bodybuilding",
    phone: "+91 98450 54321",
    experience: "10 Years",
    about: "Focused on muscle hypertrophy and competition-level physique coaching."
  }
];

export default function Trainers() {
  const navigate = useNavigate();
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setShowModal(true);
  };

  return (
    <div className="trainers-view">
      <nav className="trainer-nav">
        <div className="nav-left">
          <button className="back-link" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </div>
        <div className="nav-center">IRON MAN FITNESS STUDIO</div>
      </nav>

      <header className="hero-compact">
        <h1>Our Trainers</h1>
        <p>For more information please contact.</p>
      </header>

      <main className="trainers-grid-small">
        {trainersData.map((trainer) => (
          <div key={trainer.id} className="trainer-mini-card" onClick={() => handleSelectTrainer(trainer)}>
            <div className="mini-card-top">
              <span className="mini-spec">{trainer.specialization}</span>
              <h3>{trainer.name}</h3>
            </div>
            
            <div className="mini-card-meta">
              <div className="meta-row">
                <span className="label">Exp:</span>
                <span className="value">{trainer.experience}</span>
              </div>
              <div className="meta-row">
                <span className="label">Call:</span>
                <span className="value">{trainer.phone}</span>
              </div>
            </div>
            <div className="mini-footer">View Details →</div>
          </div>
        ))}
      </main>

      {showModal && selectedTrainer && (
        <div className="mini-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mini-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
               <h3>{selectedTrainer.name}</h3>
               <span>{selectedTrainer.specialization}</span>
            </div>
            <div className="modal-content">
              <p><strong>Experience:</strong> {selectedTrainer.experience}</p>
              <p><strong>Contact:</strong> {selectedTrainer.phone}</p>
              <p className="about-text">{selectedTrainer.about}</p>
            </div>
            <div className="modal-btns">
              <button className="m-btn-close" onClick={() => setShowModal(false)}>Close</button>
              <a href={`tel:${selectedTrainer.phone}`} className="m-btn-call">Call</a>
            </div>
          </div>
        </div>
      )}

      <footer className="mini-footer-branded">
        <p>IRON MAN FITNESS STUDIO</p>
      </footer>
    </div>
  );
}