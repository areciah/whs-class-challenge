const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const requiredFiles = [
  "README.md",
  "package.json",
  "server.js",
  ".gitignore",
  ".editorconfig",
  ".env.example",
  "index.html",
  "login.html",
  "assets/logo.png",
  "assets/f_logo.png",
  "config/local.settings.json",
  "css/site.css",
  "docs/SETUP.md",
  "js/app.js"
];

function assert(condition, message) {
  if (!condition) {
    console.error(`check failed: ${message}`);
    process.exit(1);
  }
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(rootDir, file)), `missing ${file}`);
}

const read = (file) => fs.readFileSync(path.join(rootDir, file), "utf8");
const readme = read("README.md");
const index = read("index.html");
const login = read("login.html");
const gitignore = read(".gitignore");
const settings = JSON.parse(read("config/local.settings.json"));

assert(readme.includes("로컬 QA 계정"), "README must document local QA accounts");
assert(readme.includes("dev.admin@whs.local"), "README must list the admin QA account");
assert(Array.isArray(settings.qaAccounts), "local.settings.json must include qaAccounts");
assert(settings.qaAccounts.some((account) => account.email === "dev.admin@whs.local"), "local.settings.json must include admin QA account");
assert(gitignore.includes("*.josn"), ".gitignore should contain the current local config typo");
assert(index.includes("js/app.js") && login.includes("js/app.js"), "pages must load app.js");
assert(!index.includes("-whs-obf") && !login.includes("-whs-obf"), "static homepage must not use obfuscated fonts");

console.log("Repository sanity check passed.");

