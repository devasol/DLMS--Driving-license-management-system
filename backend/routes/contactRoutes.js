import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';

const router = express.Router();

// Contact form submission
router.post('/submit', submitContactForm);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: "Contact routes are working!",
    timestamp: new Date().toISOString()
  });
});

export default router;
