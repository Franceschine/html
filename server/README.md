# Contrib server

Minimal Node/Express server to receive anonymous contributions and save them into `contrib/*.json` inside this repository.

Usage:

1. Install dependencies:

```bash
cd server
npm install
```

2. Run server:

```bash
npm start
```

The server listens by default on `http://localhost:3000` and accepts `POST /contrib` with a JSON payload. Files are saved under the repository `contrib/` directory.
