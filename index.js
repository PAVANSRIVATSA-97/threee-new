// index.js

// Load env vars (.env in dev; Environment Properties in EB)
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const app = express();

/* --------------------------- Middleware --------------------------- */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static assets (and index.html) from /public
app.use(express.static(path.join(__dirname, "public")));

// Optional CORS for simple dev
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

/* ------------------------ MongoDB Connection ---------------------- */
mongoose.set("strictQuery", false);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/threee";

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log(
      `✅ Connected to MongoDB (${MONGO_URI.includes("mongodb+srv") ? "Atlas" : "Local"})`
    );
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
  });

/* ----------------------------- Models ----------------------------- */
// NOTE: for production, add validation & unique index on email, and store a *hashed* password.
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { collection: "users", timestamps: true }
);

const User = mongoose.model("User", userSchema);

/* ----------------------------- Routes ----------------------------- */

// Root: serve /public/index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Sign Up
app.post("/signup", async (req, res) => {
  try {
    const { email, psw, "psw-repeat": repeatpassword } = req.body;

    if (!email || !psw || !repeatpassword) {
      return res.status(400).send("Missing required fields");
    }
    if (psw !== repeatpassword) {
      return res.status(400).send("Passwords do not match");
    }

    // WARNING: store hashed passwords in real apps.
    await User.create({ email, password: psw });
    console.log("✅ User inserted:", email);

    return redirectToHome(email, res);
  } catch (err) {
    console.error("❌ Error inserting user:", err);
    return res.status(500).send("Server error");
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, userpassword } = req.body;
    if (!username || !userpassword) {
      return res.status(400).send("Missing login credentials");
    }

    // TODO: verify password against stored hash; demo just checks user exists
    return redirectToHome(username, res);
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).send("Server error");
  }
});

/* --------------------------- Helper(s) ---------------------------- */
function redirectToHome(username, res) {
  const homePath = path.join(__dirname, "public", "home.html");

  fs.readFile(homePath, "utf-8", async (err, content) => {
    if (err) {
      console.error("❌ Error reading home.html:", err);
      return res.status(500).send("Server error");
    }

    const userDisplay = (username || "").split("@")[0] || "User";
    const renderedHtml = ejs.render(content, { user: userDisplay });

    try {
      const found = await User.findOne({ email: username }).lean();
      if (!found) {
        return res.status(404).send("Not a registered user");
      }
      return res.send(renderedHtml);
    } catch (dbErr) {
      console.error("❌ Database error:", dbErr);
      return res.status(500).send("Database error");
    }
  });
}

/* -------------------------- Start Server -------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
