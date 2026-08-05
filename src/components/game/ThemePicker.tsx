"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DEFAULT_THEME_ID, THEME_PRESETS, THEME_STORAGE_KEY } from "@/lib/themePresets";
import { cn } from "@/lib/utils";

function readStoredTheme(): string {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  return localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
}

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = current;
  }, [current]);

  function pick(id: string) {
    localStorage.setItem(THEME_STORAGE_KEY, id);
    setCurrent(id);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Choose a table vibe" className="text-muted-foreground">
          <Palette className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            Table vibe
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2">
          {THEME_PRESETS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                current === t.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
