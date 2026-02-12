# DropSpace
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployment: Render](https://img.shields.io/badge/Deployment-Render-46E3B7)](https://render.com)


DropSpace is a minimal, ephemeral file-sharing application designed for fast, cross-platform transfers. It functions as a temporary storage space that automatically wipes itself clean once the session is over or the server restarts.


## Project Structure

```text
local-share-app/
├── uploads/         (This folder gets created automatically to store files)
├── public/
│   ├── index.html   (Frontend structure)
│   ├── style.css    (Minimal UI styling)
│   └── script.js    (Frontend logic and socket events)
├── package.json     (Project dependencies)
└── server.js        (Node.js backend and file management)
```

## Features

* Grid UI: Clean grid layout with thumbnails for images and videos.
* Cross-Platform: Works on any device with a modern web browser.
* Instant Connection: QR code generation for mobile devices.
* Self-Destructing: All files are automatically deleted when the server stops.
* 200MB Limit: Supports files up to 200MB including video, audio, and pictures.

## Installation and Local Setup

1. Clone the repository:

```bash
git clone https://github.com/vuieee/DropSpace.git
cd DropSpace
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Access the app:

Open `http://localhost:3000` in your browser.

## Cloud Deployment

This application is optimized for deployment on Render.

| Setting              | Value            |
|----------------------|------------------|
| Runtime              | Node             |
| Build Command        | `npm install`    |
| Start Command        | `node server.js` |
| Environment Variable | `PORT` (Auto-detected) |

## Important Technical Notes

> **NOTE:**  
> Cold Starts: On free hosting tiers like Render, the server may sleep after 15 minutes of inactivity. Initial loading may take 30 to 60 seconds as the server wakes up.

> **WARNING:**  
> Ephemeral Storage: Files are stored in temporary memory. If the server goes to sleep or is restarted, all shared data is permanently deleted.
