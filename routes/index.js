const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');
const blogController = require('../controllers/blogController');
const { isAuthenticated, isAdmin, isGuest } = require('../middleware/auth');

// Configure multer for file uploads (same as in index.js)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public/uploads/blogs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// ==================== Public Routes ====================

// Home page
router.get('/', blogController.getAllBlogs);

// Search blogs
router.get('/search', blogController.searchBlogs);

// Category blogs
router.get('/category/:category', blogController.getBlogsByCategory);

// Blog create route (must be BEFORE /blog/:id)
router.get('/blog/create', isAuthenticated, blogController.showCreateBlog);
router.post('/blog/create', isAuthenticated, upload.single('image'), blogController.createBlog);

// Blog detail (must be AFTER /blog/create)
router.get('/blog/:id', blogController.getBlog);

// ==================== Auth Routes ====================

// Register
router.get('/register', isGuest, authController.showRegister);
router.post('/register', isGuest, authController.register);

// Login
router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, authController.login);

// Logout
router.get('/logout', authController.logout);

// ==================== Protected Routes (Require Login) ====================

// Dashboard
router.get('/dashboard', isAuthenticated, blogController.getDashboard);

// Profile
router.get('/profile', isAuthenticated, authController.getProfile);
router.post('/profile/update', isAuthenticated, authController.updateProfile);
router.post('/profile/image', isAuthenticated, upload.single('profileImage'), authController.updateProfileImage);
router.post('/profile/password', isAuthenticated, authController.changePassword);

// Edit blog
router.get('/blog/edit/:id', isAuthenticated, blogController.showEditBlog);
router.post('/blog/edit/:id', isAuthenticated, upload.single('image'), blogController.updateBlog);

router.post('/blog/delete/:id', isAuthenticated, blogController.deleteBlog);

// Like blog
router.post('/blog/like/:id', isAuthenticated, blogController.likeBlog);

// ==================== Admin Routes ====================

// Admin dashboard
router.get('/admin/dashboard', isAuthenticated, isAdmin, (req, res) => {
    res.redirect('/dashboard');
});

// Admin users management
router.get('/admin/users', isAuthenticated, isAdmin, authController.getAllUsers);

// User blogs (admin view)
router.get('/user/:id/blogs', isAuthenticated, isAdmin, blogController.getUserBlogs);

module.exports = router;

