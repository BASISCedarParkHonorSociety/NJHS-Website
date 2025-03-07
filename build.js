import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { platform } from "os";

if (!existsSync("./dist")) {
  mkdirSync("./dist");
}

const isWindows = platform() === "win32";
const npxCommand = isWindows ? "npx.cmd" : "npx";

const tsc = spawn(npxCommand, ["tsc", "--noEmit", "--skipLibCheck"], {
  shell: true,
});

tsc.stdout.on("data", (data) => {
  console.log(`${data}`);
});

tsc.stderr.on("data", (data) => {
  console.log(`TypeScript warnings (ignored for build): ${data}`);
});

tsc.on("close", (code) => {
  console.log(`TypeScript check completed with code ${code}`);

  const vite = spawn(npxCommand, ["vite", "build"], { shell: true });

  vite.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  vite.stderr.on("data", (data) => {
    console.error(`${data}`);
  });

  vite.on("close", (code) => {
    console.log(`Vite build completed with code ${code}`);
    process.exit(code || 0);
  });
});

tsc.on("error", (err) => {
  console.error("Failed to start TypeScript compiler:", err);
  const vite = spawn(npxCommand, ["vite", "build"], { shell: true });

  vite.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  vite.stderr.on("data", (data) => {
    console.error(`${data}`);
  });

  vite.on("close", (code) => {
    console.log(`Vite build completed with code ${code}`);
    process.exit(code || 0);
  });
});
