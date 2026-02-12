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
