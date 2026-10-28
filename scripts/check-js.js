"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const skippedDirs = new Set([
    ".git",
    ".vs",
    ".vscode",
    "node_modules",
    "mobile",
    "mobile_flutter",
    "src"
]);

function collectJsFiles(directory, files = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!skippedDirs.has(entry.name)) {
                collectJsFiles(path.join(directory, entry.name), files);
            }
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".js")) {
            files.push(path.join(directory, entry.name));
        }
    }

    return files;
}

const files = collectJsFiles(root);
let failed = false;

for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", file], {
        cwd: root,
        encoding: "utf8"
    });

    if (result.status !== 0) {
        failed = true;
        process.stderr.write(result.stderr || result.stdout);
        process.stderr.write(`\nSyntax check failed: ${path.relative(root, file)}\n`);
    }
}

if (failed) {
    process.exit(1);
}

console.log(`Checked ${files.length} JavaScript files.`);
