import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import "lenis/dist/lenis.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
