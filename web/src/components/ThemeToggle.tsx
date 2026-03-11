"use client";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export default function ThemeToggle() {
  function toggle() {
    const current = getCurrentTheme();
    const next: Theme = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/15 dark:bg-black dark:text-white dark:hover:bg-white/10"
    >
      Alternar tema
    </button>
  );
}