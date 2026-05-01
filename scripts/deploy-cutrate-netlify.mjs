import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";

const SITE_ID = process.env.NETLIFY_SITE_ID || "a7128f66-eb0a-4f1f-beae-6144289f401a";
const token = process.env.NETLIFY_AUTH_TOKEN;
const root = resolve("deficit-dial");
const api = "https://api.netlify.com/api/v1";

if (!token) {
  throw new Error("Set NETLIFY_AUTH_TOKEN before running this deploy script.");
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function digest(file, algorithm) {
  return createHash(algorithm).update(readFileSync(file)).digest("hex");
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    // Keep raw response text.
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${url}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }

  return body;
}

function buildFunctionZip() {
  const tempDir = mkdtempSync(join(tmpdir(), "cutrate-netlify-function-"));
  const zipPath = join(tmpdir(), "submit-lead.zip");
  copyFileSync("netlify/functions/submit-lead.js", join(tempDir, "submit-lead.js"));
  execFileSync("/usr/bin/zip", ["-q", "-r", zipPath, "."], { cwd: tempDir });
  rmSync(tempDir, { recursive: true, force: true });
  return zipPath;
}

const functionZip = buildFunctionZip();
const files = {};
const bySha = new Map();

for (const file of walk(root)) {
  const deployPath = `/${relative(root, file).split(sep).join("/")}`;
  const sha = digest(file, "sha1");
  files[deployPath] = sha;
  bySha.set(sha, { deployPath, file });
}

const functionSha = digest(functionZip, "sha256");
const deploy = await apiFetch(`${api}/sites/${SITE_ID}/deploys`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    files,
    functions: {
      "submit-lead": functionSha,
    },
  }),
});

for (const sha of deploy.required || []) {
  const item = bySha.get(sha);
  if (!item) throw new Error(`Missing required file for hash ${sha}`);
  await apiFetch(`${api}/deploys/${deploy.id}/files${encodeURI(item.deployPath)}`, {
    method: "PUT",
    headers: { "Content-Type": contentType(item.file) },
    body: readFileSync(item.file),
  });
}

const requiredFunctions = (deploy.required_functions || []).map((fn) => (typeof fn === "string" ? fn : fn.sha));
if (requiredFunctions.includes(functionSha)) {
  await apiFetch(`${api}/deploys/${deploy.id}/functions/submit-lead?runtime=js`, {
    method: "PUT",
    headers: { "Content-Type": "application/zip" },
    body: readFileSync(functionZip),
  });
}

let done = await apiFetch(`${api}/deploys/${deploy.id}`);
for (let attempt = 0; attempt < 12 && done.state !== "ready"; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 2500));
  done = await apiFetch(`${api}/deploys/${deploy.id}`);
}

rmSync(functionZip, { force: true });

const url = done.ssl_url || done.deploy_ssl_url || done.url;
writeFileSync(1, `${url}\n`);
