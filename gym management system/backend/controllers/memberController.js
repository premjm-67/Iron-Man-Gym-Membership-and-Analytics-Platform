const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const filePath = path.join(__dirname, "../database/members.json");
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Read members safely
function readMembers() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }
  const data = fs.readFileSync(filePath, "utf8");
  return data ? JSON.parse(data) : [];
}

// ================= REGISTER =================
exports.registerMember = (req, res) => {
  const { firstName, lastName, age, dob, phone, password } = req.body;

  if (!firstName || !lastName || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "First Name, Last Name, Phone and Password are required",
    });
  }

  const members = readMembers();

  const exists = members.find((m) => m.phone === phone);
  if (exists) {
    return res.status(409).json({
      success: false,
      message: "Member already exists",
    });
  }

  // Hash password
  const passwordHash = bcrypt.hashSync(password, 10);

  const newMember = {
    id: Date.now(),
    firstName,
    lastName,
    age,
    dob,
    phone,
    passwordHash,
    subscription: null,
    attendance: [],
    createdAt: new Date().toISOString(),
  };

  members.push(newMember);
  fs.writeFileSync(filePath, JSON.stringify(members, null, 2));

  // Issue JWT on register
  const token = jwt.sign({ id: newMember.id, phone: newMember.phone }, JWT_SECRET, { expiresIn: '7d' });

  const safeMember = { ...newMember };
  delete safeMember.passwordHash;

  return res.json({
    success: true,
    member: safeMember,
    token,
  });
};

// ================= LOGIN =================
exports.loginMember = (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Phone number and password are required",
    });
  }

  const members = readMembers();
  const member = members.find((m) => m.phone === phone);

  if (!member) {
    return res.status(404).json({
      success: false,
      message: "Invalid phone number or password",
    });
  }

  // verify password
  const ok = member.passwordHash && bcrypt.compareSync(password, member.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
  }

  // Issue JWT on login
  const token = jwt.sign({ id: member.id, phone: member.phone }, JWT_SECRET, { expiresIn: '7d' });

  const safeMember = { ...member };
  delete safeMember.passwordHash;

  return res.json({
    success: true,
    member: safeMember,
    token,
  });
};

// ================= GET ME (protected) =================
exports.getMe = (req, res) => {
  const members = readMembers();
  const member = members.find((m) => m.id === req.user.id || m.phone === req.user.phone);

  if (!member) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }

  // Check if subscription has expired and update status
  if (member.subscription && member.subscription.status === 'active') {
    const endDate = new Date(member.subscription.endDate);
    const now = new Date();

    if (now > endDate) {
      // Subscription has expired, update status
      member.subscription.status = 'expired';

      // Save the updated member data
      const memberIndex = members.findIndex((m) => m.id === member.id);
      if (memberIndex !== -1) {
        members[memberIndex] = member;
        fs.writeFileSync(filePath, JSON.stringify(members, null, 2));
      }

      // Also update subscriptions.json if it exists
      try {
        const subscriptionsPath = path.join(__dirname, "../database/subscriptions.json");
        if (fs.existsSync(subscriptionsPath)) {
          const subscriptions = JSON.parse(fs.readFileSync(subscriptionsPath, 'utf8'));
          const subIndex = subscriptions.findIndex(s => s.memberId === member.id);
          if (subIndex !== -1) {
            subscriptions[subIndex].status = 'expired';
            fs.writeFileSync(subscriptionsPath, JSON.stringify(subscriptions, null, 2));
          }
        }
      } catch (error) {
        console.error('Error updating subscriptions.json:', error);
      }

      // Also update subscribed_members.json if it exists
      try {
        const subscribedMembersPath = path.join(__dirname, "../database/subscribed_members.json");
        if (fs.existsSync(subscribedMembersPath)) {
          const subscribedMembers = JSON.parse(fs.readFileSync(subscribedMembersPath, 'utf8'));
          const subIndex = subscribedMembers.findIndex(s => s.id === member.id);
          if (subIndex !== -1) {
            subscribedMembers[subIndex].subscription.status = 'expired';
            fs.writeFileSync(subscribedMembersPath, JSON.stringify(subscribedMembers, null, 2));
          }
        }
      } catch (error) {
        console.error('Error updating subscribed_members.json:', error);
      }
    }
  }

  const safeMember = { ...member };
  delete safeMember.passwordHash;

  return res.json({ success: true, member: safeMember });
};

// ================= UPDATE ME (protected) =================
exports.updateMe = (req, res) => {
  const updates = req.body || {};
  const members = readMembers();
  const idx = members.findIndex((m) => m.id === req.user.id || m.phone === req.user.phone);

  if (idx === -1) return res.status(404).json({ success: false, message: 'Member not found' });

  const member = members[idx];

  // allow updating these fields
  const fields = ['firstName','lastName','phone','age','dob','subscription'];
  fields.forEach((f) => { if (updates[f] !== undefined) member[f] = updates[f]; });

  // change password if provided
  if (updates.password) {
    member.passwordHash = bcrypt.hashSync(updates.password, 10);
  }

  members[idx] = member;
  fs.writeFileSync(filePath, JSON.stringify(members, null, 2));

  const safeMember = { ...member };
  delete safeMember.passwordHash;

  return res.json({ success: true, member: safeMember });
};