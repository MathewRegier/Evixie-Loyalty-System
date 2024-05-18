const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
  if (!token) return res.status(401).send({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send({ message: 'Invalid token' });
  }
}

function checkPermission(permission) {
  return (req, res, next) => {
    // Skip permission check for company logins
    if (req.user.userType === 'company') {
      return next();
    }

    // Check permissions for staff logins
    if (req.user.permissions && req.user.permissions[permission]) {
      next();
    } else {
      res.status(403).send({ message: 'Permission denied' });
    }
  };
}

module.exports = { authenticateToken, checkPermission };
