const fs = require('fs');
const path = require('path');

const memberFilePath = path.join(__dirname, "../database/members.json");
const subscriptionFilePath = path.join(__dirname, "../database/subscriptions.json");
const subscribedMembersFilePath = path.join(__dirname, "../database/subscribed_members.json");

function readMembers() {
  if (!fs.existsSync(memberFilePath)) fs.writeFileSync(memberFilePath, '[]');
  const raw = fs.readFileSync(memberFilePath, 'utf8') || '[]';
  return JSON.parse(raw);
}

function writeMembers(members) {
  fs.writeFileSync(memberFilePath, JSON.stringify(members, null, 2));
}

function readSubscriptions() {
  if (!fs.existsSync(subscriptionFilePath)) fs.writeFileSync(subscriptionFilePath, '[]');
  const raw = fs.readFileSync(subscriptionFilePath, 'utf8') || '[]';
  return JSON.parse(raw);
}

function writeSubscriptions(subscriptions) {
  fs.writeFileSync(subscriptionFilePath, JSON.stringify(subscriptions, null, 2));
}

function readSubscribedMembers() {
  if (!fs.existsSync(subscribedMembersFilePath)) fs.writeFileSync(subscribedMembersFilePath, '[]');
  const raw = fs.readFileSync(subscribedMembersFilePath, 'utf8') || '[]';
  return JSON.parse(raw);
}

function writeSubscribedMembers(subscribedMembers) {
  fs.writeFileSync(subscribedMembersFilePath, JSON.stringify(subscribedMembers, null, 2));
}

// Create a mock payment intent and return a clientSecret
exports.createPayment = (req, res) => {
  const { planId } = req.body || {};
  if (!planId) return res.status(400).json({ success: false, message: 'planId required' });

  // create mock payment id/secret
  const paymentId = `pay_${Date.now()}`;
  const clientSecret = `mock_secret_${paymentId}`;

  return res.json({ success: true, paymentId, clientSecret });
};

// Confirm mock payment and attach subscription to member
exports.confirmPayment = (req, res) => {
  const { paymentId, plan } = req.body || {};
  if (!paymentId || !plan) return res.status(400).json({ success: false, message: 'paymentId and plan required' });

  // find member by req.user (auth middleware should set it)
  const members = readMembers();
  const idx = members.findIndex(m => m.id === req.user.id || m.phone === req.user.phone);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Member not found' });

  // Calculate subscription dates
  const startDate = new Date();
  const endDate = new Date();
  
  // Add months based on plan
  const months = plan.id === '3m' ? 3 : 
                plan.id === '6m' ? 6 : 
                plan.id === '9m' ? 9 : 12;
  endDate.setMonth(endDate.getMonth() + months);

  // Create subscription object
  const subscription = {
    id: plan.id || plan.planId || `${plan.title || 'plan'}_${Date.now()}`,
    title: plan.title || plan.name || 'Subscription',
    price: plan.price || plan.amount || '0',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: 'active',
    paymentId,
    paymentDate: new Date().toISOString(),
    duration: months
  };

  // Update members.json with subscription
  members[idx].subscription = subscription;
  writeMembers(members);

  // Add to subscriptions.json for owner dashboard
  const subscriptions = readSubscriptions();
  const subscriptionEntry = {
    memberId: members[idx].id,
    memberPhone: members[idx].phone,
    ...subscription
  };
  
  // Remove old subscription for this member if exists
  const existingIdx = subscriptions.findIndex(s => s.memberId === members[idx].id);
  if (existingIdx !== -1) {
    subscriptions[existingIdx] = subscriptionEntry;
  } else {
    subscriptions.push(subscriptionEntry);
  }
  writeSubscriptions(subscriptions);

  // Add to subscribed_members.json for separate tracking
  const subscribedMembers = readSubscribedMembers();
  const subscribedMemberEntry = {
    id: members[idx].id,
    firstName: members[idx].firstName,
    lastName: members[idx].lastName,
    phone: members[idx].phone,
    subscription: subscription,
    createdAt: members[idx].createdAt
  };

  // Remove old entry if exists
  const existingSubscribedIdx = subscribedMembers.findIndex(s => s.id === members[idx].id);
  if (existingSubscribedIdx !== -1) {
    subscribedMembers[existingSubscribedIdx] = subscribedMemberEntry;
  } else {
    subscribedMembers.push(subscribedMemberEntry);
  }
  writeSubscribedMembers(subscribedMembers);

  const safe = { ...members[idx] };
  delete safe.passwordHash;

  return res.json({ success: true, member: safe, subscription });
};