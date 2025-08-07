const fs = require("fs");
const path = require("path");

function loadBannedDomains() {
  const filePath = path.join(__dirname, "bannedDomains.txt");
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line && !line.startsWith("#")); // ignore empty lines or comments
}

module.exports = loadBannedDomains;