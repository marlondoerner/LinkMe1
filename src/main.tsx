/*
 * Zweck: Einstiegspunkt der React-App.
 * Kurz: Rendert die `App`-Komponente in das DOM-Element `#root`.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// App initial render
createRoot(document.getElementById("root")!).render(<App />);
