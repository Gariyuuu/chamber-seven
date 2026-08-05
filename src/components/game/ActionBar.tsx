import { Button } from "@/components/ui/button";
import { Crosshair, Target } from "lucide-react";

export function ActionBar({
  disabled,
  opponentName,
  onFireSelf,
  onFireOpponent,
}: {
  disabled: boolean;
  opponentName: string;
  onFireSelf: () => void;
  onFireOpponent: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        size="lg"
        variant="secondary"
        disabled={disabled}
        onClick={onFireSelf}
        className="h-14 gap-2 text-base"
      >
        <Target className="size-5" />
        Turn it on yourself
      </Button>
      <Button
        size="lg"
        variant="destructive"
        disabled={disabled}
        onClick={onFireOpponent}
        className="h-14 gap-2 text-base"
      >
        <Crosshair className="size-5" />
        Aim at {opponentName}
      </Button>
    </div>
  );
}
