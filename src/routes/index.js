const { Router } = require('express');
const authRoutes = require('./auth.routes');

const router = Router();

// A medida que avancemos semanas, aquí se van sumando:
// router.use('/users', userRoutes);
// router.use('/services', serviceRoutes);
// router.use('/requests', requestRoutes);
router.use('/auth', authRoutes);

module.exports = router;
