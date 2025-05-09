
const express = require('express');
const multer = require('multer');
const qr = require('qrcode');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Set up SQLite database
const db = new sqlite3.Database('./transactions.db');

// Create table for storing transactions if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    amount REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Set up multer for handling QR file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

// Endpoint for uploading and processing QR code
app.post('/upload-qr', upload.single('qrCode'), (req, res) => {
    const qrImagePath = req.file.path;
    qr.toDataURL(qrImagePath, (err, url) => {
        if (err) return res.status(500).send('Error processing QR code');

        // Extract payment details from QR (assume QR contains simple JSON with sender and amount)
        let paymentDetails;
        try {
            paymentDetails = JSON.parse(url);
        } catch (e) {
            return res.status(400).send('Invalid QR code format');
        }

        // Save transaction to database
        const { sender, amount } = paymentDetails;
        const stmt = db.prepare('INSERT INTO transactions (sender, amount) VALUES (?, ?)');
        stmt.run(sender, amount, function(err) {
            if (err) return res.status(500).send('Error saving transaction');
            res.status(200).send({ transactionId: this.lastID, sender, amount });
        });
        stmt.finalize();
    });
});

// Endpoint for viewing transaction history
app.get('/transactions', (req, res) => {
    db.all('SELECT * FROM transactions ORDER BY timestamp DESC', (err, rows) => {
        if (err) return res.status(500).send('Error fetching transactions');
        res.status(200).json(rows);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
