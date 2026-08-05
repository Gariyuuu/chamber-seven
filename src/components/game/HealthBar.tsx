export function HealthBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-28 overflow-hidden rounded-full bg-[oklch(0.32_0.13_25)] shadow-inner">
        <div
          className="h-full rounded-full bg-[oklch(0.64_0.19_145)] shadow-[0_0_8px_oklch(0.64_0.19_145_/_60%)] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {hp}/{maxHp}
      </span>
    </div>
  );
}
