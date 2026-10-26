"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const saved = window.localStorage.getItem("analytics-theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("analytics-light", !isDark);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    window.localStorage.setItem("analytics-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("analytics-light", !next);
  }
  return <button type="button" onClick={toggle} className="analytics-theme-toggle" aria-label="Alternar tema">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>;
}
