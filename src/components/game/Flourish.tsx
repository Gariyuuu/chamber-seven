import { Spade } from "lucide-react";
import { cn } from "@/lib/utils";

export function Flourish({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      <Spade className="size-3 fill-primary/70 text-primary/70" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}
