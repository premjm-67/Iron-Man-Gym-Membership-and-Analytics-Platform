import { useNavigate, useLocation } from "react-router-dom";
import "./members.css";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const selectedPlan = location.state?.plan;

  useEffect(() => {
    setTimeout(() => {
      const mockPayments = user?.subscription ? [
        {
          id: `PAY-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          plan: user.subscription.title || "Membership",
          amount: user.subscription.price || "₹0",
          status: "Completed",
          method: "Credit Card",
        }
      ] : [];
      setPayments(mockPayments);
      setLoading(false);
    }, 500);
  }, [user]);

  const handlePayment = async () => {
    if (!selectedPlan) return;
    setProcessingPayment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const startDate = new Date();
      const endDate = new Date();
      const months = selectedPlan.id === '3m' ? 3 : 
                    selectedPlan.id === '6m' ? 6 : 
                    selectedPlan.id === '9m' ? 9 : 12;
      endDate.setMonth(endDate.getMonth() + months);

      const subscriptionData = {
        id: selectedPlan.id,
        title: selectedPlan.title,
        price: selectedPlan.price,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        paymentId: `PAY-${Date.now()}`,
        paymentDate: new Date().toISOString()
      };

      const success = await updateProfile({ subscription: subscriptionData });
      if (success) {
        setPaymentSuccess(true);
        setPayments([{
          id: subscriptionData.paymentId,
          date: subscriptionData.paymentDate.split('T')[0],
          plan: subscriptionData.title,
          amount: subscriptionData.price,
          status: "Completed",
          method: "Credit Card",
        }]);
        setTimeout(() => { navigate("/dashboard"); }, 2000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // SUCCESS STATE UI
  if (paymentSuccess) {
    return (
      <div className="page-wrapper" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="success-card" style={{
          background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          textAlign: 'center', maxWidth: '450px', width: '90%'
        }}>
          <div style={{
            width: '80px', height: '80px', background: '#10b981', borderRadius: '50%', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px'
          }}>✓</div>
          <h1 style={{ color: '#1e293b', fontSize: '28px', marginBottom: '12px' }}>Payment Confirmed!</h1>
          <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
            Welcome to the team! Your <strong>{selectedPlan?.title}</strong> is now active.
          </p>
          <div className="loader-bar" style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', background: '#10b981', animation: 'load 2s infinite ease-in-out' }}></div>
          </div>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#94a3b8' }}>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // PAYMENT FORM UI
  if (selectedPlan) {
    return (
      <div className="page-wrapper" style={{ background: '#f1f5f9', minHeight: '100vh' }}>
        <header className="site-header" style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div className="brand" style={{ fontWeight: '800', letterSpacing: '-1px' }}>IRON MAN FITNESS</div>
          <div className="nav">
            <button className="btn ghost" onClick={() => navigate("/members")}>Cancel</button>
          </div>
        </header>

        <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'start' }}>
            
            {/* Left Column: Summary */}
            <div style={{ position: 'sticky', top: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px', color: '#1e293b' }}>Checkout</h2>
              <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', padding: '32px', borderRadius: '24px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <span style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '2px', opacity: 0.8 }}>Selected Plan</span>
                <h3 style={{ fontSize: '24px', margin: '8px 0' }}>{selectedPlan.title}</h3>
                <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '24px' }}>{selectedPlan.desc}</p>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '24px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px' }}>Total Amount</span>
                  <span style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>{selectedPlan.price}</span>
                </div>
              </div>
              <p style={{ marginTop: '24px', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
                🛡️ Secure 256-bit SSL Encrypted Payment
              </p>
            </div>

            {/* Right Column: Card Form */}
            <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>Payment Method</h3>
              
              {/* Visual Card representation */}
              <div style={{ 
                height: '180px', width: '100%', background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', 
                borderRadius: '16px', marginBottom: '32px', padding: '24px', color: 'white', display: 'flex', 
                flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '45px', height: '35px', background: '#fcd34d', borderRadius: '4px', opacity: 0.8 }}></div>
                  <span style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '20px' }}>VISA</span>
                </div>
                <div style={{ fontSize: '20px', letterSpacing: '4px' }}>**** **** **** ****</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>CARD HOLDER</span>
                  <span>EXPIRES</span>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#ef4444'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Expiry</label>
                  <input type="text" placeholder="MM / YY" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>CVV</label>
                  <input type="password" placeholder="***" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processingPayment}
                style={{
                  width: "100%", background: processingPayment ? "#94a3b8" : "#1e293b", color: "#fff", border: "none",
                  padding: "18px", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: processingPayment ? "not-allowed" : "pointer",
                  transition: "transform 0.2s, background 0.2s"
                }}
                onMouseEnter={(e) => !processingPayment && (e.target.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => !processingPayment && (e.target.style.transform = 'scale(1)')}
              >
                {processingPayment ? "Processing..." : `Confirm & Pay ${selectedPlan.price}`}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // HISTORY UI (Aesthetic Table)
  return (
    <div className="page-wrapper" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <header className="site-header" style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div className="brand">IRON MAN FITNESS</div>
        <div className="nav">
          <button className="btn ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b' }}>Billing History</h1>
            <p style={{ color: '#64748b' }}>Manage your subscriptions and download receipts</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px" }}>Loading your records...</div>
        ) : payments.length > 0 ? (
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: "20px", textAlign: "left", fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Transaction</th>
                  <th style={{ padding: "20px", textAlign: "left", fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Plan</th>
                  <th style={{ padding: "20px", textAlign: "left", fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: "20px", textAlign: "left", fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: "20px" }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{payment.id}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(payment.date).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: "20px", color: '#475569' }}>{payment.plan}</td>
                    <td style={{ padding: "20px", fontWeight: '700', color: '#1e293b' }}>{payment.amount}</td>
                    <td style={{ padding: "20px" }}>
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: '600' }}>
                        ● Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State Redesigned */
          <div style={{ textAlign: 'center', background: 'white', padding: '80px 40px', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>💳</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>No transactions found</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>You haven't purchased any membership plans yet.</p>
            <button onClick={() => navigate("/members")} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Explore Membership Plans
            </button>
          </div>
        )}
      </main>
    </div>
  );
}