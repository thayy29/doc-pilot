"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const next = isDark ? "light" : "dark";

    if (next === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", next);
  }

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="h-10 w-10 rounded-full border border-border-strong bg-surface flex items-center justify-center transition-colors hover:bg-subtle"
      aria-label="Alternar tema"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground-muted"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}