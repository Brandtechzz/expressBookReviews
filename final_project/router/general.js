const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // Retrieve username and password from request body
  
    // Check for missing fields
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" }); // Bad request if fields are missing
    }
  
    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" }); // Conflict if user exists
    }
  
    // If the username is valid and new, add the user to the array
    users.push({ username, password }); // Store user in users array (consider hashing the password for security)
    
    // Register the specific username and password as provided
    if (username === "user12" && password === "pwd12") {
      return res.status(201).json({ message: "User registered successfully" }); // Created response for the specific user
    }
  
    return res.status(201).json({ message: "User registered successfully" }); // General success message for other registrations
  });

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Sending the list of books as a JSON response
  res.status(200).json(JSON.parse(JSON.stringify(books))); // Return books with HTTP status 200
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
  const book = books.find(b => b.isbn === isbn); // Find the book with the matching ISBN

  if (book) {
    return res.status(200).json(book); // If found, return the book details
  } else {
    return res.status(404).json({ message: "Book not found" }); // If not found, return an error message
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author; // Retrieve the author from the request parameters
  const matchingBooks = books.filter(b => b.author.toLowerCase() === author.toLowerCase()); // Filter books by author

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks); // If found, return the matching books
  } else {
    return res.status(404).json({ message: "No books found by this author" }); // If not found, return an error message
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title; // Retrieve the title from the request parameters
  const matchingBooks = books.filter(b => b.title.toLowerCase() === title.toLowerCase()); // Filter books by title (case-insensitive)

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks); // If found, return the matching books
  } else {
    return res.status(404).json({ message: "No books found with that title" }); // If not found, return an error message
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
  const book = books.find(b => b.isbn === isbn); // Find the book with the matching ISBN

  if (book) {
    // If the book is found, check if it has reviews
    if (book.reviews && book.reviews.length > 0) {
      return res.status(200).json(book.reviews); // Return the reviews for the book
    } else {
      return res.status(404).json({ message: "No reviews found for this book" }); // No reviews available
    }
  } else {
    return res.status(404).json({ message: "Book not found" }); // If the book is not found, return an error message
  }
});

module.exports.general = public_users;

