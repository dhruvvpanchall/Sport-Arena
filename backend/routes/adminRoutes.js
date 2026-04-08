const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getStats, getAllUsers, getRoleRequests, approveRoleRequest, rejectRoleRequest, changeUserRole } = require('../controllers/adminController');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/role-requests', getRoleRequests);
router.put('/role-requests/:id/approve', approveRoleRequest);
router.put('/role-requests/:id/reject', rejectRoleRequest);
router.put('/users/:id/role', changeUserRole);

module.exports = router;
