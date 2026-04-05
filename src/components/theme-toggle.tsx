"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-6 right-6 md:top-8 md:right-8 z-[999] p-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-center hover:scale-110 transition-transform group"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <IconSun className="w-5 h-5 text-yellow-500 group-hover:rotate-45 transition-transform" />
      ) : (
        <IconMoon className="w-5 h-5 text-brand-blue group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
