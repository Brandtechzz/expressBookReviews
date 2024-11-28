const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const accessToken = req.session.authorization?.accessToken; // Get the access token from the session
    if (!accessToken) {
        return res.status(401).json({ message: "No access token provided" }); // Unauthorized if no token
    }

    // Verify the access token
    jwt.verify(accessToken, 'access', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid access token" }); // Forbidden if token is invalid
        }
        
        // Token is valid; you can attach the decoded information to the request object
        req.user = decoded.data; // Attach user information for later use
        next(); // Proceed to the next middleware or route
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
