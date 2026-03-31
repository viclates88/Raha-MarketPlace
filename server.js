const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Konfigurasi Upload Foto
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

const DB_FILE = 'database.json';
const RATING_FILE = 'ratings.json';

// Helper Fungsi Database
function bacaDB(file) {
    if (!fs.existsSync(file)) return file === DB_FILE ? [] : {};
    return JSON.parse(fs.readFileSync(file));
}

function simpanDB(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- ROUTE API PRODUK ---
app.get('/api/produk', (req, res) => res.json(bacaDB(DB_FILE)));

app.post('/api/produk', upload.single('foto'), (req, res) => {
    const data = bacaDB(DB_FILE);
    const baru = {
        id: Date.now(),
        nama: req.body.nama,
        harga: req.body.harga,
        wa: req.body.wa,
        kategori: req.body.kategori,
        deskripsi: req.body.deskripsi,
        pemilik: req.body.penjual,
        foto: `/uploads/${req.file.filename}`
    };
    data.push(baru);
    simpanDB(DB_FILE, data);
    res.json({ pesan: "Sip, terposting!" });
});

app.delete('/api/produk/:id', (req, res) => {
    const { user } = req.query;
    let data = bacaDB(DB_FILE);
    const produk = data.find(p => p.id == req.params.id);

    if (produk && produk.pemilik === user) {
        const pathFoto = path.join(__dirname, produk.foto);
        if (fs.existsSync(pathFoto)) fs.unlinkSync(pathFoto);
        data = data.filter(p => p.id != req.params.id);
        simpanDB(DB_FILE, data);
        res.json({ pesan: "Terhapus!" });
    } else {
        res.status(403).json({ pesan: "Gagal hapus!" });
    }
});

// --- ROUTE API RATING ---
app.get('/api/rating/:penjual', (req, res) => {
    const ratings = bacaDB(RATING_FILE);
    const d = ratings[req.params.penjual] || { total: 0, count: 0 };
    const skor = d.count > 0 ? (d.total / d.count).toFixed(1) : "0.0";
    res.json({ skor, jumlah: d.count });
});

app.post('/api/rating', (req, res) => {
    const { penjual, star } = req.body;
    let ratings = bacaDB(RATING_FILE);
    if (!ratings[penjual]) ratings[penjual] = { total: 0, count: 0 };
    ratings[penjual].total += parseInt(star);
    ratings[penjual].count += 1;
    simpanDB(RATING_FILE, ratings);
    res.json({ pesan: "Rating masuk!" });
});

app.listen(PORT, () => console.log(`Raha Market ON: http://localhost:${PORT}`));
