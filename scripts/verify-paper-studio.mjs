import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const files = {
  globals: readFileSync(resolve(root, "app/[locale]/globals.css"), "utf8"),
  page: readFileSync(resolve(root, "app/[locale]/page.tsx"), "utf8"),
  left: readFileSync(resolve(root, "app/[locale]/LeftResourcePanel.tsx"), "utf8"),
  right: readFileSync(resolve(root, "app/[locale]/RightPropertyPanel.tsx"), "utf8"),
  toolbar: readFileSync(resolve(root, "app/[locale]/ImageEditorToolbar.tsx"), "utf8"),
  toggle: readFileSync(resolve(root, "app/[locale]/ThemeToggle.tsx"), "utf8"),
  layout: readFileSync(resolve(root, "app/[locale]/layout.tsx"), "utf8"),
};

const checks = [
  ["global paper palette exists", files.globals.includes("--paper-bg")],
  ["paper background treatment exists", files.globals.includes("radial-gradient(circle at 0%")],
  ["app shell has paper class", files.page.includes("paper-app")],
  ["canvas stage has paper class", files.page.includes("paper-canvas-stage")],
  ["resource panel has semantic class", files.left.includes("paper-resource-panel")],
  ["property panel has semantic class", files.right.includes("paper-property-panel")],
  ["toolbar has semantic class", files.toolbar.includes("paper-editor-toolbar")],
  ["theme toggle exists", files.toggle.includes("picprose-theme")],
  ["theme toggle persists selection", files.toggle.includes("localStorage.setItem")],
  ["theme init script exists", files.layout.includes("themeInitScript")],
  ["dark paper palette exists", files.globals.includes("html.dark") && files.globals.includes("--paper-accent: #9bc5bb")],
  ["tab cursor has a dedicated contrast token", files.globals.includes("--paper-tab-cursor")],
  ["selected tab text has a dedicated contrast rule", files.globals.includes("[data-slot=\"tab\"][aria-selected=\"true\"]")],
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length > 0) {
  console.error("Paper Studio visual verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Paper Studio visual verification: PASS");
