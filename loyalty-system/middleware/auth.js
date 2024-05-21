const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

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
