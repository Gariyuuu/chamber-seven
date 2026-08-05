"use client";

import { GameSettings } from "@/lib/game/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PLAYER_OPTIONS = [2, 3, 4] as const;
const ROUNDS_OPTIONS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: "Best of 1" },
  { value: 2, label: "Best of 3" },
  { value: 3, label: "Best of 5" },
];
const ITEMS_OPTIONS = [2, 3, 4, 5] as const;

function OptionRow<T extends string | number>({
  options,
  value,
  onSelect,
  render,
}: {
  options: readonly T[];
  value: T;
  onSelect: (v: T) => void;
  render?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          size="sm"
          variant={value === opt ? "default" : "outline"}
          className={cn(value === opt && "shadow-[0_0_0_1px_var(--primary)]")}
          onClick={() => onSelect(opt)}
        >
          {render ? render(opt) : opt}
        </Button>
      ))}
    </div>
  );
}

export function GameSettingsForm({
  settings,
  onChange,
  playerCountLabel = "Players",
}: {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
  playerCountLabel?: string;
}) {
  function set<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{playerCountLabel}</p>
        <OptionRow options={PLAYER_OPTIONS} value={settings.playerCount} onSelect={(v) => set("playerCount", v)} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Match length</p>
        <OptionRow
          options={ROUNDS_OPTIONS.map((o) => o.value)}
          value={settings.roundsToWin}
          onSelect={(v) => set("roundsToWin", v)}
          render={(v) => ROUNDS_OPTIONS.find((o) => o.value === v)?.label ?? String(v)}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Health per round</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={2}
            max={20}
            className="w-20"
            value={settings.hpMin}
            onChange={(e) => set("hpMin", Number(e.target.value) || settings.hpMin)}
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="number"
            min={2}
            max={20}
            className="w-20"
            value={settings.hpMax}
            onChange={(e) => set("hpMax", Number(e.target.value) || settings.hpMax)}
          />
          <span className="text-xs text-muted-foreground">randomized each round</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Items per reload</p>
        <OptionRow options={ITEMS_OPTIONS} value={settings.itemsPerReload} onSelect={(v) => set("itemsPerReload", v)} />
      </div>
    </div>
  );
}
