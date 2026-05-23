const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const BASE_DIR = path.resolve(__dirname, '..');
const CONTRIB_DIR = path.join(BASE_DIR, 'contrib');

function ensureContribDir() {
  if (!fs.existsSync(CONTRIB_DIR)) fs.mkdirSync(CONTRIB_DIR, { recursive: true });
}

app.post('/contrib', (req, res) => {
  try {
    ensureContribDir();
    const payload = req.body || {};
    const ts = Date.now();
    const name = (payload.type || 'contrib').replace(/[^a-z0-9_-]/gi, '') || 'contrib';
    const rand = Math.random().toString(36).slice(2, 8);
    const filename = `${name}-${ts}-${rand}.json`;
    const filepath = path.join(CONTRIB_DIR, filename);
    const content = { ts, payload };
    fs.writeFileSync(filepath, JSON.stringify(content, null, 2), 'utf8');
    res.status(201).json({ ok: true, file: `contrib/${filename}` });
  } catch (err) {
    console.error('Error saving contribution:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/', (req, res) => res.send('Contrib server running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Contrib server listening on http://localhost:${PORT}`));
