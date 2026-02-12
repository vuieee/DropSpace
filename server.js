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

// --- CLEANUP LOGIC ---
// Function to empty the upload directory
const clearUploads = () => {
    if (fs.existsSync(UPLOAD_DIR)) {
        fs.readdirSync(UPLOAD_DIR).forEach((file) => {
            const curPath = path.join(UPLOAD_DIR, file);
            fs.unlinkSync(curPath);
        });
        console.log('--- Storage Cleared ---');
    } else {
        fs.mkdirSync(UPLOAD_DIR);
    }
};

// Clear on startup
clearUploads();

// Clear on exit (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\nClosing server and cleaning up...');
    clearUploads();
    process.exit();
});

// --- Multer Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'shared-' + uniqueSuffix + ext); // Generic name for safety
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const isAllowed = ALLOWED_TYPES.some(type => file.mimetype.startsWith(type));
        if (isAllowed) cb(null, true);
        else cb(new Error('INVALID_FILE_TYPE'), false);
    }
}).single('sharedFile');

// --- Routes ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(UPLOAD_DIR));

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return 'localhost';
}

app.get('/api/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Error' });
        const fileList = files.filter(f => !f.startsWith('.')).map(f => {
            const ext = path.extname(f).toLowerCase();
            let type = 'FILE';
            if(['.jpg','.jpeg','.png','.gif'].includes(ext)) type = 'IMAGE';
            if(['.mp4','.mov','.avi','.mkv'].includes(ext)) type = 'VIDEO';
            if(['.mp3','.wav','.ogg'].includes(ext)) type = 'AUDIO';
            return { name: f, originalName: f, type: type };
        });
        res.json(fileList);
    });
});

app.get('/api/connect-info', (req, res) => {
    const localIp = getLocalIp();
    const url = `http://${localIp}:${PORT}`;
    QRCode.toDataURL(url, (err, qrImage) => {
        if (err) return res.status(500).json({ error: 'Error generating QR' });
        res.json({ address: url, qr: qrImage });
    });
});

app.post('/api/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'No file' });

        const fileData = { 
            name: req.file.filename, 
            type: req.file.mimetype.split('/')[0].toUpperCase() 
        };
        io.emit('file-uploaded', fileData);
        res.status(200).json({ message: 'Done', file: fileData });
    });
});

// New Endpoint: Manually clear files from UI
app.post('/api/clear', (req, res) => {
    clearUploads();
    io.emit('files-cleared'); // Tell all phones to wipe their screen
    res.json({ message: 'All files wiped' });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running. Files will be DELETED when you stop this.`);

});
