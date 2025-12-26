const Users = require('../data/users');

module.exports = (req, res, next) => {
  const token = (req.cookies && req.cookies.token) || req.headers['x-access-token'];
  console.log("Cookies/Headers recebidos:", req.cookies, req.headers['x-access-token'] ? 'Token in header' : 'No header token');
  if (!token) {
    return res.status(401).send({ auth: false, message: 'No token provided.' });
  }

  Users.verifyToken(token)
    .then((decoded) => {
      req.roleUser = decoded.scope || decoded.role;
      req.userId = decoded.id;
      next();
    })
    .catch(() => {
      res.status(401).send({ auth: false, message: 'Not authorized' })
    })
};