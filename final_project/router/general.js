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

const axios = require('axios'); // Import Axios

// Define the route for fetching books
public_users.get('/', function (req, res) {
    axios.get('https://brandonburke-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books')
        .then(function (response) {
            // Successful response, send books as JSON
            res.status(200).json(response.data);
        })
        .catch(function (error) {
            // Handle error if the request fails
            res.status(500).json({ message: 'Error retrieving books', error: error.message });
        });
});

// Get book details based on ISBN (using object structure)
public_users.get('/:isbn', function (req, res) {
    const { isbn } = req.params; // Get the ISBN from the URL params

    axios.get(`https://brandonburke-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/${isbn}`)
        .then(function (response) {
            // Successful response, send book details as JSON
            res.status(200).json(response.data);
        })
        .catch(function (error) {
            // Handle error if the request fails
            res.status(500).json({ message: 'Error retrieving book details', error: error.message });
        });
});
  
// Get book details based on author
public_users.get('/author/:authorName', function (req, res) {
    const { authorName } = req.params; // Get the author name from the URL params

    axios.get(`https://brandonburke-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/author/${authorName}`)
        .then(function (response) {
            // Successful response, send books by author as JSON
            res.status(200).json(response.data);
        })
        .catch(function (error) {
            // Handle error if the request fails
            res.status(500).json({ message: 'Error retrieving books by author', error: error.message });
        });
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    const { title } = req.params; // Get the book title from the URL params

    axios.get(`https://brandonburke-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/title/${title}`)
        .then(function (response) {
            // Successful response, send book details as JSON
            res.status(200).json(response.data);
        })
        .catch(function (error) {
            // Handle error if the request fails
            res.status(500).json({ message: 'Error retrieving book details by title', error: error.message });
        });
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
