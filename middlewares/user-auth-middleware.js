

/**
 * Middleware function to check if user is authenticated.
 */
const userAuth = (req, res, next) => {
  const { userAuthenticated } = req.session.user || {};

  if (userAuthenticated) {
    return next();
  }

  res.redirect('/login');
}

module.exports = userAuth;
