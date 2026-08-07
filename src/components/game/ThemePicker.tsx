"use client";

import { useEffect, useRef, useState } from "react";
import { ImageUp, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BG_STYLE_STORAGE_KEY,
  BG_STYLES,
  CUSTOM_BG_MAX_BYTES,
  CUSTOM_BG_STORAGE_KEY,
  DEFAULT_BG_STYLE_ID,
  DEFAULT_THEME_ID,
  THEME_PRESETS,
  THEME_STORAGE_KEY,
  backgroundUrl,
} from "@/lib/themePresets";
import { cn } from "@/lib/utils";

function readStoredTheme(): string {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  return localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
}

function readStoredStyle(): string {
  if (typeof window === "undefined") return DEFAULT_BG_STYLE_ID;
  return localStorage.getItem(BG_STYLE_STORAGE_KEY) ?? DEFAULT_BG_STYLE_ID;
}

function hasCustomBg(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(CUSTOM_BG_STORAGE_KEY);
}

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(readStoredTheme);
  const [style, setStyle] = useState(readStoredStyle);
  const [customBg, setCustomBg] = useState(hasCustomBg);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = current;
  }, [current]);

  function applyBackground(themeId: string, styleId: string) {
    if (styleId === DEFAULT_BG_STYLE_ID) {
      // Matches the CSS default per theme — let the stylesheet handle it.
      document.documentElement.style.removeProperty("--bg-image");
    } else {
      document.documentElement.style.setProperty("--bg-image", `url("${backgroundUrl(themeId, styleId)}")`);
    }
  }

  function pick(id: string) {
    localStorage.setItem(THEME_STORAGE_KEY, id);
    setCurrent(id);
    if (customBg) {
      localStorage.removeItem(CUSTOM_BG_STORAGE_KEY);
      setCustomBg(false);
    }
    applyBackground(id, style);
  }

  function pickStyle(id: string) {
    localStorage.setItem(BG_STYLE_STORAGE_KEY, id);
    setStyle(id);
    if (customBg) {
      localStorage.removeItem(CUSTOM_BG_STORAGE_KEY);
      setCustomBg(false);
    }
    applyBackground(current, id);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setUploadError("That's not an image file.");
      return;
    }
    if (file.size > CUSTOM_BG_MAX_BYTES) {
      setUploadError(`Keep it under ${Math.round(CUSTOM_BG_MAX_BYTES / 1_000_000)}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setUploadError("Couldn't read that image.");
        return;
      }
      try {
        localStorage.setItem(CUSTOM_BG_STORAGE_KEY, dataUrl);
      } catch {
        setUploadError("That image is too big to save — try a smaller one.");
        return;
      }
      document.documentElement.style.setProperty("--bg-image", `url("${dataUrl}")`);
      setCustomBg(true);
    };
    reader.onerror = () => setUploadError("Couldn't read that image.");
    reader.readAsDataURL(file);
  }

  function clearCustomBg() {
    localStorage.removeItem(CUSTOM_BG_STORAGE_KEY);
    setCustomBg(false);
    setUploadError(null);
    applyBackground(current, style);
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
                current === t.id && !customBg
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="font-medium">{t.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-1 space-y-2 border-t border-border/60 pt-3">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Background style
          </p>
          <div className="grid grid-cols-3 gap-2">
            {BG_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickStyle(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors",
                  style === s.id && !customBg
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="text-xs font-medium">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-1 space-y-2 border-t border-border/60 pt-3">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Custom background
          </p>
          {customBg ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
              <span className="text-sm font-medium">Using your own image</span>
              <Button variant="ghost" size="icon-sm" aria-label="Remove custom background" onClick={clearCustomBg}>
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
              <ImageUp className="size-4" />
              Upload an image
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          <p className="text-xs text-muted-foreground">
            Stays on this device only, under {Math.round(CUSTOM_BG_MAX_BYTES / 1_000_000)}MB. Pick a vibe or style above to go back to a built-in background.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
