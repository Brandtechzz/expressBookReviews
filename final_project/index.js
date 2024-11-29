const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated; // Routes for customer
const genl_routes = require('./router/general.js').general; // General routes

const app = express();

app.use(express.json());

// Secret used for signing JWTs
const JWT_SECRET = 'your_secret_key'; // Replace this with a secure key in production

// Session configuration
app.use("/customer", session({
    secret: "fingerprint_customer", // Use a strong secret in production
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token format

    if (!token) {
        return res.status(403).json({ error: "Unauthorized access. Please log in." });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token. Please log in again." });
        }
        // Attach username from token to the request
        req.username = decoded.username; 
        next();
    });
};

// Authentication middleware for customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if user is logged in using session
    if (req.session.user) {
        // User is authenticated, proceed to the next middleware
        next();
    } else {
        // User is not authenticated
        return res.status(403).json({ error: 'Unauthorized access. Please log in.' });
    }
});

// POST endpoint for handling login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Simulated user authentication (replace with database check)
    if (username === 'testuser' && password === 'pwd12') { // Change to variable/constants if needed
        req.session.user = username; // Store user information in session
        const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' }); // Generate token
        res.json({ message: 'Logged in successfully', token }); // Return token
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Example of a GET endpoint for accessing dashboard (protected route)
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.send(`Welcome ${req.session.user}`); // Display welcome message with user's name
    } else {
        res.status(403).send('Please log in first');
    }
});

// Use routes for customers and general access
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start server
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
