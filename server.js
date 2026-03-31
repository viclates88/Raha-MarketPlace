const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PENTING: Arahkan ke folder public atau folder utama
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Database sederhana (Vercel bersifat Read-Only, jadi ini untuk tampilkan data saja)
const databaseFile = path.join(__dirname, 'database.json');

// Route utama untuk ambil data barang
app.get('/api/items', (req, res) => {
    if (fs.existsSync(databaseFile)) {
        const data = fs.readFileSync(databaseFile);
        res.json(JSON.parse(data));
    } else {
        res.json([]);
    }
});

// Route untuk simpan barang (Catatan: Di Vercel Free, simpan data bersifat sementara)
app.post('/api/items', (req, res) => {
    const newItem = req.body;
    let items = [];
    if (fs.existsSync(databaseFile)) {
        items = JSON.parse(fs.readFileSync(databaseFile));
    }
    items.push(newItem);
    // fs.writeFileSync(databaseFile, JSON.stringify(items)); // Vercel nda izinkan tulis file permanen
    res.status(201).json(newItem);
});

// Jalur untuk buka halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// BAGIAN PALING PENTING UNTUK VERCEL
// Kita nda pakai app.listen(3000) lagi
module.exports = app;
