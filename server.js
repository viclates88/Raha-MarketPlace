const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// --- KONFIGURASI DATABASE ---
const mongoURI = "mongodb+srv://adhityabima:[PASSWORD_ASLIMU]@cluster0.qizddv3.mongodb.net/raha_market?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("Terhubung ke MongoDB!"))
  .catch(err => console.log("Error Database:", err));

// Schema Data Barang
const ItemSchema = new mongoose.Schema({
    nama: String,
    harga: Number,
    kategori: String,
    penjual: String,
    wa: String,
    tanggal: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', ItemSchema);

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// --- ROUTE API ---

// Ambil semua barang dari MongoDB
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ tanggal: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Simpan barang ke MongoDB
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
