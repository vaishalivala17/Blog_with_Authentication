const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Blog_With_Auth')
            .then(() => console.log('MongoDB Connected'))
            .catch(err => console.error('MongoDB connection error:', err));
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = {connectDb};