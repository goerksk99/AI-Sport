import http from "node:http";
import { createReadStream, readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "app");
const version = JSON.parse(
  readFileSync(new URL("./version.json", import.meta.url), "utf8"),
).version;
const host = "127.0.0.1";
const port = 4173;
const url = `http://${host}:${port}`;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end();
    return;
  }
  try {
    const name = decodeURIComponent(new URL(req.url, url).pathname);
    let file = path.resolve(root, "." + name);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let meta = await stat(file).catch(() => null);
    if (meta?.isDirectory()) {
      file = path.join(file, "index.html");
      meta = await stat(file).catch(() => null);
    }
    if (!meta) {
      if (path.extname(name)) {
        res.writeHead(404);
        res.end();
        return;
      }
      file = path.join(root, "index.html");
      meta = await stat(file);
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Content-Length": meta.size,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") res.end();
    else
      createReadStream(file)
        .on("error", () => res.destroy())
        .pipe(res);
  } catch {
    if (!res.headersSent) res.writeHead(400);
    res.end("Anfrage konnte nicht verarbeitet werden.");
  }
});
server.on("error", (e) => {
  console.error(
    e.code === "EADDRINUSE"
      ? "Port 4173 ist bereits belegt. Schliesse zuerst ein eventuell schon geoeffnetes PULS-Startfenster und starte erneut."
      : e.message,
  );
  process.exitCode = 1;
});
server.listen(port, host, () => {
  console.log(
    `\nPULS ${version} ist bereit: ${url}\n\nDieses Fenster offen lassen. Beenden: Strg+C.\n`,
  );
  if (process.platform === "win32" && !process.env.PULS_NO_BROWSER) {
    const child = spawn("cmd.exe", ["/c", "start", url], { stdio: "ignore" });
    child.on("error", () =>
      console.log("Bitte die angezeigte Adresse im Browser oeffnen."),
    );
  }
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
