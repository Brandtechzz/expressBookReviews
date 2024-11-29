const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js"); // Local book data
const genl_routes = express.Router();

// Function to fetch books based on title from the provided API
const fetchBooksByTitle = async (title) => {
    const apiUrl = `https://brandonburke-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/${title}`; // Your API endpoint
    try {
        const response = await axios.get(apiUrl); // Sending GET request
        return response.data; // Return the book details from the API
    } catch (error) {
        console.error(error.response?.data || error.message); // Log the error
        throw new Error("Error fetching books by title: " + error.message); // Handle errors gracefully
    }
};

// Get book details based on title
genl_routes.get('/title/:title', async (req, res) => {
    const title = req.params.title; // Get the title from the request parameters
    try {
        const booksData = await fetchBooksByTitle(title); // Fetch books from the API
        return res.status(200).json(booksData); // Return fetched books data
    } catch (error) {
        // Handle error while fetching from the API
        console.error("Fetching error:", error.message); // Log detailed error
        return res.status(500).json({ message: error.message }); // Return internal server error message
    }

    // Optionally, check local books as well:
    const matchingBooks = books.filter(b => b.title.toLowerCase() === title.toLowerCase());
    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks); // Return local matching books
    } else {
        return res.status(404).json({ message: "No books found with that title." }); // Return not found
    }
});

// Export the routes
module.exports.general = genl_routes;

