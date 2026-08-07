import { Button } from "@/components/ui/button";
import { Crosshair, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActionBar({
  disabled,
  isSelf,
  targetName,
  onFire,
}: {
  disabled: boolean;
  isSelf: boolean;
  targetName: string;
  onFire: () => void;
}) {
  return (
    <Button
      size="lg"
      variant={isSelf ? "secondary" : "destructive"}
      disabled={disabled}
      onClick={onFire}
      className={cn("h-14 w-full gap-2 text-base", !disabled && "action-bar-ready")}
    >
      {isSelf ? <Target className="size-5" /> : <Crosshair className="size-5" />}
      {isSelf ? "Turn it on yourself" : `Aim at ${targetName}`}
    </Button>
  );
}
