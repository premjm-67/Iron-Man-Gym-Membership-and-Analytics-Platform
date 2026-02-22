const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

const memberFilePath = path.join(__dirname, "../database/members.json");
const subscriptionFilePath = path.join(__dirname, "../database/subscriptions.json");

// Read members safely
function readMembers() {
  if (!fs.existsSync(memberFilePath)) {
    fs.writeFileSync(memberFilePath, "[]");
  }
  const data = fs.readFileSync(memberFilePath, "utf8");
  return data ? JSON.parse(data) : [];
}

// Read subscriptions safely
function readSubscriptions() {
  if (!fs.existsSync(subscriptionFilePath)) {
    fs.writeFileSync(subscriptionFilePath, "[]");
  }
  const data = fs.readFileSync(subscriptionFilePath, "utf8");
  return data ? JSON.parse(data) : [];
}

// Get all subscribed members (owner only)
router.get("/members", authMiddleware, (req, res) => {
  // Check if user is owner (hardcoded check)
  if (req.user.phone !== "8925782356") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const subscriptions = readSubscriptions();
  const members = readMembers();
  
  // Merge subscription data with member info
  const subscribedMembers = subscriptions.map(sub => {
    const member = members.find(m => m.id === sub.memberId);

    // Check if subscription has expired
    let currentStatus = sub.status;
    if (sub.status === 'active' && new Date(sub.endDate) < new Date()) {
      currentStatus = 'expired';
      // Update the subscription status in the file
      sub.status = 'expired';
      writeSubscriptions(subscriptions);
    }

    return {
      id: sub.memberId,
      firstName: member?.firstName || "Unknown",
      lastName: member?.lastName || "User",
      phone: member?.phone || "N/A",
      subscription: {
        title: sub.title,
        price: sub.price,
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: currentStatus,
        paymentId: sub.paymentId
      },
      createdAt: sub.paymentDate
    };
  });

  return res.json({ success: true, members: subscribedMembers });
});

module.exports = router;