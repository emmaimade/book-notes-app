// middleware/auth.js
// Middleware for making user info available and protecting routes

/**
 * setUser
 * ----------------
 * Middleware to expose the authenticated user (if any) to all EJS templates.
 * It assigns req.user to res.locals.currentUser so views can conditionally render UI.
 */
export function setUser(req, res, next) {
  res.locals.currentUser = req.user;

  res.locals.hasBooks = false;
  next();
}

/**
 * ensureAuth
 * ----------------
 * Middleware to protect routes: allows only authenticated users to proceed.
 * If not authenticated, redirects to the login page with a flash message.
 */
export function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to view this page.');
  res.redirect('/auth/login');
}
