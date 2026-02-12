const socket = io();

// UI Elements
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const fileGrid = document.getElementById('fileGrid');
const wipeBtn = document.getElementById('wipeBtn');

// 1. Initial Load & QR
fetch('/api/connect-info')
    .then(res => res.json())
    .then(data => {
        document.getElementById('qrImage').src = data.qr;
        document.getElementById('serverAddress').textContent = data.address;
    });

loadFiles();

// 2. Upload Logic
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('sharedFile', file);

    progressContainer.classList.remove('hidden');
    
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            progressBar.style.width = (e.loaded / e.total) * 100 + '%';
        }
    });

    xhr.addEventListener('load', () => {
        progressContainer.classList.add('hidden');
        progressBar.style.width = '0%';
        fileInput.value = ''; // Reset
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
});

// 3. Wipe Button
wipeBtn.addEventListener('click', () => {
    if(confirm('Delete all files and clear for everyone?')) {
        fetch('/api/clear', { method: 'POST' });
    }
});

// 4. Socket Events
socket.on('file-uploaded', (file) => addFileToGrid(file));
socket.on('files-cleared', () => {
    fileGrid.innerHTML = ''; // Wipe UI
    // Optional: Show a toast message "Session Cleared"
});

// 5. Helpers
function loadFiles() {
    fetch('/api/files')
        .then(res => res.json())
        .then(files => {
            fileGrid.innerHTML = '';
            files.forEach(addFileToGrid);
        });
}

function addFileToGrid(file) {
    const div = document.createElement('div');
    div.className = 'file-card';

    let previewContent = '';
    // Generate simple preview based on type
    if (file.type === 'IMAGE') {
        previewContent = `<img src="/files/${file.name}" alt="preview">`;
    } else if (file.type === 'VIDEO') {
        previewContent = `<video src="/files/${file.name}"></video>`; // Video thumbnail
    } else if (file.type === 'AUDIO') {
        previewContent = `🎵`;
    } else {
        previewContent = `📄`;
    }

    div.innerHTML = `
        <div class="preview-box">${previewContent}</div>
        <span class="file-name">${file.name}</span>
        <a href="/files/${file.name}" class="download-btn" download>Download</a>
    `;
    fileGrid.prepend(div);
}