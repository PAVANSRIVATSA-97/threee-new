require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* 1. DATABASE CONNECTION */
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydb";

// Helper function to manage connection state
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Wait 5s for initial connection
            socketTimeoutMS: 45000,         // Keep socket open for 45s
            family: 4                       // Force IPv4 to prevent DNS delays
        });
        console.log("✅ Successfully connected to MongoDB Atlas");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
};

// Initial connection attempt
connectDB();

/* 2. SCHEMA & MODEL */
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { collection: 'users', timestamps: true });

const User = mongoose.model("User", userSchema);

/* 3. ROUTES */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html")); 
});

// ACTION: SIGNUP
app.post("/signup-user", async (req, res) => {
    // Ensure DB is connected before starting operation
    await connectDB();
    
    const { email, psw, "psw-repeat": repeatpassword } = req.body;

    if (psw !== repeatpassword) {
        return res.redirect("/index.html?error=mismatch");
    }

    try {
        const newUser = new User({ email, password: psw });
        await newUser.save();
        return res.redirect(`/home.html?user=${encodeURIComponent(email)}`);
    } catch (err) {
        if (err.code === 11000) {
            return res.redirect("/index.html?error=exists");
        }
        console.error("❌ Signup error:", err);
        return res.status(500).send("Internal Server Error - Check Vercel Logs");
    }
});

// ACTION: LOGIN
app.post("/login-user", async (req, res) => {
    // Ensure DB is connected
    await connectDB();
    
    const { email, psw } = req.body; 

    try {
        const userFound = await User.findOne({ email: email, password: psw });

        if (!userFound) {
            return res.redirect("/login.html?error=1");
        }
        return res.redirect(`/home.html?user=${encodeURIComponent(email)}`);
    } catch (err) {
        console.error("❌ Login error:", err);
        return res.status(500).send("Internal server error");
    }
});

/* 4. HELPER FUNCTION */
function redirect_to_home(username, res) {
    const homePath = path.join(__dirname, "public", "home.html");
    fs.readFile(homePath, "utf-8", (err, content) => {
        if (err) return res.status(500).send("Home page not found");
        const userDisplay = username.split("@")[0];
        const renderedHtml = ejs.render(content, { user: userDisplay });
        return res.send(renderedHtml);
    });
}

/* 5. START SERVER */
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
});
//---------------------------------------------------------------------------------------------------

// index.js

// index.js

// const express = require("express");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const ejs = require("ejs");
// const fs = require("fs");
// const path = require("path");

// const app = express();

// // Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

// /* 1. DATABASE CONNECTION */
// // Use 127.0.0.1 for local connection to mydb
// const MONGO_URI = "mongodb://127.0.0.1:27017/mydb"; 

// mongoose.connect(MONGO_URI)
//   .then(() => console.log("✅ Connected to Local MongoDB (mydb)"))
//   .catch((err) => console.log("❌ Connection Error:", err));

// /* 2. SCHEMA & MODEL */
// // Field names match your Compass screenshot exactly
// const userSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true }
// }, { collection: 'users', timestamps: true });

// const User = mongoose.model("User", userSchema);

// /* 3. ROUTES */

// app.get("/", (req, res) => {
//     return res.redirect("index.html");
// });

// app.post("/signup", async (req, res) => {
//     const { email, psw, "psw-repeat": repeatpassword } = req.body;

//     // Handle Password Mismatch
//     if (psw !== repeatpassword) {
//         return res.redirect("/index.html?error=mismatch");
//     }

//     try {
//         const newUser = new User({ email, password: psw });
//         await newUser.save();
//         return res.redirect(`/home.html?user=${encodeURIComponent(email)}`);
//     } catch (err) {
//         // Handle Duplicate Email (Mongo Error 11000)
//         if (err.code === 11000) {
//             return res.redirect("/index.html?error=exists");
//         }
//         console.error("❌ Signup error:", err);
//         return res.status(500).send("Internal Server Error");
//     }
// });

// // LOGIN ROUTE
// app.post("/login", async (req, res) => {
//     // UPDATED: Destructuring matches your login.html names 'email' and 'psw'
//     const { email, psw } = req.body; 

//     console.log(`Attempting login for: ${email}`); 

//     try {
//         // Find user where 'email' and 'password' match the mydb document
//         const userFound = await User.findOne({ 
//             email: email, 
//             password: psw 
//         });

//         if (!userFound) {
//             console.log("❌ Login failed: No matching user in mydb");
//             // UPDATED: Redirect with error flag instead of sending plain text
//             return res.redirect("/login.html?error=1");
//         }

//         console.log("✅ Login successful for:", email);
        
//         // Redirect to home and pass user email in the URL
//         return res.redirect(`/home.html?user=${encodeURIComponent(email)}`);

//     } catch (err) {
//         console.error("❌ Login error:", err);
//         return res.status(500).send("Internal server error");
//     }
// });

// /* 4. HELPER FUNCTION */
// function redirect_to_home(username, res) {
//     const homePath = path.join(__dirname, "public", "home.html");
    
//     fs.readFile(homePath, "utf-8", (err, content) => {
//         if (err) {
//             console.log("❌ File read error:", err);
//             return res.status(500).send("Home page not found");
//         }

//         // Display the part of email before the '@'
//         const userDisplay = username.split("@")[0];
//         const renderedHtml = ejs.render(content, { user: userDisplay });
        
//         return res.send(renderedHtml);
//     });
// }

// /* 5. START SERVER */
// const port = 3000;
// app.listen(port, () => {
//     console.log(`🚀 Server listening on port ${port}`);
// });