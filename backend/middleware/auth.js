const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
    console.log(req.user,'ds');
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
}

module.exports = { authenticateUser }; 