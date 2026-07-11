import { Moon, Sun, type LucideIcon } from "lucide-react";
import type { Theme } from "../hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

interface ToggleMeta {
  label: string;
  Icon: LucideIcon;
}

// In dark mode the control offers the sun (switch to light) and vice-versa,
// mirroring the sun/moon icons in the Figma frames.
function getToggleMeta(theme: Theme): ToggleMeta {
  if (theme === "dark") {
    return { label: "Mudar para o tema claro", Icon: Sun };
  }
  return { label: "Mudar para o tema escuro", Icon: Moon };
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const { label, Icon } = getToggleMeta(theme);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-fg transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/20 dark:hover:bg-white/10"
    >
      <Icon className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
