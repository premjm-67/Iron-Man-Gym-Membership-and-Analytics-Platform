const express = require("express");
const router = express.Router();
const {
  registerMember,
  loginMember,
  getMe,
  updateMe,
  getAttendance,
  markAttendance
} = require("../controllers/memberController");
const auth = require('../middleware/authMiddleware');

router.post("/register", registerMember);
router.post("/login", loginMember);

// protected
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.get('/attendance', auth, getAttendance);
router.post('/attendance', auth, markAttendance);

module.exports = router;
