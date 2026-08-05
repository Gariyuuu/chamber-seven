import { Button } from "@/components/ui/button";
import { Crosshair, Target } from "lucide-react";

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
      className="h-14 w-full gap-2 text-base"
    >
      {isSelf ? <Target className="size-5" /> : <Crosshair className="size-5" />}
      {isSelf ? "Turn it on yourself" : `Aim at ${targetName}`}
    </Button>
  );
}
