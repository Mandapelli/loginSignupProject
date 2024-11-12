require('dotenv').config(); // Load .env file for environment variables
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios'); // For making API requests to Groq
const fileUpload = require('express-fileupload'); // For handling file uploads

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests
app.use(fileUpload()); // Handle file uploads

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000', // Replace with your actual password
  database: 'SignInLogin' // Replace with your database name
});

// Test DB connection
db.connect(err => {
  if (err) {
    console.error('Error connecting to Db:', err.message);
    return;
  }
  console.log('Connected to the database');
});

// Function to analyze text using the Groq API
async function analyzeTextWithGroq(text) {
  const apiKey = process.env.GROQ_API_KEY;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.2-11b-text-preview",
        messages: [{ role: "user", content: text }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing text:', error.message);
    return 'Error analyzing text';
  }
}

// Route to analyze text input (Groq API Integration)
app.post('/api/analyze-text', async (req, res) => {
  const { booking_info } = req.body;

  if (!booking_info) {
    return res.status(400).json({ error: 'Please enter some text to analyze.' });
  }

  try {
    const analyzedText = await analyzeTextWithGroq(booking_info);
    res.json({ analyzed_text: analyzedText });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze text.' });
  }
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;

  console.log('Received signup request:', req.body); // Log incoming request data

  if (!name || !email || !password) {
    return res.status(400).send('Please provide all required fields.');
  }

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(query, [name, email, password], (error, results) => {
    if (error) {
      console.error('Error during signup:', error.message);
      return res.status(500).send('Server error: ' + error.message);
    }
    res.status(201).send('User registered successfully');
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (error, results) => {
    if (error || results.length === 0) {
      res.status(401).send('Invalid email or password');
    } else {
      res.status(200).send('Login successful');
    }
  });
});

// Route to handle image upload and text extraction (example with placeholder text)
app.post('/api/upload-image', async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).send('No image file uploaded.');
  }

  const image = req.files.image;
  const extractedText = 'Sample text extracted from image'; // Replace with actual OCR logic

  // Call generateHeading function to get a heading from the extracted text
  const heading = await analyzeTextWithGroq(extractedText);

  res.status(200).json({
    extractedText,
    heading
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
