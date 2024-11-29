const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
console.log(books); // Debugging line to check what books is


public_users.post("/register", (req, res) => {
    // Step 1: Extract username and password from request body
    const { username, password } = req.body;

    // Step 2: Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Step 3: Check if the username already exists
    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Step 4: Register the new user
    const newUser = { username, password }; // In a real application, hashes the password here
    users.push(newUser); // Store the new user in the 'users' array

    // Step 5: Respond with success message
    return res.status(201).json({ message: "Customer successfully registered. Now you can login" });
});

// User login route
public_users.post("/login", (req, res) => {
    const { username, password } = req.body; // Extract username and password

    // Validate the input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check for a matching user
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials." }); // Unauthorized if credentials are incorrect
    }

    // Generate the JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    // Send the token in the response
    return res.status(200).json({ message: "Login successful!", token });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Return the list of books as JSON
    res.status(200).json(books); // Alternatively: res.status(200).json(JSON.stringify(books));
  });

// Get book details based on ISBN (using object structure)
public_users.get('/isbn/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const id = req.params.isbn; // Using the ISBN key directly

    // Find the book in the object using the keys
    const book = books[id];

    // Check if the book exists
    if (book) {
        return res.status(200).json(book); // Return the book details if found
    } else {
        return res.status(404).json({ message: "Book not found" }); // Return an error if not found
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // Step 1: Retrieve the author name from the request parameters
    const authorName = req.params.author.toLowerCase(); // Convert to lower case for case-insensitive matching

    // Step 2: Initialize an array to hold matching books
    let matchingBooks = [];

    // Step 3: Iterate through the 'books' object and check if the author matches
    for (const key in books) {
        if (books.hasOwnProperty(key)) {
            const book = books[key];
            // Check if the author matches
            if (book.author.toLowerCase() === authorName) {
                matchingBooks.push(book); // Add the matching book to the array
            }
        }
    }

    // Step 4: Check if any books were found
    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks); // Return the matched books
    } else {
        return res.status(404).json({ message: "No books found for this author" }); // No books matching the author
    }
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    // Step 1: Retrieve the title from the request parameters
    const bookTitle = req.params.title.toLowerCase(); // Convert to lower case for case-insensitive matching

    // Step 2: Initialize an array to hold matching books
    let matchingBooks = [];

    // Step 3: Iterate through the 'books' object and check if the title matches
    for (const key in books) {
        if (books.hasOwnProperty(key)) {
            const book = books[key];
            // Check if the title matches
            if (book.title.toLowerCase().includes(bookTitle)) {
                matchingBooks.push(book); // Add the matching book to the array
            }
        }
    }

    // Step 4: Check if any books were found
    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks); // Return the matched books
    } else {
        return res.status(404).json({ message: "No books found with that title" }); // No books matching the title
    }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    // Step 1: Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn; // This will be the "key" for the book

    // Step 2: Find the book in the books object based on the provided ISBN
    const book = books[isbn]; // Access the book directly using the ISBN key

    // Step 3: Check if the book exists and has reviews
    if (book) {
        // Check if the book has reviews
        if (Object.keys(book.reviews).length > 0) {
            return res.status(200).json(book.reviews); // Return the reviews
        } else {
            return res.status(404).json({}); // No reviews found
        }
    } else {
        return res.status(404).json({ message: "Book not found" }); // Book does not exist
    }
});

module.exports.general = public_users;
