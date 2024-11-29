const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const JWT_SECRET = 'your_secret_key'; // Replace this with a secure key in production

const isValid = (username) => {
    // Returns true if the username is valid (not already taken)
    return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    // Returns true if the username and password match one in the records.
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body; // Extract username and password

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if username and password match the records
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    // Send response with token
    return res.status(200).json({ message: "Login successful!", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from URL parameters
    const { username, review } = req.body; // Extract username and review from the body

    if (!username || !review) {
        return res.status(400).json({ message: "Username and review are required." });
    }

    const book = books[isbn]; // Access the book data

    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // If the reviews array doesn't exist, initialize it
    if (!Array.isArray(book.reviews)) {
        book.reviews = [];
    }

    // Check if review from the same user already exists
    const existingReviewIndex = book.reviews.findIndex(r => r.username === username);

    if (existingReviewIndex !== -1) {
        // Modify the existing review
        book.reviews[existingReviewIndex].text = review; // Update existing review
        return res.status(200).json({ message: "Review updated successfully!", reviews: book.reviews });
    } else {
        // Add a new review
        book.reviews.push({ username, text: review });
        return res.status(201).json({ message: "Review added successfully!", reviews: book.reviews });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
    const username = req.body.username; // Assuming username is passed in the body (typically from session/token)

    // Validate input
    if (!username) {
        return res.status(400).json({ message: "Username is required." });
    }

    const book = books[isbn]; // Access the book using the ISBN key

    // Check if the book exists
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Ensure the reviews array exists
    if (!Array.isArray(book.reviews)) {
        return res.status(404).json({ message: "No reviews found for this book." });
    }

    // Find the index of the review by the current user
    const reviewIndex = book.reviews.findIndex(r => r.username === username);

    if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found for this user." });
    }

    // Remove the review from the array
    book.reviews.splice(reviewIndex, 1); // Remove the review
    
    // Respond with success message
    return res.status(200).json({ message: "Review deleted successfully!", reviews: book.reviews });
});

// Export the router
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
