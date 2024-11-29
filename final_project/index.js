const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer", // Use a strong secret in production
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set true in production with HTTPS
}));

// Authentication middleware
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
    // Simulated user authentication (replace with actual logic)
    if (username === 'user' && password === 'password') {
        req.session.user = username; // Store user information in session
        res.json({ message: 'Logged in successfully' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Example of a GET endpoint for accessing dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.send(`Welcome ${req.session.user}`); // Display welcome message with user's name
    } else {
        res.status(403).send('Please log in first');
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
