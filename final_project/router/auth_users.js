const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];

const isValid = (username) => {
    // Check if the username is valid (e.g., doesn't exist in the array)
    return !users.some(user => user.username === username);
  }

  const authenticatedUser = (username, password) => {
    // Check if the username and password match a registered user
    const user = users.find(user => user.username === username);
    return user && user.password === password; // Return true if user exists and password matches
  }

  // Middleware to check for the JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Split the Bearer from the token
    if (!token) return res.status(401).json({ message: "No access token provided" });

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" }); // Token expired or invalid
        req.user = user; // Store user info in request
        next(); // Proceed to the next middleware/route
    });
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body; // Retrieve username and password from request body

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check for valid user credentials
    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
        return res.status(200).json({ message: "Login successful", token });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// User Registration Endpoint
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    // Registration logic...
});

// User Login Endpoint
regd_users.post("/customer/login", (req, res) => {
    const { username, password } = req.body;
    // Authentication logic...
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the request parameters
    const { review } = req.body; // Extract review from the body
    const username = req.user.username; // Get username from the authenticated user

    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    const book = books.find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the user has already reviewed the book
    const existingReviewIndex = book.reviews.findIndex(r => r.username === username);

    if (existingReviewIndex !== -1) {
        // Update existing review
        book.reviews[existingReviewIndex].review = review;
        return res.status(200).json({ message: "Review updated successfully!", reviews: book.reviews });
    } else {
        // Add new review
        book.reviews.push({ username, review });
        return res.status(201).json({ message: "Review added successfully!", reviews: book.reviews });
    }
});

regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the request parameters
    const username = req.user.username; // Get the username from the authenticated user

    const book = books.find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Find the index of the review by this user
    const reviewIndex = book.reviews.findIndex(r => r.username === username);

    if (reviewIndex !== -1) {
        // Remove the review from the array
        book.reviews.splice(reviewIndex, 1);
        return res.status(200).json({ message: "Review deleted successfully!", reviews: book.reviews });
    } else {
        return res.status(404).json({ message: "Review not found." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

