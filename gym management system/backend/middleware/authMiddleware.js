const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  // Handle hardcoded owner token
  if (token === 'owner-token-8925782356') {
    req.user = { phone: '8925782356', role: 'owner' };
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // payload contains id, phone etc.
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
