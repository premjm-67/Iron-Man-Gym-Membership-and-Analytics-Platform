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

  // Get plan from navigation state
  const selectedPlan = location.state?.plan;

  useEffect(() => {
    // Simulate fetching payment history
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
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      
      // Add months based on plan
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

      // Update user profile with subscription
      const success = await updateProfile({ subscription: subscriptionData });
      
      if (success) {
        setPaymentSuccess(true);
        // Refresh payment history
        setPayments([{
          id: subscriptionData.paymentId,
          date: subscriptionData.paymentDate.split('T')[0],
          plan: subscriptionData.title,
          amount: subscriptionData.price,
          status: "Completed",
          method: "Credit Card",
        }]);
        
        // Redirect to dashboard after success
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="page-wrapper">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            fontSize: '48px'
          }}>
            ✓
          </div>
          <h1 style={{ color: '#059669', marginBottom: '16px' }}>Payment Successful!</h1>
          <p style={{ fontSize: '18px', marginBottom: '32px' }}>
            Your {selectedPlan?.title} membership is now active.
          </p>
          <p style={{ color: '#6b7280' }}>
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div className="page-wrapper">
        <header className="site-header">
          <div className="brand">IRON MAN FITNESS</div>
          <div className="nav">
            <button className="btn ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="btn ghost" onClick={() => navigate("/members")}>Back to Plans</button>
          </div>
        </header>

        <main className="payments-page">
          <section style={{ padding: "40px 0" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h1 style={{ textAlign: "center", marginBottom: "32px" }}>
                Complete Your Payment
              </h1>

              <div style={{
                background: "#f9fafb",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "24px",
                border: "1px solid #e5e7eb"
              }}>
                <h2 style={{ marginBottom: "16px" }}>{selectedPlan.title}</h2>
                <p style={{ color: "#6b7280", marginBottom: "8px" }}>{selectedPlan.desc}</p>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef4444" }}>
                  {selectedPlan.price}
                </div>
              </div>

              <div style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid #e5e7eb"
              }}>
                <h3 style={{ marginBottom: "16px" }}>Payment Details</h3>
                
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "16px"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "16px"
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "16px"
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  style={{
                    width: "100%",
                    background: processingPayment ? "#6b7280" : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: processingPayment ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {processingPayment ? "Processing Payment..." : `Pay ${selectedPlan.price}`}
                </button>

                <p style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#6b7280",
                  marginTop: "16px"
                }}>
                  This is a simulated payment for demonstration purposes.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <header className="site-header">
        <div className="brand">GymPro</div>
        <div className="nav">
          <button className="btn ghost" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button className="btn ghost" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>
      </header>

      <main className="payments-page">
        {/* Header */}
        <section style={{ paddingBottom: 32, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ maxWidth: "1200px" }}>
            <h1 style={{ fontSize: "36px", fontWeight: 700, margin: 0 }}>
              Payment History
            </h1>
          </div>
        </section>

        {/* Content */}
        <section style={{ padding: "40px 0", minHeight: "60vh" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "16px", color: "rgba(17,24,39,0.6)" }}>
                Loading payment history...
              </div>
            </div>
          ) : payments.length > 0 ? (
            <div style={{ maxWidth: "1000px" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "rgba(17,24,39,0.8)" }}>
                        Transaction ID
                      </th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "rgba(17,24,39,0.8)" }}>
                        Date
                      </th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "rgba(17,24,39,0.8)" }}>
                        Plan
                      </th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "rgba(17,24,39,0.8)" }}>
                        Amount
                      </th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "rgba(17,24,39,0.8)" }}>
                        Method
                      </th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "rgba(17,24,39,0.8)" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background 0.2s ease" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "16px", color: "var(--text-dark)", fontWeight: 500 }}>
                          {payment.id}
                        </td>
                        <td style={{ padding: "16px", color: "rgba(17,24,39,0.7)" }}>
                          {new Date(payment.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td style={{ padding: "16px", color: "rgba(17,24,39,0.7)" }}>
                          {payment.plan}
                        </td>
                        <td style={{ padding: "16px", fontWeight: 600, color: "#059669" }}>
                          {payment.amount}
                        </td>
                        <td style={{ padding: "16px", color: "rgba(17,24,39,0.7)" }}>
                          {payment.method}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            background: "#ecfdf5",
                            color: "#059669",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            display: "inline-block",
                          }}>
                            ✓ {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Empty State
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50vh",
            }}>
              <div style={{
                textAlign: "center",
                maxWidth: "400px",
              }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: "36px",
                }}>
                  💳
                </div>

                <h2 style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  marginBottom: 8,
                  margin: 0,
                }}>
                  No Payment History Yet
                </h2>

                <p style={{
                  fontSize: "14px",
                  color: "rgba(17,24,39,0.6)",
                  marginBottom: 24,
                  lineHeight: "1.6",
                  margin: "0 0 24px 0",
                }}>
                  You haven't made any payments yet. Start your fitness journey by choosing a membership plan that fits your goals.
                </p>

                <button
                  onClick={() => navigate("/members")}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "12px 28px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                  }}
                >
                  View Membership Plans
                </button>

                <p style={{
                  fontSize: "12px",
                  color: "rgba(17,24,39,0.5)",
                  marginTop: 16,
                }}>
                  ✨ Flexible plans • No long-term contracts • Cancel anytime
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div>© GymPro 2026</div>
        <div>Secure payment history and transaction management</div>
      </footer>
    </div>
  );
}