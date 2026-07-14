const fs = require("fs");
const http = require("http");
const path = require("path");

const rootDir = __dirname;
const port = Number(process.env.PORT || 4177);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function safePath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, normalized === "/" ? "index.html" : normalized);
  if (!filePath.startsWith(rootDir)) return null;
  return filePath;
}

function send(res, status, headers, body) {
  res.writeHead(status, {
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) {
    send(res, 405, { "Content-Type": "text/plain; charset=utf-8" }, "Method not allowed");
    return;
  }

  let filePath;
  try {
    filePath = safePath(new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname);
  } catch {
    send(res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad request");
    return;
  }

  if (!filePath) {
    send(res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    const target = !statError && stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(target, (readError, data) => {
      if (readError) {
        send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
        return;
      }

      const contentType = mimeTypes[path.extname(target).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": data.length,
        "Cache-Control": "no-store"
      });
      res.end(req.method === "HEAD" ? undefined : data);
    });
  });
});

server.listen(port, () => {
  console.log(`WHS homepage running at http://localhost:${port}`);
  console.log("Local QA login: dev.admin@whs.local / WHS_admin_2026!");
});
