"use client";

import React from "react";

const THEME_STORAGE_KEY = "picprose-theme";
type Theme = "light" | "dark";

function applyTheme(theme: Theme, persist = false) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#151817" : "#faf9f6",
  );

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in private mode; the in-memory theme still applies.
    }
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("light");

  React.useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    let storedTheme: string | null = null;
    try {
      storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      storedTheme = null;
    }
    const initialTheme: Theme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : root.classList.contains("dark") || media.matches
        ? "dark"
        : "light";

    applyTheme(initialTheme);
    setTheme(initialTheme);

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      let hasStoredTheme = false;
      try {
        hasStoredTheme = Boolean(localStorage.getItem(THEME_STORAGE_KEY));
      } catch {
        hasStoredTheme = false;
      }

      if (!hasStoredTheme) {
        const nextTheme: Theme = event.matches ? "dark" : "light";
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }
    };

    media.addEventListener?.("change", handleSystemThemeChange);
    return () => media.removeEventListener?.("change", handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
    setTheme(nextTheme);
  };

  const isDark = theme === "dark";
  const label = isDark ? "切换浅色模式" : "切换深色模式";

  return (
    <button
      type="button"
      className="paper-theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="4" strokeWidth="1.7" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20.7 15.2A8.5 8.5 0 0 1 8.8 3.3 8.5 8.5 0 1 0 20.7 15.2Z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
