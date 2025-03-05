import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "./components/ThemeProvider";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY} 
        afterSignOutUrl="/"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
      >
        <App />
      </ClerkProvider>
    </ThemeProvider>
  </React.StrictMode>
);
