import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 5174;

console.log("Environment variables loaded:");
console.log("CLERK_KEY present:", !!process.env.CLERK_KEY);
console.log("WEBHOOK_SS present:", !!process.env.WEBHOOK_SS);
console.log(
  "VITE_CLERK_PUBLISHABLE_KEY present:",
  !!process.env.VITE_CLERK_PUBLISHABLE_KEY
);

const app = express();

app.use(bodyParser.json({ limit: "25mb" }));

if (!isDev) {
  app.use(express.static(path.join(__dirname, "dist")));
}

app.use("/api", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET"
    );
    res.status(200).end();
    return;
  }
  next();
});

app.use("/api", async (req, res, next) => {
  try {
    const apiPath = req.path;
    console.log(`API request received: ${req.method} ${apiPath}`);

    const filePath = path.join(__dirname, "src", "api", apiPath);
    console.log(`Looking for handler at: ${filePath}.js`);

    if (fs.existsSync(`${filePath}.js`)) {
      console.log(`Handler file found: ${filePath}.js`);
      try {
        const modulePath = `file://${filePath}.js`;
        console.log(`Importing module from: ${modulePath}`);
        const module = await import(modulePath);

        if (!module.default) {
          console.error(`No default export found in ${filePath}.js`);
          return res
            .status(500)
            .json({ error: "API handler not properly exported" });
        }

        const handler = module.default;
        console.log(`Handler loaded, executing...`);

        await handler(req, res);
      } catch (error) {
        console.error("Error importing or executing API handler:", error);
        res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    } else {
      next();
    }
  } catch (error) {
    console.error("API route error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

if (!isDev) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`> Server running on http://localhost:${port}`);
});
