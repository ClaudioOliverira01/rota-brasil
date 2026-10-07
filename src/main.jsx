import { createRoot } from "react-dom/client";

import "@fontsource-variable/fredoka";
import "./styles.css";

import App from "./App.jsx";
import { AccessibilityManager } from "./systems/AccessibilityManager.js";

// Carrega as opções de acessibilidade salvas (contraste, movimento, fonte)
// ANTES de desenhar qualquer tela.
AccessibilityManager.load();

createRoot(document.getElementById("root")).render(<App />);