import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear ALL old localStorage and sessionStorage data
console.log("🧹 Clearing old storage...");
const keysToRemove = Object.keys(localStorage);
keysToRemove.forEach(key => {
  if (key.includes('supabase') || key.includes('cart') || key.includes('auth') || key.includes('session')) {
    console.log('Removing old key:', key);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage too
Object.keys(sessionStorage).forEach(key => {
  console.log('Clearing session key:', key);
  sessionStorage.removeItem(key);
});

console.log("✅ Storage cleared");

createRoot(document.getElementById("root")!).render(<App />);
