"use strict";

const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
process.chdir(root);

console.log("Step E: running production build…\n");
execSync("npm run build", { stdio: "inherit", shell: true, cwd: root });
require("./verify-step-e.cjs");
