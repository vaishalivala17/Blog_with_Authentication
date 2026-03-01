const User = require('../models/User');

// Register - Show registration form
const showRegister = (req, res) => {
    res.render('pages/register', { 
        title: 'Register',
        error: null 
    });
};

// Register - Handle registration
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.render('pages/register', {
                title: 'Register',
                error: 'User with this email or username already exists'
            });
        }

        // Create new user (default role is 'user', can only be 'admin' through manual DB change)
        const user = new User({
            username,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'user' // For demo purposes, allow role selection
        });

        await user.save();
        
        res.redirect('/login?message=Registration successful! Please login.');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('pages/register', {
            title: 'Register',
            error: 'Registration failed. Please try again.'
        });
    }
};

// Login - Show login form
const showLogin = (req, res) => {
    res.render('pages/login', { 
        title: 'Login',
        error: null,
        message: req.query.message || null
    });
};

// Login - Handle login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('pages/login', {
                title: 'Login',
                error: 'Invalid email or password',
                message: null
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('pages/login', {
                title: 'Login',
                error: 'Invalid email or password',
                message: null
            });
        }

        // Set session
        req.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        };

        // Redirect based on role
        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('pages/login', {
            title: 'Login',
            error: 'Login failed. Please try again.',
            message: null
        });
    }
};

// Logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login?message=Logged out successfully!');
    });
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id).select('-password');
        res.render('pages/profile', { 
            title: 'My Profile',
            user 
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.redirect('/dashboard');
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        await User.findByIdAndUpdate(req.session.user._id, {
            username,
            email
        });
        
        req.session.user.username = username;
        req.session.user.email = email;
        
        res.redirect('/profile?message=Profile updated successfully!');
    } catch (error) {
        console.error('Profile update error:', error);
        res.redirect('/profile?error=Failed to update profile');
    }
};

// Update profile image
const updateProfileImage = async (req, res) => {
    try {
        upload.single('profileImage')(req, res, async (err) => {
            if (err) {
                return res.redirect('/profile?error=' + encodeURIComponent(err.message));
            }
            
            if (req.file) {
                await User.findByIdAndUpdate(req.session.user._id, {
                    profileImage: '/uploads/' + req.file.filename
                });
                req.session.user.profileImage = '/uploads/' + req.file.filename;
            }
            
            res.redirect('/profile?message=Profile image updated!');
        });
    } catch (error) {
        console.error('Image update error:', error);
        res.redirect('/profile?error=Failed to update image');
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (newPassword !== confirmPassword) {
            return res.redirect('/profile?error=Passwords do not match');
        }
        
        const user = await User.findById(req.session.user._id);
        const isMatch = await user.comparePassword(currentPassword);
        
        if (!isMatch) {
            return res.redirect('/profile?error=Current password is incorrect');
        }
        
        user.password = newPassword;
        await user.save();
        
        res.redirect('/profile?message=Password changed successfully!');
    } catch (error) {
        console.error('Password change error:', error);
        res.redirect('/profile?error=Failed to change password');
    }
};

// List all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.render('pages/admin/users', { 
            title: 'All Users',
            users 
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.redirect('/admin/dashboard');
    }
};

module.exports = {
    showRegister,
    register,
    showLogin,
    login,
    logout,
    getProfile,
    updateProfile,
    updateProfileImage,
    changePassword,
    getAllUsers
};
