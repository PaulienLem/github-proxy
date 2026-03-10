const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Only allow GitHub URLs
function githubFilter(req, res, next) {
  const target = req.query.uri;
  if (!target || !/^https:\/\/[a-zA-Z0-9_-]+\.github\.io\//.test(target)) {
    return res.status(403).send('Forbidden: Only GitHub URLs allowed');
  }
  next();
}

// Proxy endpoint with CORS enabled
app.use('/proxy', githubFilter, createProxyMiddleware({
  target: 'http://dummy',
  changeOrigin: true,
  router: req => req.query.uri,
  onProxyRes: (proxyRes, req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow browser requests
  }
}));

app.listen(3000, () => console.log('Local GitHub-only proxy running on http://localhost:3000'));
