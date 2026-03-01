const Blog = require('../models/Blog');

// Get all published blogs for home page
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' })
            .populate('author', 'username profileImage')
            .sort({ createdAt: -1 });
        res.render('pages/home', { 
            title: 'BlogApp - Home',
            blogs 
        });
    } catch (error) {
        console.error('Get blogs error:', error);
        res.render('pages/home', { 
            title: 'BlogApp - Home',
            blogs: [],
            error: 'Failed to load blogs'
        });
    }
};

// Get single blog
const getBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'username profileImage email');
        
        if (!blog) {
            return res.redirect('/?error=Blog not found');
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.render('pages/blog-detail', { 
            title: blog.title,
            blog 
        });
    } catch (error) {
        console.error('Get blog error:', error);
        res.redirect('/?error=Failed to load blog');
    }
};

// Get user's blog dashboard
const getDashboard = async (req, res) => {
    try {
        const userId = req.session.user._id;
        
        // If admin, get all blogs, otherwise get user's blogs
        let blogs;
        if (req.session.user.role === 'admin') {
            blogs = await Blog.find()
                .populate('author', 'username')
                .sort({ createdAt: -1 });
        } else {
            blogs = await Blog.find({ author: userId })
                .populate('author', 'username')
                .sort({ createdAt: -1 });
        }

        res.render('pages/dashboard', { 
            title: 'Dashboard',
            blogs,
            isAdmin: req.session.user.role === 'admin'
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.redirect('/?error=Failed to load dashboard');
    }
};

// Show create blog form
const showCreateBlog = (req, res) => {
    res.render('pages/create-blog', { 
        title: 'Create Blog',
        blog: null,
        error: null
    });
};

// Create new blog
const createBlog = async (req, res) => {
    try {
        const { title, content, category, tags, status } = req.body;
        
        // Validate required fields
        if (!title || !content) {
            return res.render('pages/create-blog', {
                title: 'Create Blog',
                blog: null,
                error: 'Title and content are required'
            });
        }

        const blog = new Blog({
            title,
            content,
            category: category || 'General',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status: status || 'published',
            author: req.session.user._id,
            image: req.file ? '/uploads/blogs/' + req.file.filename : '/uploads/default-blog.jpg'
        });

        await blog.save();
        res.redirect('/dashboard?message=Blog created successfully!');
    } catch (error) {
        console.error('Create blog error:', error);
        res.render('pages/create-blog', { 
            title: 'Create Blog',
            blog: null,
            error: 'Failed to create blog: ' + error.message
        });
    }
};

// Show edit blog form
const showEditBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.redirect('/dashboard?error=Blog not found');
        }

        // Check if user is authorized (admin or owner)
        if (blog.author.toString() !== req.session.user._id && req.session.user.role !== 'admin') {
            return res.redirect('/dashboard?error=You are not authorized to edit this blog');
        }

        res.render('pages/edit-blog', { 
            title: 'Edit Blog',
            blog,
            error: null
        });
    } catch (error) {
        console.error('Show edit blog error:', error);
        res.redirect('/dashboard?error=Failed to load blog');
    }
};

// Update blog
const updateBlog = async (req, res) => {
    try {
        const { title, content, category, tags, status } = req.body;
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.redirect('/dashboard?error=Blog not found');
        }

        // Check authorization
        if (blog.author.toString() !== req.session.user._id && req.session.user.role !== 'admin') {
            return res.redirect('/dashboard?error=You are not authorized');
        }

        // Validate required fields
        if (!title || !content) {
            return res.render('pages/edit-blog', {
                title: 'Edit Blog',
                blog,
                error: 'Title and content are required'
            });
        }

        blog.title = title;
        blog.content = content;
        blog.category = category || 'General';
        blog.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
        blog.status = status || 'published';
        
        if (req.file) {
            blog.image = '/uploads/blogs/' + req.file.filename;
        }

        await blog.save();
        res.redirect('/dashboard?message=Blog updated successfully!');
    } catch (error) {
        console.error('Update blog error:', error);
        res.redirect('/dashboard?error=Failed to update blog');
    }
};

// Delete blog
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.redirect('/dashboard?error=Blog not found');
        }

        // Check authorization
        if (blog.author.toString() !== req.session.user._id && req.session.user.role !== 'admin') {
            return res.redirect('/dashboard?error=You are not authorized');
        }

        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard?message=Blog deleted successfully!');
    } catch (error) {
        console.error('Delete blog error:', error);
        res.redirect('/dashboard?error=Failed to delete blog');
    }
};

// Like blog
const likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.redirect('/?error=Blog not found');
        }

        const userId = req.session.user._id;
        const likeIndex = blog.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Unlike
            blog.likes.splice(likeIndex, 1);
        } else {
            // Like
            blog.likes.push(userId);
        }

        await blog.save();
        res.redirect('/blog/' + req.params.id);
    } catch (error) {
        console.error('Like blog error:', error);
        res.redirect('/?error=Failed to like blog');
    }
};

// Get blogs by category
const getBlogsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const blogs = await Blog.find({ 
            status: 'published',
            category: category 
        })
        .populate('author', 'username profileImage')
        .sort({ createdAt: -1 });

        res.render('pages/category', { 
            title: `${category} - Blogs`,
            blogs,
            category
        });
    } catch (error) {
        console.error('Get blogs by category error:', error);
        res.redirect('/?error=Failed to load blogs');
    }
};

// Search blogs
const searchBlogs = async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        const blogs = await Blog.find({
            status: 'published',
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(searchQuery, 'i')] } }
            ]
        })
        .populate('author', 'username profileImage')
        .sort({ createdAt: -1 });

        res.render('pages/search', { 
            title: `Search Results - ${searchQuery}`,
            blogs,
            searchQuery
        });
    } catch (error) {
        console.error('Search blogs error:', error);
        res.redirect('/?error=Failed to search blogs');
    }
};

module.exports = {
    getAllBlogs,
    getBlog,
    getDashboard,
    showCreateBlog,
    createBlog,
    showEditBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    getBlogsByCategory,
    searchBlogs
};
