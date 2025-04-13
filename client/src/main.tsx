import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// The LanguageProvider is already inside App.tsx
createRoot(document.getElementById("root")!).render(
  <App />
);
