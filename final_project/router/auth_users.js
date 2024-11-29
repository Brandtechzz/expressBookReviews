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

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { username } = req.body; // Assuming you send the username as part of the body or extract from JWT later
    const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
    const { review } = req.body; // Extract the review from the request body

    // Validate input
    if (!isbn || !review) {
        return res.status(400).json({ message: "ISBN and review are required." });
    }

    // Find the book by ISBN
    const book = books[isbn]; // Access the book using the ISBN as a key

    // Check if the book exists
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Ensure reviews object exists
    if (!book.reviews) {
        book.reviews = [];
    }

    // Add the review, assuming reviews are stored as an array of strings
    book.reviews.push(review);
    
    // Respond with success message
    return res.status(200).json({ message: "Review added successfully!", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
