const ADMIN_EMAIL = 'akinrinadeakinniyi9@gmail.com';

function isAdmin(req, res, next) {
  const { email } = req.query;
  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }
  next();
}

module.exports = { isAdmin, ADMIN_EMAIL };
