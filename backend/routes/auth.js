const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Authentication Routes för HantverkarAI
 * Hanterar registrering och inloggning av användare
 */

/**
 * POST /api/auth/register
 * Registrerar ny användare med företagsinformation
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, company } = req.body;
    
    // Kontrollera om användaren redan finns
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Användaren finns redan' });
    }

    // Skapa ny användare
    user = new User({
      email,
      password,
      company: {
        name: company.name,
        orgNumber: company.orgNumber,
        address: company.address,
        phone: company.phone,
        email: company.email
      }
    });

    // Hasha lösenordet
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Spara användaren
    await user.save();

    res.status(201).json({ message: 'Användare skapad framgångsrikt' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error vid registrering' });
  }
});

/**
 * POST /api/auth/login
 * Loggar in användare och returnerar JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hitta användaren
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Fel email eller lösenord' });
    }

    // Kontrollera lösenord
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Fel email eller lösenord' });
    }

    // Skapa JWT payload
    const payload = {
      user: { id: user.id }
    };

    // Signera JWT token
    const jwtSecret = process.env.JWT_SECRET || 'devSecret';
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1h' }, // Token gäller i 1 timme
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          throw err;
        }
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error vid inloggning' });
  }
});

module.exports = router;