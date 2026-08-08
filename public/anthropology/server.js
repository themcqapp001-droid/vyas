// Anthropology With DJ Sir — backend that serves the site and gives you an /admin channel
// to edit every notes/content section without touching HTML.
//
// Run locally:
//   npm install
//   ADMIN_PASSWORD=choose-a-real-password npm start
//   open http://localhost:3000  (site)
//   open http://localhost:3000/admin.html  (content editor)
//
// Deploy: push this folder to Render / Railway / Vercel (Node) / any VPS.
// Set the ADMIN_PASSWORD environment variable on whichever host you use —
// don't leave the default in production.

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CONTENT_PATH = path.join(__dirname, 'content.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';

app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname)); // serves index.html, admin.html, content.json, assets

// Simple shared-password auth via header. Good enough for a one-or-two-person
// content channel; swap for real accounts later if more people need access.
function checkAuth(req, res, next) {
  const supplied = req.headers['x-admin-password'];
  if (supplied !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect admin password.' });
  }
  next();
}

// Read current content (public — the site itself calls this)
app.get('/api/content', (req, res) => {
  fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read content.json' });
    res.type('json').send(data);
  });
});

// Overwrite content (protected — only admin.html should call this)
app.post('/api/content', checkAuth, (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'Body must be a JSON object.' });
  }
  // keep a rolling backup so a bad save is never unrecoverable
  const backupPath = path.join(__dirname, 'content.backup.json');
  fs.copyFile(CONTENT_PATH, backupPath, () => {
    fs.writeFile(CONTENT_PATH, JSON.stringify(incoming, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Could not write content.json' });
      res.json({ ok: true });
    });
  });
});

// Login check used by admin.html before showing the editor
app.post('/api/login', checkAuth, (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Anthropology With DJ Sir server running on http://localhost:${PORT}`);
  console.log(`Admin channel: http://localhost:${PORT}/admin.html`);
});
