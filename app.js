const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

let otpStorage = {}; // Temporary storage for OTPs (use a database for production)

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Step 3: API to send OTP
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP in memory (associate with email)
  otpStorage[email] = otp;

  // Send Email
  transporter.sendMail({
    from: `"Verification Service" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  })
    .then(() => res.status(200).json({ message: 'OTP sent successfully' }))
    .catch((error) => res.status(500).json({ message: 'Error sending email', error }));
});

// Step 4: API to verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  // Validate OTP
  if (otpStorage[email] === otp) {
    // OTP is correct
    delete otpStorage[email]; // Remove used OTP
    return res.status(200).json({ message: 'Email verified successfully' });
  }

  return res.status(400).json({ message: 'Invalid OTP' });
});

// Step 5: Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




// arwaaaaaaaaaaaaaaaaa