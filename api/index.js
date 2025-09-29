const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
    throw new Error('JWT_SECRET is required');
}

// Import routes
const authRoutes = require('../routes/authRoutes');
const templeRoutes = require('../routes/templeRoutes');
const bookingRoutes = require('../routes/bookingRoutes');
const contentRoutes = require('../routes/contentRoutes');
const serviceRoutes = require('../routes/serviceRoutes');
const userRoutes = require('../routes/userRoutes');
const subscriptionRoutes = require('../routes/subscriptionRoutes');

// Import middleware
const errorHandler = require('../middleware/error');

const app = express();

// Connect to MongoDB
const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined in the environment variables.');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
    }
};

// Connect to database
connectDB();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Root route for convenience
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Divine Darshan API is running. Available endpoints: /api/health, /api/auth, /api/temples, etc.'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Divine Darshan API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/temples', templeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Catch-all route for debugging
app.get('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /',
            'GET /api/health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/me',
            'GET /api/temples',
            'GET /api/services',
            'GET /api/content/testimonials'
        ]
    });
});

// Error Handler Middleware (must be after mounting routes)
app.use(errorHandler);

// Export the app for Vercel
module.exports = app;
