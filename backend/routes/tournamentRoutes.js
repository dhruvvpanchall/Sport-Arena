const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllTournaments, getTournamentById, getRegisteredTournaments, withdrawFromTournament,
  getMyTournaments, createTournament,
  updateTournament, deleteTournament, registerForTournament, getRegistrations,
} = require('../controllers/tournamentController');

// Optional auth — attaches req.user if token exists, but doesn't block if missing
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role };
    } catch {
      // invalid token, continue without user
    }
  }
  next();
};

// Public (with optional auth to check registration status)
router.get('/', optionalAuth, getAllTournaments);

// User: registered tournaments
router.get('/registered', protect, getRegisteredTournaments);

// Organizer only (must be before /:id to avoid conflict)
router.get('/my', protect, authorize('organizer', 'admin'), getMyTournaments);

// Single tournament (after all named routes)
router.get('/:id', optionalAuth, getTournamentById);
router.post('/:id/register', protect, registerForTournament);
router.delete('/:id/register', protect, withdrawFromTournament);
router.post('/', protect, authorize('organizer', 'admin'), createTournament);
router.put('/:id', protect, authorize('organizer', 'admin'), updateTournament);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteTournament);
router.get('/:id/registrations', protect, authorize('organizer', 'admin'), getRegistrations);

module.exports = router;
