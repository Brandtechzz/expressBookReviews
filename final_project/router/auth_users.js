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

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the request parameters
    const { review } = req.query; // Retrieve the review text from the request query
    const { username } = req.user; // Assuming username is stored in the session via JWT middleware

    // Validate that a review was provided
    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    // Find the book by ISBN
    const book = books.find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has already reviewed the book
    const existingReviewIndex = book.reviews.findIndex(r => r.username === username);

    if (existingReviewIndex !== -1) {
        // If the review exists, update it
        book.reviews[existingReviewIndex].review = review; // Update the existing review
        return res.status(200).json({ message: "Review updated successfully", reviews: book.reviews });
    } else {
        // If the review does not exist, add a new one
        book.reviews.push({ username, review }); // Add new review
        return res.status(201).json({ message: "Review added successfully", reviews: book.reviews });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
