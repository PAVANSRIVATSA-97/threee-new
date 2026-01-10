THREEE - Entertainment redifined
THREEE is a full-stack web application designed for seamless user engagement and secure account management. Built with a focus on high availability and cloud-integrated data persistence, this project demonstrates a modern approach to user authentication and server-side rendering.

🚀 Live Demo: https://threee-new.vercel.app/

🛠 Tech Stack
Frontend: HTML5, CSS3, JavaScript (Vanilla)

Template Engine: EJS (Embedded JavaScript) for dynamic content rendering

Backend: Node.js with Express.js

Database: MongoDB Atlas (Cloud NoSQL)

ODM: Mongoose for data modeling and validation

Deployment: Vercel (Serverless Architecture)

✨ Features
Secure Authentication: User signup and login logic with unique email validation.

Cloud Persistence: Integration with MongoDB Atlas to ensure data remains persistent and secure outside of the local environment.

Dynamic UI: Uses EJS to personalize the user experience upon successful login.

Responsive Design: Optimized for both desktop and mobile viewing.

Environment Safety: Utilizes .env and Vercel Environment Variables to protect sensitive database credentials.

📂 Project Structure
Plaintext

├── public/             # Static files (HTML, CSS, Images)
│   ├── index.html      # Landing / Signup Page
│   ├── login.html      # Login Page
│   └── home.html       # Dashboard (Rendered via EJS)
├── index.js            # Main Express Server & Database Connection
├── package.json        # Project dependencies and scripts
└── .gitignore          # Files to exclude from Git (node_modules, .env)

📈 Deployment
This project is optimized for Vercel. By utilizing Vercel's serverless functions, the index.js file acts as the entry point, handling API routes and serving static assets through a custom configuration that bridges the frontend and backend seamlessly.
