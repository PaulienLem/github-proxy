import express from "express";
import fetch from "node-fetch";

const app = express();
app.set("etag", false);
const PORT = process.env.PORT || 3000;

// Proxy route
app.get("/proxy", async (req, res) => {
  const uri = req.query.uri;

  if (!uri) {
    return res.status(400).send("Missing 'uri' parameter");
  }

  // Only allow GitHub.io URLs
  if (!uri.match(/^https:\/\/[a-zA-Z0-9_-]+\.github\.io/)) {
    return res.status(403).send("Only GitHub.io URLs are allowed");
  }

  try {
    // Force fresh fetch by bypassing cache headers
    const response = await fetch(uri, {
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Expires": "0",
        "If-Modified-Since": "Thu, 01 Jan 1970 00:00:00 GMT"
      }
    });

    const data = await response.text();

    // Add CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", response.headers.get("content-type") || "text/plain");

    res.send(data);
  } catch (err) {
    console.error("Proxy fetch error:", err);
    res.status(500).send("Error fetching the requested URI");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
