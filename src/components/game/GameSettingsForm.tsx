"use client";

import { GameSettings, TeamMode } from "@/lib/game/types";
import { ALL_ITEM_IDS, ITEM_INFO } from "@/lib/game/items";
import { itemColor, COLOR_BORDER, COLOR_BG_SOFT, COLOR_TEXT } from "@/lib/game/colors";
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
const TEAM_MODE_OPTIONS: { value: TeamMode; label: string; hint: string }[] = [
  { value: "none", label: "Free-for-all", hint: "Every seat for themselves." },
  { value: "duos", label: "2v2 Duos", hint: "Seats 1+3 vs 2+4. No friendly fire. Requires 4 players, single round." },
  { value: "boss", label: "Boss Battle", hint: "Everyone vs the last seat, who gets bonus HP and items. Single round." },
];

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

  function setPlayerCount(v: 2 | 3 | 4) {
    const next: GameSettings = { ...settings, playerCount: v };
    if (settings.teamMode === "duos" && v !== 4) next.teamMode = "none";
    onChange(next);
  }

  function setTeamMode(v: TeamMode) {
    const next: GameSettings = { ...settings, teamMode: v };
    if (v === "duos") next.playerCount = 4;
    if (v !== "none") next.roundsToWin = 1;
    onChange(next);
  }

  const activeTeamHint = TEAM_MODE_OPTIONS.find((o) => o.value === settings.teamMode)?.hint;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{playerCountLabel}</p>
        <OptionRow options={PLAYER_OPTIONS} value={settings.playerCount} onSelect={setPlayerCount} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Team mode</p>
        <OptionRow
          options={TEAM_MODE_OPTIONS.map((o) => o.value)}
          value={settings.teamMode}
          onSelect={setTeamMode}
          render={(v) => TEAM_MODE_OPTIONS.find((o) => o.value === v)?.label ?? String(v)}
        />
        {activeTeamHint && <p className="mt-1.5 text-xs text-muted-foreground">{activeTeamHint}</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Match length</p>
        {settings.teamMode === "none" ? (
          <OptionRow
            options={ROUNDS_OPTIONS.map((o) => o.value)}
            value={settings.roundsToWin}
            onSelect={(v) => set("roundsToWin", v)}
            render={(v) => ROUNDS_OPTIONS.find((o) => o.value === v)?.label ?? String(v)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Single round — team modes decide it in one go.</p>
        )}
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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Item pool ({settings.enabledItems.length}/{ALL_ITEM_IDS.length})
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="text-xs text-accent hover:underline"
              onClick={() => set("enabledItems", ALL_ITEM_IDS)}
            >
              All
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline"
              onClick={() => set("enabledItems", [ALL_ITEM_IDS[0]])}
            >
              None
            </button>
          </div>
        </div>
        <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto rounded-md border border-border/60 p-2 sm:grid-cols-3">
          {ALL_ITEM_IDS.map((item) => {
            const enabled = settings.enabledItems.includes(item);
            const color = itemColor(item);
            function toggle() {
              const next = enabled
                ? settings.enabledItems.filter((i) => i !== item)
                : [...settings.enabledItems, item];
              set("enabledItems", next.length > 0 ? next : settings.enabledItems);
            }
            return (
              <button
                key={item}
                type="button"
                onClick={toggle}
                title={ITEM_INFO[item].description}
                className={cn(
                  "truncate rounded-md border px-2 py-1 text-left text-xs transition-colors",
                  enabled
                    ? cn(COLOR_BORDER[color], COLOR_BG_SOFT[color], COLOR_TEXT[color])
                    : "border-border/40 text-muted-foreground/40 line-through",
                )}
              >
                {ITEM_INFO[item].name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
