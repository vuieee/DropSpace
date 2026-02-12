const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const ALLOWED_TYPES = ['image/', 'video/', 'audio/'];

if (!fs.existsSync(UPLOAD_DIR)){
    fs.mkdirSync(UPLOAD_DIR);
}

// Clear on startup
const clearUploads = () => {
    if (fs.existsSync(UPLOAD_DIR)) {
        fs.readdirSync(UPLOAD_DIR).forEach((file) => {
            try { fs.unlinkSync(path.join(UPLOAD_DIR, file)); } catch(e) {}
        });
    }
};
clearUploads();

// --- Multer Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'shared-' + Date.now() + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE }
}).single('sharedFile');

// --- Routes ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(UPLOAD_DIR));

// Fix for Cloud: When on Render, the "IP" is just the website URL
app.get('/api/connect-info', (req, res) => {
    // req.get('host') automatically gets your "dropspace.onrender.com" address
    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}`;
    
    QRCode.toDataURL(url, (err, qrImage) => {
        if (err) return res.status(500).json({ error: 'Error' });
        res.json({ address: url, qr: qrImage });
    });
});

app.get('/api/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Error' });
        const fileList = files.filter(f => !f.startsWith('.')).map(f => ({
            name: f,
            type: f.match(/\.(jpg|jpeg|png|gif)$/i) ? 'IMAGE' : 'FILE'
        }));
        res.json(fileList);
    });
});

app.post('/api/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        const fileData = { name: req.file.filename, type: req.file.mimetype.split('/')[0].toUpperCase() };
        io.emit('file-uploaded', fileData);
        res.status(200).json({ message: 'Done' });
    });
});

app.post('/api/clear', (req, res) => {
    clearUploads();
    io.emit('files-cleared');
    res.json({ message: 'Wiped' });
});

// Use 0.0.0.0 to make sure Render can map the port correctly
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
