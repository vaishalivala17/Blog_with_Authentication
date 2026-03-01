// Authentication middleware - checks if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Admin middleware - checks if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/');
};

// Guest middleware - redirects to dashboard if already logged in
const isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    res.redirect('/dashboard');
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isGuest
};
