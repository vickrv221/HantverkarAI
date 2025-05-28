const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifierar att användaren har giltig token och lägger till user info i req.user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 */
module.exports = (req, res, next) => {
  // Hämta token från header
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied - No token provided' });
  }

  try {
    // Verifiera token med JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    // Token är ogiltig eller har gått ut
    res.status(401).json({ message: 'Invalid token' });
  }
};